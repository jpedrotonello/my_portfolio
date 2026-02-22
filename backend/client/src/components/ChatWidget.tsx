import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { X, Send, User, Loader2, MessageCircle, Sparkles } from "lucide-react";
import { Streamdown } from "streamdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content: "Hi! I'm João's AI assistant — ask me anything about his experience, projects, or skills! 🚀",
};

const SUGGESTED_QUESTIONS = [
  "What are your main AI skills?",
  "Tell me about your best project",
  "What's your work experience?",
  "Why should I hire João?",
];

interface ChatWidgetProps {
  ownerName: string;
  externalOpen?: boolean;
  onExternalOpenHandled?: () => void;
}

// Auto-open on desktop only (screen width > 900px)
function useAutoOpen() {
  const [autoOpened, setAutoOpened] = useState(false);
  useEffect(() => {
    if (window.innerWidth >= 900 && !autoOpened) {
      const timer = setTimeout(() => {
        setAutoOpened(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);
  return autoOpened;
}

export default function ChatWidget({ ownerName, externalOpen, onExternalOpenHandled }: ChatWidgetProps) {
  const autoOpen = useAutoOpen();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendMessage = trpc.chat.sendMessage.useMutation();

  // Apply auto-open when ready
  useEffect(() => {
    if (autoOpen) setIsOpen(true);
  }, [autoOpen]);

  // Handle external open trigger (from header button)
  useEffect(() => {
    if (externalOpen) {
      setIsOpen(true);
      onExternalOpenHandled?.();
    }
  }, [externalOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

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
          content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
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
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm shadow-2xl rounded-2xl border border-border bg-card flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200"
          style={{ height: "min(500px, calc(100vh - 130px))" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary/5">
            <div className="flex items-center gap-2.5">
              {/* João's photo in chat header */}
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary/40 flex-shrink-0">
                <img
                  src="/profile.jpg"
                  alt={ownerName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  Ask about {firstName}
                  <Sparkles size={12} className="text-primary" />
                </p>
                <p className="text-xs text-muted-foreground">AI-powered · answers instantly</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-7 w-7 p-0 rounded-full"
            >
              <X size={14} />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
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
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
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
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full flex-shrink-0 overflow-hidden mt-0.5 border border-border">
                  <img src="/profile.jpg" alt={ownerName} className="w-full h-full object-cover" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2">
                  <Loader2 size={14} className="text-muted-foreground animate-spin" />
                </div>
              </div>
            )}

            {/* Suggested questions */}
            {messages.length === 1 && !isLoading && (
              <div className="space-y-1.5 pt-1">
                <p className="text-xs text-muted-foreground px-1">Try asking:</p>
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="w-full text-left text-xs px-3 py-2 rounded-xl border border-border bg-background hover:bg-muted hover:border-primary/40 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border">
            <div className="flex gap-2 items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="flex-1 min-w-0 text-sm bg-muted border border-border rounded-xl px-3 py-2 outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground disabled:opacity-50 transition-colors"
              />
              <Button
                size="sm"
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="h-9 w-9 p-0 rounded-xl flex-shrink-0"
              >
                <Send size={14} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button — prominent with label, smaller on mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : `Ask about ${firstName}`}
        className={`
          fixed bottom-5 right-4 sm:right-6 z-50
          flex items-center gap-2
          shadow-lg transition-all duration-200
          hover:scale-105 active:scale-95
          ${isOpen
            ? "bg-muted text-muted-foreground border border-border rounded-full px-3 py-2.5"
            : "bg-primary text-primary-foreground rounded-full px-4 py-3 sm:px-5"
          }
        `}
      >
        {isOpen ? (
          <X size={18} />
        ) : (
          <>
            <MessageCircle size={18} className="flex-shrink-0" />
            {/* Label: visible on all screens but shorter on mobile */}
            <span className="text-sm font-semibold whitespace-nowrap hidden xs:inline sm:inline">
              Ask about {firstName}
            </span>
            <span className="text-sm font-semibold whitespace-nowrap xs:hidden sm:hidden inline">
              Ask me
            </span>
          </>
        )}
      </button>
    </>
  );
}
