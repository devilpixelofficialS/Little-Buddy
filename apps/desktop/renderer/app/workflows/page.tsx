"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { WorkflowCard } from "@/components/workflows/workflow-card";
import { WorkflowBuilder } from "@/components/workflows/workflow-builder";
import { useWorkflowStore } from "@/workflows/store";
import { Workflow } from "@/workflows/types";

export default function WorkflowsPage() {
  const { workflows, createWorkflow, deleteWorkflow, activeWorkflowId, setActiveWorkflow } = useWorkflowStore();
  const [showBuilder, setShowBuilder] = useState(false);

  const activeWorkflow = workflows.find((w) => w.id === activeWorkflowId);

  const handleCreate = () => {
    const workflow = createWorkflow({
      name: "New Workflow",
      description: "A new automated workflow",
      trigger: { type: "manual", config: {}, enabled: true },
    });
    setActiveWorkflow(workflow.id);
    setShowBuilder(true);
  };

  const handleSelect = (id: string) => {
    setActiveWorkflow(id);
    setShowBuilder(true);
  };

  const handleRun = async (id: string) => {
    const workflow = workflows.find((w) => w.id === id);
    if (!workflow) return;
    alert(`Running workflow: ${workflow.name}`);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this workflow?")) {
      deleteWorkflow(id);
    }
  };

  if (showBuilder && activeWorkflow) {
    return (
      <AppLayout>
        <WorkflowBuilder
          workflow={activeWorkflow}
          onClose={() => {
            setShowBuilder(false);
            setActiveWorkflow(null);
          }}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <header className="flex items-center justify-between px-6 h-16 border-b border-background-tertiary bg-background-secondary">
          <h1 className="text-lg font-semibold text-text-primary">Workflows</h1>
          <button
            onClick={handleCreate}
            className="px-4 py-2 text-sm font-medium text-white bg-accent-primary rounded-lg hover:bg-accent-secondary transition-colors duration-150"
          >
            + New Workflow
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {workflows.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-16 h-16 rounded-full bg-accent-primary/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-medium text-text-primary mb-2">No workflows yet</h2>
                <p className="text-sm text-text-secondary mb-4">Create your first workflow to automate tasks</p>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 text-sm font-medium text-white bg-accent-primary rounded-lg hover:bg-accent-secondary transition-colors duration-150"
                >
                  Create Workflow
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workflows.map((workflow) => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  onSelect={handleSelect}
                  onRun={handleRun}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
