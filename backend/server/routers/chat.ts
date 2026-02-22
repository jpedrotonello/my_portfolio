import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
// Simple in-memory rate limiter: max 15 requests per IP per 10 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 15;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function checkRateLimit(ip: string): void {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Too many requests. Please wait a few minutes before asking again.`,
    });
  }

  entry.count += 1;
}

// Clean up old entries every 30 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  rateLimitMap.forEach((entry, ip) => {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  });
}, 30 * 60 * 1000);

// ─── Portfolio Data ───────────────────────────────────────────────────────────
function loadPortfolioData(): string {
  try {
    const dataPath = path.resolve(__dirname, "../../client/public/data.json");
    const raw = fs.readFileSync(dataPath, "utf-8");
    return raw;
  } catch {
    return "{}";
  }
}

// ─── System Prompt ────────────────────────────────────────────────────────────
function buildSystemPrompt(portfolioJson: string): string {
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

// ─── Router ───────────────────────────────────────────────────────────────────
export const chatRouter = router({
  sendMessage: publicProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string().max(2000), // Limit message length
          })
        ).max(30), // Limit conversation history
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Rate limiting by IP
      const ip =
        (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        (ctx.req as unknown as { socket?: { remoteAddress?: string } }).socket?.remoteAddress ||
        "unknown";
      checkRateLimit(ip);

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Chat service is not configured. Please contact the site owner.",
        });
      }

      const portfolioData = loadPortfolioData();
      const systemPrompt = buildSystemPrompt(portfolioData);

      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...input.messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];

      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages,
            max_tokens: 1200,
            temperature: 0.75,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("[Chat] OpenAI error:", errorText);

          // Don't expose raw OpenAI errors to the client
          if (response.status === 429) {
            throw new TRPCError({
              code: "TOO_MANY_REQUESTS",
              message: "The AI service is busy right now. Please try again in a moment.",
            });
          }

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "The AI assistant is temporarily unavailable. Please try again shortly.",
          });
        }

        const data = (await response.json()) as {
          choices: Array<{ message: { content: string } }>;
        };
        const content =
          data.choices[0]?.message?.content ??
          "Sorry, I couldn't generate a response. Please try again.";

        return { content };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        console.error("[Chat] Unexpected error:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred. Please try again.",
        });
      }
    }),
});
