# Setup Guide

## Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| Node.js | 18+ | Runtime |
| npm | 9+ | Package manager |
| PostgreSQL | 14+ | Database |
| Git | Latest | Version control |

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/your-org/little-buddy.git
cd little-buddy
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create `.env.local` in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/little_buddy"

# AI Models (optional - for enhanced features)
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""

# Voice (optional - uses local models by default)
WHISPER_MODEL="base"
KOKORO_MODEL="default"

# Authentication (optional - uses localStorage by default)
NEXTAUTH_SECRET=""
NEXTAUTH_URL=""
```

### 4. Database Setup

```bash
# Create PostgreSQL database
createdb little_buddy

# Push schema to database
npx prisma db push

# (Optional) Seed database
npx prisma db seed
```

### 5. Start Development

```bash
npm run dev
```

This starts:
- Next.js dev server at `http://localhost:3000`
- Electron app (opens automatically)

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start full development |
| `npm run dev:next` | Start Next.js only |
| `npm run dev:electron` | Start Electron only |
| `npm run dev:skip-build` | Skip Electron rebuild |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript check |
| `npm test` | Run tests |
| `npm run test:watch` | Watch mode tests |
| `npm run test:coverage` | Tests with coverage |

## Platform-Specific Setup

### Windows

```bash
# Install build tools (if needed)
npm install -g windows-build-tools

# Or use Visual Studio Build Tools
```

### macOS

```bash
# Install Xcode command line tools
xcode-select --install
```

### Linux

```bash
# Install dependencies
sudo apt-get install -y \
  libnotify-dev \
  libgconf-2-dev \
  libgtk-3-dev \
  libgdk-pixbuf2.0-dev \
  libpango1.0-dev \
  libcairo2-dev \
  libfreetype6-dev \
  libasound2-dev \
  libexpat1-dev \
  libfontconfig1-dev
```

## IDE Setup

### VS Code

Recommended extensions:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Prisma

Add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Troubleshooting

### Prisma Client Not Found

```bash
npx prisma generate
```

### Electron Won't Start

```bash
# Rebuild Electron
npm run build:electron

# Clear cache
rm -rf node_modules/.cache
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql $DATABASE_URL
```

### Port Already in Use

```bash
# Find process on port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

## Next Steps

- [User Guide](user-guide.md) - How to use the application
- [Developer Guide](developer.md) - Contributing to the project
- [Architecture](architecture.md) - System design details
