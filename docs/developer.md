# Developer Guide

## Project Structure

```
little-buddy/
├── apps/desktop/
│   ├── electron/          # Electron main process
│   │   ├── main.ts        # Entry point, IPC handlers
│   │   ├── preload.ts     # Context bridge
│   │   └── modules/       # Dynamic imports
│   └── renderer/          # Next.js frontend
│       ├── app/           # Pages and layouts
│       └── public/        # Static assets
├── src/
│   ├── agents/            # Multi-agent system
│   ├── auth/              # Authentication
│   ├── automation/        # Desktop automation
│   ├── components/        # React components
│   │   ├── auth/          # Auth components
│   │   ├── chat/          # Chat UI
│   │   ├── layout/        # App layout
│   │   ├── settings/      # Settings UI
│   │   ├── ui/            # Reusable UI
│   │   └── voice/         # Voice components
│   ├── lib/               # Utilities
│   │   ├── db/            # Database client
│   │   └── ipc/           # IPC definitions
│   ├── memory/            # Memory system
│   ├── skills/            # Skills framework
│   ├── stores/            # Zustand stores
│   ├── voice/             # Voice engine
│   ├── vision/            # Vision system
│   └── workflows/         # Workflow engine
├── prisma/                # Database schema
└── docs/                  # Documentation
```

## Development Workflow

### 1. Start Development

```bash
npm run dev
```

This starts both Next.js (port 3000) and Electron.

### 2. Make Changes

- **Frontend**: Edit files in `src/` or `apps/desktop/renderer/`
- **Electron**: Edit files in `apps/desktop/electron/`
- **Database**: Edit `prisma/schema.prisma`

### 3. Test Changes

```bash
npm run typecheck    # Check types
npm run lint         # Check linting
npm test             # Run tests
```

### 4. Build

```bash
npm run build        # Production build
```

## Adding a New Feature

### 1. Create Types

```typescript
// src/my-feature/types.ts
export interface MyFeature {
  id: string;
  name: string;
  // ...
}
```

### 2. Create Store (if needed)

```typescript
// src/stores/my-feature-store.ts
import { create } from "zustand";

interface MyFeatureState {
  items: MyFeature[];
  addItem: (item: MyFeature) => void;
}

export const useMyFeatureStore = create<MyFeatureState>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
}));
```

### 3. Create Hook (if needed)

```typescript
// src/my-feature/useMyFeature.ts
"use client";

import { useMyFeatureStore } from "@/stores/my-feature-store";

export function useMyFeature() {
  const { items, addItem } = useMyFeatureStore();
  
  return { items, addItem };
}
```

### 4. Create Components

```typescript
// src/components/my-feature/my-feature.tsx
"use client";

import { useMyFeature } from "@/my-feature/useMy-feature";

export function MyFeature() {
  const { items } = useMyFeature();
  
  return (
    <div>
      {items.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

### 5. Create Page

```typescript
// apps/desktop/renderer/app/my-feature/page.tsx
import { MyFeature } from "@/components/my-feature/my-feature";

export default function MyFeaturePage() {
  return (
    <div>
      <h1>My Feature</h1>
      <MyFeature />
    </div>
  );
}
```

## Adding IPC Channels

### 1. Define Channel

```typescript
// src/lib/ipc/channels.ts
export const IPC_CHANNELS = {
  MY_FEATURE: {
    ACTION: "my-feature:action",
  },
} as const;
```

### 2. Add Handler (Electron)

```typescript
// apps/desktop/electron/main.ts
ipcMain.handle("my-feature:action", async (_event, args) => {
  // Handle action
  return { success: true };
});
```

### 3. Use in Renderer

```typescript
const result = await window.electron.invoke("my-feature:action", args);
```

## Adding a New Agent

### 1. Create Agent

```typescript
// src/agents/my-agent.ts
import { BaseAgent, AgentConfig, AgentResult } from "./types";

export class MyAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super(config);
  }

  async execute(input: string): Promise<AgentResult> {
    // Agent logic
    return { success: true, output: "result" };
  }
}
```

### 2. Register Agent

```typescript
// src/agents/runtime.ts
const agents = {
  myAgent: new MyAgent({ ... }),
};
```

## Adding a New Skill

### 1. Create Skill Directory

```
src/skills/my-skill/
├── index.ts        # Skill definition
├── types.ts        # Types
└── actions/        # Action handlers
    └── my-action.ts
```

### 2. Define Skill

```typescript
// src/skills/my-skill/index.ts
import { Skill } from "../types";

export const mySkill: Skill = {
  id: "my-skill",
  name: "My Skill",
  description: "Does something useful",
  version: "1.0.0",
  actions: [
    {
      id: "my-action",
      name: "My Action",
      description: "Performs my action",
      parameters: {
        input: { type: "string", required: true },
      },
    },
  ],
  async execute(actionId, params) {
    // Handle action
    return { result: "done" };
  },
};
```

### 3. Register Skill

```typescript
// src/skills/registry.ts
import { mySkill } from "./my-skill";

const skills = [mySkill];
```

## Code Style

### TypeScript

- Use strict mode
- Avoid `any` types
- Use interfaces over types where possible
- Export types alongside implementations

### React

- Use functional components
- Use hooks for state and effects
- Keep components small and focused
- Use proper TypeScript props

### Naming

- Files: `kebab-case.ts`, `kebab-case.tsx`
- Components: `PascalCase`
- Functions: `camelCase`
- Types/Interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`

## Testing

### Unit Tests

```typescript
// src/__tests__/my-module.test.ts
import { myFunction } from "@/my-module";

describe("myFunction", () => {
  it("should do something", () => {
    const result = myFunction("input");
    expect(result).toBe("expected");
  });
});
```

### Component Tests

```typescript
// src/__tests__/my-component.test.tsx
import { render, screen } from "@testing-library/react";
import { MyComponent } from "@/components/my-component";

describe("MyComponent", () => {
  it("should render", () => {
    render(<MyComponent />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
```

### Run Tests

```bash
npm test                  # All tests
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage
```

## Database Changes

### 1. Edit Schema

```prisma
// prisma/schema.prisma
model MyModel {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
}
```

### 2. Push to Database

```bash
npx prisma db push
```

### 3. Generate Client

```bash
npx prisma generate
```

## Common Tasks

### Add a New Page

1. Create `apps/desktop/renderer/app/my-page/page.tsx`
2. Add to sidebar in `src/components/layout/sidebar.tsx`

### Add a New Store

1. Create `src/stores/my-store.ts`
2. Export hook `useMyStore`

### Add IPC Handler

1. Add channel to `src/lib/ipc/channels.ts`
2. Add handler in `apps/desktop/electron/main.ts`
3. Use with `window.electron.invoke()`

## Debugging

### Electron DevTools

- Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac)

### Next.js DevTools

- Navigate to `http://localhost:3000`

### Database

```bash
npx prisma studio
```

### Logs

Check terminal output for:
- Next.js: Development server logs
- Electron: Main process logs
- Browser: Renderer console
