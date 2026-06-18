"use client";

interface AgentStatusProps {
  agentName: string;
  status: "idle" | "listening" | "thinking" | "executing" | "speaking" | "error";
  task?: string;
}

const STATUS_CONFIG = {
  idle: {
    label: "Ready",
    color: "text-text-muted",
    bgColor: "bg-text-muted/10",
    dotColor: "bg-text-muted",
  },
  listening: {
    label: "Listening",
    color: "text-status-listening",
    bgColor: "bg-status-listening/10",
    dotColor: "bg-status-listening",
  },
  thinking: {
    label: "Thinking",
    color: "text-status-thinking",
    bgColor: "bg-status-thinking/10",
    dotColor: "bg-status-thinking",
  },
  executing: {
    label: "Executing",
    color: "text-status-executing",
    bgColor: "bg-status-executing/10",
    dotColor: "bg-status-executing",
  },
  speaking: {
    label: "Speaking",
    color: "text-status-speaking",
    bgColor: "bg-status-speaking/10",
    dotColor: "bg-status-speaking",
  },
  error: {
    label: "Error",
    color: "text-status-error",
    bgColor: "bg-status-error/10",
    dotColor: "bg-status-error",
  },
};

export function AgentStatus({ agentName, status, task }: AgentStatusProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-lg ${config.bgColor}`}>
      <div className={`w-2 h-2 rounded-full ${config.dotColor} ${status !== "idle" ? "animate-pulse" : ""}`} />
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${config.color}`}>
            {agentName}
          </span>
          <span className={`text-xs ${config.color}`}>
            {config.label}
          </span>
        </div>
        {task && (
          <span className="text-xs text-text-muted truncate max-w-48">
            {task}
          </span>
        )}
      </div>
    </div>
  );
}
