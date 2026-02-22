import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Reads ALLOWED_ORIGIN from environment variable (set on Render)
// Example: https://joaopedrotonello.github.io
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";
app.use(cors({
  origin: ALLOWED_ORIGIN,
  credentials: true,
  methods: ["POST", "GET", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));
app.use(express.json({ limit: "1mb" }));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
// Max 15 requests per IP per 10 minutes
const rateLimitMap = new Map();
const RATE_LIMIT_MAX = 15;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count += 1;
  return true;
}

// Clean up old entries every 30 minutes
setInterval(() => {
  const now = Date.now();
  rateLimitMap.forEach((entry, ip) => {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  });
}, 30 * 60 * 1000);

// ─── Portfolio Data ───────────────────────────────────────────────────────────
function loadPortfolioData() {
  try {
    const dataPath = path.resolve(__dirname, "data.json");
    return fs.readFileSync(dataPath, "utf-8");
  } catch (err) {
    console.error("[Backend] Could not load data.json:", err.message);
    return "{}";
  }
}

// ─── System Prompt ────────────────────────────────────────────────────────────
function buildSystemPrompt(portfolioJson) {
  return `You are an enthusiastic, warm, and highly knowledgeable AI assistant representing João Pedro Tonello's professional portfolio.

Your personality:
- You are genuinely excited about João's work and accomplishments — you believe he is an exceptional professional
- You highlight his strengths naturally and enthusiastically, without being robotic or over-the-top
- You speak with confidence and admiration about his projects and skills
- You are friendly, conversational, and engaging — like a proud colleague who knows João's work inside and out
- When asked about a specific project or topic, go deep — share the context, the challenge, the solution, and the business impact

Your rules:
- Answer questions based ONLY on the data provided below about João
- If asked something not covered by the data, say you don't have that specific information but pivot to something impressive you DO know about him
- Respond in the same language the user writes in (English or Portuguese)
- When asked "why should I hire João?" or similar questions, give a compelling, enthusiastic answer highlighting his unique combination of AI engineering depth, business impact, and proven delivery in production environments
- When asked about a project, include: what problem it solved, the technical approach, and the measurable business impact
- When asked about experience, mention specific companies, roles, technologies, and outcomes
- When asked about skills or technologies, be specific and connect them to real projects he has delivered
- Never make up facts — only use what's in the data
- Refer to him as "João" or "João Pedro" — never "I" (you are his AI assistant, not him)
- Give thorough answers — do not cut yourself short when the user is asking for details

Tone examples:
- Instead of "He has experience with Python" → "João is highly proficient in Python and has used it to build production-grade ML systems at Demarest and Zurich Insurance"
- Instead of "He worked at Zurich" → "At Zurich Insurance (2022–2025), João built a subrogation prioritization system that recovered 2% of previously missed claims, generating millions in annualized revenue"
- When describing projects, always include the business value, technical sophistication, and measurable outcomes

Here is João Pedro Tonello's complete portfolio and resume data (use ALL of this information to answer questions):

${portfolioJson}`;
}

// ─── Chat Endpoint ────────────────────────────────────────────────────────────
app.post("/api/chat", async (req, res) => {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  if (!checkRateLimit(ip)) {
    return res.status(429).json({
      error: "Too many requests. Please wait a few minutes before asking again.",
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "Chat service is not configured. Please contact the site owner.",
    });
  }

  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Invalid messages format." });
  }

  const portfolioData = loadPortfolioData();
  const systemPrompt = buildSystemPrompt(portfolioData);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-30).map((m) => ({
            role: m.role,
            content: String(m.content).slice(0, 2000),
          })),
        ],
        max_tokens: 1200,
        temperature: 0.75,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Chat] OpenAI error:", errorText);
      if (response.status === 429) {
        return res.status(429).json({
          error: "The AI service is busy right now. Please try again in a moment.",
        });
      }
      return res.status(500).json({
        error: "The AI assistant is temporarily unavailable. Please try again shortly.",
      });
    }

    const data = await response.json();
    const content =
      data.choices?.[0]?.message?.content ??
      "Sorry, I couldn't generate a response. Please try again.";

    return res.json({ content });
  } catch (err) {
    console.error("[Chat] Unexpected error:", err);
    return res.status(500).json({ error: "An unexpected error occurred. Please try again." });
  }
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
