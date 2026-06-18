# AI Workflow Rules

## ⚠️ Local Development Only

This project runs locally.

Do NOT use or reference Bolt, Base44, Lovable, v0,
Replit, StackBlitz, or any cloud-based app builder.

All commands run in a local terminal.

All files live in a local repo opened in Cursor,
VS Code, or Claude Code.

---

## General Behavior Rules

The AI agent must:

1. Read AGENTS.md first.
2. Follow mandatory reading order.
3. Complete one task at a time.
4. Update progress-tracker.md after every completed milestone.
5. Prefer existing architecture before introducing new patterns.
6. Keep all modules loosely coupled.
7. Maintain strict TypeScript compliance.
8. Prioritize maintainability over shortcuts.
9. Build production-ready implementations.
10. Never generate placeholder implementations.

---

## Development Standards

Every implementation must include:

* Types
* Validation
* Error handling
* Loading states
* Logging

Every feature must be:

* Testable
* Modular
* Reusable

---

## Code Style Standards

### TypeScript

```text
strict = true
no any types
prefer interfaces
```

### React

Use:

* Server Components where possible
* Client Components only when required

---

### State Management

Use Zustand.

Avoid:

* Global Context overuse
* Unnecessary stores

---

### Styling

Use:

* Tailwind
* shadcn/ui

Avoid:

* Inline styles
* CSS frameworks

---

## File Conventions

### Components

```text
PascalCase.tsx
```

Example:

```text
VoiceOrb.tsx
AgentConsole.tsx
```

---

### Hooks

```text
useVoice.ts
useAgentRuntime.ts
```

---

### Stores

```text
voice-store.ts
memory-store.ts
agent-store.ts
```

---

### Skills

```text
skills/
  desktop/
  browser/
  coding/
  research/
```

Each skill must expose:

```typescript
interface Skill {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  execute(): Promise<void>;
}
```

---

## AI Task Rules

### Build Order

Step 1

Project Setup

* Next.js
* Electron
* Prisma
* Tailwind

---

Step 2

Database Layer

* Prisma schema
* Database connection
* Repositories

---

Step 3

Authentication

* Clerk integration
* Session handling

---

Step 4

Voice System

* OpenWakeWord
* Whisper
* Kokoro

---

Step 5

Agent Runtime

* Orchestrator
* Planner
* Memory
* Execution

---

Step 6

Memory Layer

* Qdrant
* Mem0
* Retrieval pipeline

---

Step 7

Desktop Automation

* Nut.js
* System APIs

---

Step 8

Vision Layer

* Screen capture
* Vision analysis

---

Step 9

Skills Framework

* Registry
* Permissions
* Installation

---

Step 10

Workflow Automation

* Trigger.dev
* Agent workflows

---

## What NOT To Do

Never:

* Skip type definitions
* Use mock production logic
* Create duplicate abstractions
* Hardcode secrets
* Store credentials in source code
* Ignore accessibility
* Use deprecated libraries
* Add mobile-specific implementations

---

## Commit Message Format

Format:

```text
type(scope): summary
```

Examples:

```text
feat(voice): add wake word detection

feat(agent): implement planner runtime

fix(memory): improve retrieval ranking

refactor(skills): simplify registry
```

---

## Preferred Response Format For Agents

When performing tasks:

1. Explain objective.
2. Explain implementation plan.
3. Generate code.
4. Explain integration points.
5. Explain testing steps.
6. Update progress tracker.

Always provide:

* File paths
* Dependencies
* Configuration changes

Before completing any task:

* Verify build passes
* Verify types pass
* Verify lint passes

Definition of Done:

* Code compiles
* Feature works
* Tests pass
* Progress tracker updated
* Documentation updated
