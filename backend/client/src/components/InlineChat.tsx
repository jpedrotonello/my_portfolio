import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Send, User, Loader2, Sparkles } from "lucide-react";
import { Streamdown } from "streamdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content:
    "Hi! I'm João's AI assistant. Ask me anything about his experience, projects, skills, or background — I know everything about him! 🚀",
};

const SUGGESTED_QUESTIONS = [
  "What are your main AI skills?",
  "Tell me about your best project",
  "What's your work experience?",
  "Why should I hire João?",
];

interface InlineChatProps {
  ownerName: string;
}

export default function InlineChat({ ownerName }: InlineChatProps) {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendMessage = trpc.chat.sendMessage.useMutation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text ?? input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = { role: "user", content: messageText };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const conversationHistory = updatedMessages.filter(
        (m) => m !== WELCOME_MESSAGE
      );

      const result = await sendMessage.mutateAsync({
        messages: conversationHistory,
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.content },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const firstName = ownerName.split(" ")[0];

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-primary/5">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/40 flex-shrink-0">
          <img
            src="/profile.jpg"
            alt={ownerName}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            Ask about {firstName}
            <Sparkles size={13} className="text-primary" />
          </p>
          <p className="text-xs text-muted-foreground">
            AI-powered · knows everything about {firstName}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        className="overflow-y-auto p-4 space-y-3"
        style={{ maxHeight: "420px", minHeight: "180px" }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2.5 ${
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Avatar */}
            <div className="w-7 h-7 rounded-full flex-shrink-0 overflow-hidden mt-0.5 border border-border">
              {msg.role === "assistant" ? (
                <img
                  src="/profile.jpg"
                  alt={ownerName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-secondary flex items-center justify-center">
                  <User size={12} className="text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : "bg-muted text-foreground rounded-tl-sm"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-strong:font-semibold prose-headings:text-sm prose-headings:font-semibold prose-headings:my-1">
                  <Streamdown>{msg.content}</Streamdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full flex-shrink-0 overflow-hidden mt-0.5 border border-border">
              <img
                src="/profile.jpg"
                alt={ownerName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-muted rounded-2xl rounded-tl-sm px-3.5 py-2.5">
              <Loader2 size={14} className="text-muted-foreground animate-spin" />
            </div>
          </div>
        )}

        {/* Suggested questions — shown only on first message */}
        {messages.length === 1 && !isLoading && (
          <div className="space-y-1.5 pt-1">
            <p className="text-xs text-muted-foreground px-1">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="text-left text-xs px-3 py-1.5 rounded-full border border-border bg-background hover:bg-muted hover:border-primary/40 transition-colors text-muted-foreground hover:text-foreground"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border bg-background/50">
        <div className="flex gap-2 items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask me anything about ${firstName}...`}
            disabled={isLoading}
            className="flex-1 min-w-0 text-sm bg-muted border border-border rounded-xl px-3.5 py-2.5 outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground disabled:opacity-50 transition-colors"
          />
          <Button
            size="sm"
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="h-10 w-10 p-0 rounded-xl flex-shrink-0"
          >
            <Send size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
