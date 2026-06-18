"use client";

import { useState } from "react";
import { useWorkflowStore } from "@/workflows/store";
import {
  Workflow,
  WorkflowStep,
  WorkflowTrigger,
  StepConfig,
  AgentTaskConfig,
  SkillCallConfig,
  ConditionConfig,
  DelayConfig,
  TransformConfig,
  OutputConfig,
} from "@/workflows/types";

interface WorkflowBuilderProps {
  workflow: Workflow;
  onClose: () => void;
}

export function WorkflowBuilder({ workflow, onClose }: WorkflowBuilderProps) {
  const { updateWorkflow, addStep, removeStep } = useWorkflowStore();
  const [activeTab, setActiveTab] = useState<"steps" | "variables" | "settings">("steps");
  const [showAddStep, setShowAddStep] = useState(false);

  const handleAddStep = (type: WorkflowStep["type"]) => {
    const step: WorkflowStep = {
      id: `step_${Date.now()}`,
      type,
      name: `New ${type.replace("_", " ")} step`,
      config: getDefaultConfig(type),
      onError: "stop",
    };
    addStep(workflow.id, step);
    setShowAddStep(false);
  };

  return (
    <div className="flex flex-col h-full bg-background-primary">
      <header className="flex items-center justify-between px-6 h-16 border-b border-background-tertiary bg-background-secondary">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-background-tertiary rounded-lg transition-colors duration-150"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <input
            type="text"
            value={workflow.name}
            onChange={(e) => updateWorkflow(workflow.id, { name: e.target.value })}
            className="text-lg font-semibold text-text-primary bg-transparent border-none focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={workflow.status}
            onChange={(e) => updateWorkflow(workflow.id, { status: e.target.value as Workflow["status"] })}
            className="px-3 py-1.5 text-xs font-medium bg-background-tertiary border border-background-tertiary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        <nav className="w-48 border-r border-background-tertiary bg-background-secondary p-4">
          <div className="space-y-1">
            {(["steps", "variables", "settings"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors duration-150 ${
                  activeTab === tab
                    ? "bg-accent-primary/10 text-accent-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-background-tertiary"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </nav>

        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === "steps" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text-primary">Steps</h3>
                <button
                  onClick={() => setShowAddStep(true)}
                  className="px-3 py-1.5 text-xs font-medium text-accent-primary bg-accent-primary/10 rounded-lg hover:bg-accent-primary/20 transition-colors duration-150"
                >
                  + Add Step
                </button>
              </div>

              {showAddStep && (
                <div className="p-4 bg-background-secondary rounded-lg border border-background-tertiary">
                  <p className="text-xs text-text-muted mb-3">Select step type:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(["agent_task", "skill_call", "condition", "delay", "transform", "output"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => handleAddStep(type)}
                        className="px-3 py-2 text-xs font-medium text-text-secondary bg-background-tertiary rounded-lg hover:text-text-primary hover:bg-accent-primary/10 transition-colors duration-150"
                      >
                        {type.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowAddStep(false)}
                    className="mt-2 text-xs text-text-muted hover:text-text-primary"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {workflow.steps.map((step, index) => (
                <div
                  key={step.id}
                  className="p-4 bg-background-secondary rounded-lg border border-background-tertiary"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-accent-primary/20 flex items-center justify-center text-xs text-accent-primary">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{step.name}</p>
                        <p className="text-xs text-text-muted">{step.type.replace("_", " ")}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeStep(workflow.id, step.id)}
                      className="p-1.5 text-text-muted hover:text-accent-danger hover:bg-accent-danger/10 rounded-lg transition-colors duration-150"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              {workflow.steps.length === 0 && !showAddStep && (
                <div className="text-center py-8">
                  <p className="text-sm text-text-muted">No steps yet. Click Add Step to begin.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "variables" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-text-primary">Variables</h3>
              {workflow.variables.length === 0 ? (
                <p className="text-sm text-text-muted">No variables defined.</p>
              ) : (
                <div className="space-y-2">
                  {workflow.variables.map((v) => (
                    <div key={v.name} className="p-3 bg-background-secondary rounded-lg border border-background-tertiary">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-text-primary">{v.name}</span>
                        <span className="text-xs text-text-muted">{v.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-text-primary">Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-text-muted">Description</label>
                  <textarea
                    value={workflow.description}
                    onChange={(e) => updateWorkflow(workflow.id, { description: e.target.value })}
                    rows={3}
                    className="w-full mt-1 px-3 py-2 bg-background-tertiary border border-background-tertiary rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted">Trigger Type</label>
                  <select
                    value={workflow.trigger.type}
                    onChange={(e) =>
                      updateWorkflow(workflow.id, {
                        trigger: { ...workflow.trigger, type: e.target.value as WorkflowTrigger["type"] },
                      })
                    }
                    className="w-full mt-1 px-3 py-2 bg-background-tertiary border border-background-tertiary rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  >
                    <option value="manual">Manual</option>
                    <option value="schedule">Schedule</option>
                    <option value="event">Event</option>
                    <option value="voice">Voice</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function getDefaultConfig(type: WorkflowStep["type"]): StepConfig {
  switch (type) {
    case "agent_task":
      return { agentType: "orchestrator", action: "", params: {} } as AgentTaskConfig;
    case "skill_call":
      return { skillId: "", params: {} } as SkillCallConfig;
    case "condition":
      return { field: "", operator: "equals", value: "" } as ConditionConfig;
    case "delay":
      return { duration: 1000, unit: "ms" } as DelayConfig;
    case "transform":
      return { inputField: "", outputField: "", transform: "uppercase" } as TransformConfig;
    case "output":
      return { format: "text", template: "" } as OutputConfig;
    default:
      return { format: "text" } as OutputConfig;
  }
}
