# Architecture

## System Overview

Little Buddy is a desktop-first AI assistant built on Electron with a Next.js renderer. The system uses a multi-agent architecture where specialized agents handle different tasks, coordinated by an orchestrator.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Electron Main Process                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Voice Engine │  │   Agent     │  │   Desktop          │ │
│  │  - WakeWord │  │   Runtime   │  │   Automation       │ │
│  │  - STT      │  │  - Orchestr │  │  - Screen Capture  │ │
│  │  - TTS      │  │  - Planner  │  │  - Mouse/Keyboard  │ │
│  └─────────────┘  │  - Context  │  │  - App Control     │ │
│                   │  - Execution│  └─────────────────────┘ │
│                   └─────────────┘                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Database   │  │   Vision    │  │   Workflow          │ │
│  │  - Prisma   │  │   System    │  │   Engine            │ │
│  │  - Postgres │  │  - Capture  │  │  - Executor         │ │
│  │  - Repos    │  │  - Analysis │  │  - Scheduler        │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                     IPC (invoke/on)
                            │
┌─────────────────────────────────────────────────────────────┐
│                   Next.js Renderer Process                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Pages     │  │  Components │  │     Hooks           │ │
│  │  - /        │  │  - VoiceOrb │  │  - useAuth          │ │
│  │  - /memory  │  │  - ChatView │  │  - useVoice         │ │
│  │  - /skills  │  │  - Settings │  │  - useMemory        │ │
│  │  - /workflows│ │  - Layout   │  │  - useSkills        │ │
│  │  - /settings│  │             │  │  - useAutomation    │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    Zustand Stores                        ││
│  │  - app-store  - voice-store  - agent-store  - settings  ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Agent System

### Agent Hierarchy

```
OrchestratorAgent (Main Coordinator)
├── PlannerAgent (Task Decomposition)
├── ContextAgent (Memory & History)
└── ExecutionAgent (Task Execution)
```

### Agent Lifecycle

1. **Receive** - Agent receives a task message
2. **Analyze** - Agent analyzes the task and determines approach
3. **Plan** - Planner breaks down complex tasks
4. **Execute** - Execution agent runs sub-tasks
5. **Report** - Results are returned and stored

### Agent Types

| Agent | Purpose | Location |
|-------|---------|----------|
| Orchestrator | Routes tasks to appropriate agents | `src/agents/orchestrator.ts` |
| Planner | Decomposes complex tasks | `src/agents/planner.ts` |
| Context | Manages memory and history | `src/agents/context.ts` |
| Execution | Runs desktop actions | `src/agents/execution.ts` |
| Memory | Long-term memory operations | `src/memory/agent.ts` |
| Vision | Screen analysis | `src/vision/agent.ts` |

## Voice Engine

### Voice Pipeline

```
Wake Word Detection
       │
       ▼
Speech-to-Text (Whisper)
       │
       ▼
Agent Processing
       │
       ▼
Text-to-Speech (Kokoro)
       │
       ▼
Audio Playback
```

### Voice States

| State | Description |
|-------|-------------|
| idle | Waiting for wake word |
| listening | Recording audio |
| processing | Converting speech to text |
| thinking | Agent processing |
| speaking | Playing TTS audio |
| error | Error occurred |

## Memory System

### Memory Types

| Type | Purpose | Storage |
|------|---------|---------|
| Semantic | Facts and knowledge | Vector DB |
| Episodic | Past experiences | PostgreSQL |
| Procedural | How-to knowledge | Vector DB |
| Working | Current context | In-memory |

### Memory Flow

```
Input → Context Agent → Memory Search → Relevant Memories
                                          │
                                          ▼
                              Agent Processing
                                          │
                                          ▼
                              Memory Storage (new)
```

## Desktop Automation

### Automation Capabilities

| Category | Actions |
|----------|---------|
| Mouse | click, doubleClick, rightClick, scroll, move |
| Keyboard | type, press, hotkey, shortcut |
| Screen | capture, findElement, ocr, screenshot |
| Window | focus, minimize, maximize, close, resize |
| App | launch, list, focus, close |
| File | read, write, copy, move, delete |
| System | clipboard, notification, volume |

### Automation Flow

```
Agent Request → Validation → Execution → Result
                         │
                         ▼
                    Error Handling
                    Retry Logic
                    Logging
```

## Vision System

### Vision Pipeline

```
Screen Capture
      │
      ▼
Image Analysis
      │
      ├──→ Element Detection
      ├──→ Text Extraction (OCR)
      ├──→ Color Analysis
      └──→ Layout Understanding
```

### Vision Capabilities

- Screenshot capture
- UI element detection
- Text extraction (OCR)
- Color and pattern analysis
- Layout understanding

## Workflow Engine

### Workflow Components

```
Workflow
├── Trigger (manual, schedule, event, voice)
├── Variables (input/output)
├── Steps (sequential or parallel)
│   ├── Agent Task
│   ├── Skill Call
│   ├── Condition
│   ├── Delay
│   ├── Parallel
│   ├── Transform
│   └── Output
└── Runs (execution history)
```

### Workflow Execution

```
Trigger → Initialize Variables → Execute Steps → Collect Output
                         │
                         ▼
                    Step-by-Step
                    ├── On Success → Next Step
                    ├── On Error → Retry/Stop/Continue
                    └── On Complete → Output
```

## Skills Framework

### Skill Structure

```
Skill
├── Metadata (name, description, version)
├── Actions (list of available actions)
├── Config (JSON schema)
├── Execute (action handler)
└── Cleanup (resource cleanup)
```

### Built-in Skills

| Skill | Purpose |
|-------|---------|
| browser | Web browsing automation |
| desktop | Desktop automation |
| filesystem | File operations |
| memory | Memory management |
| vision | Screen analysis |
| workflow | Workflow execution |

## Database Schema

### Core Models

| Model | Purpose |
|-------|---------|
| User | User accounts |
| UserSettings | User preferences |
| Conversation | Chat sessions |
| Message | Chat messages |
| Memory | Long-term memory |
| Skill | Available skills |
| SkillExecution | Skill run history |
| Workflow | Automation workflows |
| WorkflowExecution | Workflow run history |
| ExecutionHistory | All action history |

## State Management

### Zustand Stores

| Store | Purpose |
|-------|---------|
| app-store | Global app state |
| voice-store | Voice engine state |
| agent-store | Agent runtime state |
| settings-store | User settings |

### Store Structure

```typescript
interface Store {
  // State
  data: Type[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setData: (data: Type[]) => void;
  clearError: () => void;
}
```

## IPC Communication

### Channel Pattern

```
renderer → main:   "module:action"
main → renderer:   "module:event"
```

### IPC Modules

| Module | Channels |
|--------|----------|
| voice | voice:start, voice:stop, voice:status |
| db | db:conversations:*, db:messages:* |
| agent | agent:process, agent:status |
| vision | vision:capture, vision:analyze |
| auth | auth:login, auth:register |
