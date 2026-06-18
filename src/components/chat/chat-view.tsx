"use client";

import { useEffect, useRef } from "react";
import { ChatMessage, Message } from "./chat-message";
import { ChatInput } from "./chat-input";

interface ChatViewProps {
  messages: Message[];
  onSend: (message: string) => void;
  isLoading?: boolean;
}

export function ChatView({ messages, onSend, isLoading = false }: ChatViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-16 h-16 rounded-full bg-accent-primary/10 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-accent-primary/30" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-text-primary">
                Start a conversation
              </h3>
              <p className="text-sm text-text-secondary mt-1">
                Type a message or use voice to interact with Little Buddy
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-start py-2">
                <div className="bg-background-tertiary rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <ChatInput onSend={onSend} disabled={isLoading} />
    </div>
  );
}
