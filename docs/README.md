# Little Buddy - AI Desktop Assistant

A local-first AI desktop assistant with voice interaction, multi-agent orchestration, persistent memory, desktop automation, and a modular skills framework.

## Features

- **Voice Interaction**: Wake word detection, speech-to-text, text-to-speech
- **Multi-Agent System**: Orchestrator, Planner, Context, Execution agents
- **Persistent Memory**: Long-term, short-term, and episodic memory storage
- **Desktop Automation**: Screen capture, mouse/keyboard control, app management
- **Vision System**: Screen analysis, element detection, OCR
- **Workflow Engine**: Visual workflow builder with step-by-step execution
- **Skills Framework**: Modular skill system with registry and discovery
- **Settings Panel**: Voice, memory, AI, and skills configuration
- **Authentication**: Local user management with session persistence

## Tech Stack

| Layer | Technology |
|-------|------------|
| Desktop | Electron 42 |
| Frontend | Next.js 16, React 18, TypeScript 5 |
| Styling | Tailwind CSS 3 |
| State | Zustand 4 |
| Database | PostgreSQL + Prisma 5 |
| Voice | OpenWakeWord, Whisper, Kokoro TTS |
| Build | Turbopack (dev), Webpack (prod) |

## Quick Start

```bash
# Install dependencies
npm install

# Set up database
npx prisma db push

# Start development
npm run dev
```

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/architecture.md) | System design and component overview |
| [Setup Guide](docs/setup.md) | Installation and configuration |
| [API Reference](docs/api.md) | IPC channels and service APIs |
| [User Guide](docs/user-guide.md) | How to use the application |
| [Developer Guide](docs/developer.md) | Contributing and extending |
| [Testing](docs/testing.md) | Test framework and writing tests |

## Project Structure

```
little-buddy/
├── apps/desktop/
│   ├── electron/          # Electron main process
│   │   ├── main.ts        # Main entry point
│   │   ├── preload.ts     # IPC bridge
│   │   └── modules/       # Dynamic import helpers
│   └── renderer/          # Next.js frontend
│       └── app/           # Pages and layouts
├── src/
│   ├── agents/            # Multi-agent system
│   ├── auth/              # Authentication
│   ├── automation/        # Desktop automation
│   ├── components/        # React components
│   ├── lib/               # Shared utilities
│   ├── memory/            # Memory system
│   ├── skills/            # Skills framework
│   ├── stores/            # Zustand stores
│   ├── voice/             # Voice engine
│   ├── vision/            # Vision system
│   └── workflows/         # Workflow engine
├── prisma/                # Database schema
└── context/               # Project context files
```

## License

MIT
