"use client";

import { useState, useCallback } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { AuthGuard } from "@/components/auth/auth-guard";
import { VoiceOrb, OrbState } from "@/components/voice/voice-orb";
import { AgentStatus } from "@/components/voice/agent-status";
import { ChatView } from "@/components/chat/chat-view";
import { Message } from "@/components/chat/chat-message";
import { useAuth } from "@/auth";

function AssistantPage() {
  const { user, logout } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [orbState, setOrbState] = useState<OrbState>("idle");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
      status: "sent",
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setOrbState("thinking");

    try {
      const response = await window.electron?.invoke("agent:process", content);
      const assistantMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: "assistant",
        content: (response as string) || "I received your message. The agent system is not fully connected yet.",
        timestamp: new Date(),
        status: "sent",
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setOrbState("speaking");
    } catch {
      const errorMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: "assistant",
        content: "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
        status: "error",
      };
      setMessages((prev) => [...prev, errorMessage]);
      setOrbState("error");
    } finally {
      setIsLoading(false);
      setTimeout(() => setOrbState("idle"), 2000);
    }
  }, []);

  const handleOrbClick = () => {
    if (orbState === "idle") {
      setOrbState("listening");
      setTimeout(() => setOrbState("idle"), 3000);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <header className="flex items-center justify-between px-6 h-16 border-b border-background-tertiary bg-background-secondary">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-text-primary">Assistant</h1>
            <AgentStatus
              agentName="Orchestrator"
              status={orbState === "idle" ? "idle" : orbState}
              task={isLoading ? "Processing..." : undefined}
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-secondary">{user?.email}</span>
            <button
              onClick={() => setMessages([])}
              className="px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-background-tertiary rounded-lg transition-colors duration-150"
            >
              Clear Chat
            </button>
            <button
              onClick={logout}
              className="px-3 py-1.5 text-xs font-medium text-accent-danger hover:bg-accent-danger/10 rounded-lg transition-colors duration-150"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 min-h-0">
            <ChatView
              messages={messages}
              onSend={handleSend}
              isLoading={isLoading}
            />
          </div>

          <div className="flex items-center justify-center py-6 border-t border-background-tertiary bg-background-secondary">
            <VoiceOrb
              state={orbState}
              onClick={handleOrbClick}
              size="md"
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default function Home() {
  return (
    <AuthGuard>
      <AssistantPage />
    </AuthGuard>
  );
}
