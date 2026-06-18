# Architecture Context

## Tech Stack

| Layer              | Technology        |
| ------------------ | ----------------- |
| Desktop Framework  | Electron          |
| Frontend           | Next.js 15        |
| Language           | TypeScript Strict |
| Styling            | Tailwind CSS      |
| UI Components      | shadcn/ui         |
| State Management   | Zustand           |
| AI Models          | Claude Sonnet 4.6 |
| Agent Runtime      | OpenAI Agents SDK |
| Memory Layer       | Mem0              |
| Vector Database    | Qdrant            |
| Database           | PostgreSQL        |
| ORM                | Prisma            |
| Authentication     | Clerk             |
| Background Jobs    | Trigger.dev v3    |
| Integrations       | Composio          |
| Browser Automation | Playwright        |
| Desktop Automation | Nut.js            |
| Voice Recognition  | Whisper.cpp       |
| Wake Word          | OpenWakeWord      |
| Text To Speech     | Kokoro TTS        |

---

## Folder Structure

```text
/apps
  /desktop
    /electron
    /renderer

/src
  /agents
    /orchestrator
    /planner
    /memory
    /context
    /execution

  /skills
    /desktop
    /browser
    /filesystem
    /coding
    /research

  /voice
    /wakeword
    /stt
    /tts

  /vision
    /screen-capture
    /screen-analysis

  /memory
    /vector
    /storage

  /lib
  /hooks
  /components
  /stores

/prisma

/context

/trigger
```

---

## Database Schema

```prisma
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String?
  createdAt   DateTime @default(now())

  conversations Conversation[]
  memories      Memory[]
  workflows     Workflow[]
}

model Conversation {
  id          String   @id @default(cuid())
  userId      String
  title       String?
  createdAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
  messages Message[]
}

model Message {
  id              String   @id @default(cuid())
  conversationId  String
  role            String
  content         String
  createdAt       DateTime @default(now())

  conversation Conversation @relation(fields: [conversationId], references: [id])
}

model Memory {
  id          String   @id @default(cuid())
  userId      String
  content     String
  embeddingId String
  category    String
  createdAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
}

model Skill {
  id          String   @id @default(cuid())
  name        String
  description String
  enabled     Boolean @default(true)
  createdAt   DateTime @default(now())
}

model Workflow {
  id          String   @id @default(cuid())
  userId      String
  name        String
  description String
  createdAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
}

model AgentExecution {
  id          String   @id @default(cuid())
  agentName   String
  task        String
  status      String
  createdAt   DateTime @default(now())
}
```

---

## Authentication Flow

1. User launches Little Buddy
2. Clerk authentication initializes
3. User signs in
4. Session token generated
5. User profile loaded
6. Memory layer initialized
7. Agent runtime starts

---

## Background Jobs

### Trigger.dev Tasks

#### Memory Consolidation

* Summarize conversations
* Generate embeddings
* Store memories

#### Skill Health Monitor

* Validate installed skills
* Verify permissions

#### Workflow Scheduler

* Scheduled automations
* Reminder execution

#### Context Indexer

* File indexing
* Project indexing
* Context refresh

#### Vision Processing Queue

* Screen analysis
* OCR extraction

---

## Integration Layer

### Composio Connectors

* GitHub
* Gmail
* Google Calendar
* Slack
* Notion
* Linear
* Discord
* Jira

---

## Environment Variables

```env
DATABASE_URL=
DIRECT_URL=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

ANTHROPIC_API_KEY=

QDRANT_URL=
QDRANT_API_KEY=

MEM0_API_KEY=

COMPOSIO_API_KEY=

TRIGGER_SECRET_KEY=

OPENWAKEWORD_MODEL_PATH=

WHISPER_MODEL_PATH=

KOKORO_MODEL_PATH=
```

---

## Key Constraints and Decisions

### Architectural Decisions

* Local-first desktop application
* Voice-first interaction model
* Agent-based architecture
* Skill-driven execution layer
* Persistent memory by default
* Modular agent design
* Event-driven communication

### Performance Constraints

* Voice latency under 500ms
* Memory retrieval under 2 seconds
* Agent planning under 3 seconds

### Security Constraints

* Explicit permission model
* Sandboxed skill execution
* Secure credential storage
* User-controlled memory deletion
