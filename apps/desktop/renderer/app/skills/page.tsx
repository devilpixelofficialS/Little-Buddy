"use client";

import { AppLayout } from "@/components/layout/app-layout";

export default function SkillsPage() {
  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <header className="flex items-center justify-between px-6 h-16 border-b border-background-tertiary bg-background-secondary">
          <h1 className="text-lg font-semibold text-text-primary">Skills Marketplace</h1>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-accent-primary/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-text-primary mb-2">Skills Marketplace</h2>
            <p className="text-sm text-text-secondary">Coming soon - Browse and install skills</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
