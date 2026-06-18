"use client";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  status?: "sending" | "sent" | "error";
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center py-2">
        <span className="text-xs text-text-muted px-3 py-1 bg-background-tertiary rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} py-2`}>
      <div
        className={`
          max-w-2xl px-4 py-3 rounded-2xl
          ${isUser
            ? "bg-accent-primary text-white rounded-br-md"
            : "bg-background-tertiary text-text-primary rounded-bl-md"
          }
        `}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
        <div className={`flex items-center gap-1 mt-1 ${isUser ? "justify-end" : "justify-start"}`}>
          <span className={`text-xs ${isUser ? "text-white/60" : "text-text-muted"}`}>
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {message.status === "error" && (
            <span className="text-xs text-accent-danger">Failed</span>
          )}
        </div>
      </div>
    </div>
  );
}
