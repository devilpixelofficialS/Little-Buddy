"use client";

import { Workflow } from "@/workflows/types";

interface WorkflowCardProps {
  workflow: Workflow;
  onSelect: (id: string) => void;
  onRun: (id: string) => void;
  onDelete: (id: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-text-muted/10 text-text-muted",
  active: "bg-accent-success/10 text-accent-success",
  paused: "bg-accent-warning/10 text-accent-warning",
  completed: "bg-accent-success/10 text-accent-success",
  failed: "bg-accent-danger/10 text-accent-danger",
};

export function WorkflowCard({ workflow, onSelect, onRun, onDelete }: WorkflowCardProps) {
  return (
    <div
      className="p-4 bg-background-secondary rounded-xl border border-background-tertiary hover:border-text-muted/30 transition-colors duration-150 cursor-pointer"
      onClick={() => onSelect(workflow.id)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-text-primary truncate">
            {workflow.name}
          </h3>
          <p className="text-xs text-text-muted mt-1 line-clamp-2">
            {workflow.description || "No description"}
          </p>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[workflow.status]}`}>
          {workflow.status}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-text-muted mb-3">
        <span>{workflow.steps.length} steps</span>
        <span>{workflow.variables.length} vars</span>
        <span>{workflow.runCount} runs</span>
        <span>v{workflow.version}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRun(workflow.id);
          }}
          disabled={workflow.status === "draft"}
          className="flex-1 px-3 py-1.5 text-xs font-medium text-accent-primary bg-accent-primary/10 rounded-lg hover:bg-accent-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
        >
          Run
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(workflow.id);
          }}
          className="px-3 py-1.5 text-xs font-medium text-accent-danger bg-accent-danger/10 rounded-lg hover:bg-accent-danger/20 transition-colors duration-150"
        >
          Delete
        </button>
      </div>

      {workflow.lastRunAt && (
        <p className="text-xs text-text-muted mt-2">
          Last run: {new Date(workflow.lastRunAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
