# API Reference

## IPC Communication

All communication between renderer and main process uses Electron IPC.

### Usage

```typescript
// Renderer side
const result = await window.electron.invoke("channel:action", ...args);

// Listen to events
const unsubscribe = window.electron.on("channel:event", (data) => {
  console.log(data);
});

// Cleanup
unsubscribe();
```

## App Channels

| Channel | Args | Returns | Description |
|---------|------|---------|-------------|
| `app:version` | - | `string` | Get app version |
| `app:quit` | - | `void` | Quit application |
| `app:minimize` | - | `void` | Minimize window |
| `app:maximize` | - | `void` | Maximize window |
| `app:close` | - | `void` | Close window |

## Voice Channels

| Channel | Args | Returns | Description |
|---------|------|---------|-------------|
| `voice:start-listening` | `options?: VoiceOptions` | `{ success: boolean }` | Start voice recording |
| `voice:stop-listening` | - | `{ success: boolean }` | Stop voice recording |
| `voice:status` | `status: string` | `{ success: boolean }` | Update voice status |

### Voice Events

| Event | Data | Description |
|-------|------|-------------|
| `voice:status` | `string` | Voice state changed |

## Database Channels

### Conversations

| Channel | Args | Returns | Description |
|---------|------|---------|-------------|
| `db:conversations:list` | `userId: string` | `Conversation[]` | List user conversations |
| `db:conversations:get` | `id: string` | `Conversation` | Get conversation |
| `db:conversations:create` | `data: CreateConversation` | `Conversation` | Create conversation |
| `db:conversations:update` | `id, data` | `Conversation` | Update conversation |
| `db:conversations:delete` | `id: string` | `{ success: boolean }` | Delete conversation |

### Messages

| Channel | Args | Returns | Description |
|---------|------|---------|-------------|
| `db:messages:list` | `conversationId: string` | `Message[]` | List messages |
| `db:messages:create` | `data: CreateMessage` | `Message` | Create message |

### Users

| Channel | Args | Returns | Description |
|---------|------|---------|-------------|
| `db:users:get` | `id: string` | `User` | Get user |
| `db:users:getByEmail` | `email: string` | `User` | Get user by email |
| `db:users:create` | `data: CreateUser` | `User` | Create user |
| `db:users:update` | `id, data` | `User` | Update user |

### Memories

| Channel | Args | Returns | Description |
|---------|------|---------|-------------|
| `db:memories:list` | `userId: string` | `Memory[]` | List memories |
| `db:memories:create` | `data: CreateMemory` | `Memory` | Create memory |
| `db:memories:search` | `query, userId?` | `Memory[]` | Search memories |

### Skills

| Channel | Args | Returns | Description |
|---------|------|---------|-------------|
| `db:skills:list` | - | `Skill[]` | List installed skills |
| `db:skills:get` | `id: string` | `Skill` | Get skill |
| `db:skills:install` | `data: InstallSkill` | `Skill` | Install skill |
| `db:skills:uninstall` | `id: string` | `{ success: boolean }` | Uninstall skill |
| `db:skills:execute` | `skillId, input` | `SkillExecution` | Execute skill |

### Workflows

| Channel | Args | Returns | Description |
|---------|------|---------|-------------|
| `db:workflows:list` | `userId: string` | `Workflow[]` | List workflows |
| `db:workflows:get` | `id: string` | `Workflow` | Get workflow |
| `db:workflows:create` | `data: CreateWorkflow` | `Workflow` | Create workflow |
| `db:workflows:update` | `id, data` | `Workflow` | Update workflow |
| `db:workflows:delete` | `id: string` | `{ success: boolean }` | Delete workflow |
| `db:workflows:execute` | `workflowId, input` | `WorkflowExecution` | Execute workflow |

## Agent Channels

| Channel | Args | Returns | Description |
|---------|------|---------|-------------|
| `agent:process` | `input: string` | `string` | Process user input |
| `agent:status` | - | `AgentStatus` | Get agent status |
| `agent:stop` | - | `{ success: boolean }` | Stop current task |

### Agent Events

| Event | Data | Description |
|-------|------|-------------|
| `agent:status` | `AgentStatus` | Agent state changed |
| `agent:thinking` | `string` | Agent processing update |

## Vision Channels

| Channel | Args | Returns | Description |
|---------|------|---------|-------------|
| `vision:capture` | `options?: CaptureOptions` | `Screenshot` | Capture screen |
| `vision:analyze` | `imagePath: string` | `AnalysisResult` | Analyze image |
| `vision:find-element` | `selector, imagePath?` | `ElementInfo` | Find UI element |
| `vision:read-text` | `imagePath?: string` | `string` | Extract text (OCR) |
| `vision:click` | `x, y` | `{ success: boolean }` | Click at coordinates |
| `vision:type-text` | `text` | `{ success: boolean }` | Type text |

## Auth Channels

| Channel | Args | Returns | Description |
|---------|------|---------|-------------|
| `auth:login` | `credentials` | `AuthSession` | Login user |
| `auth:register` | `credentials` | `AuthSession` | Register user |

## React Hooks

### useAuth

```typescript
const {
  user,           // AuthUser | null
  session,        // AuthSession | null
  isAuthenticated, // boolean
  isLoading,      // boolean
  error,          // string | null
  login,          // (credentials: LoginCredentials) => Promise<void>
  register,       // (credentials: RegisterCredentials) => Promise<void>
  logout,         // () => Promise<void>
  clearError,     // () => void
} = useAuth();
```

### useVoice

```typescript
const {
  state,          // VoiceState
  isListening,    // boolean
  transcript,     // string
  interimTranscript, // string
  error,          // string | null
  startListening, // () => Promise<void>
  stopListening,  // () => Promise<void>
  speak,          // (text: string) => Promise<void>
  stopSpeaking,   // () => void
} = useVoice();
```

### useMemory

```typescript
const {
  memories,       // Memory[]
  isLoading,      // boolean
  error,          // string | null
  search,         // (query: string) => Promise<Memory[]>
  store,          // (content: string, type: MemoryType) => Promise<Memory>
  retrieve,       // (id: string) => Promise<Memory | null>
  delete: deleteMemory, // (id: string) => Promise<void>
} = useMemory();
```

### useSkills

```typescript
const {
  skills,         // Skill[]
  isLoading,      // boolean
  error,          // string | null
  install,        // (manifest: SkillManifest) => Promise<Skill>
  uninstall,      // (id: string) => Promise<void>
  execute,        // (skillId: string, action: string, input: unknown) => Promise<unknown>
  getSkill,       // (id: string) => Skill | undefined
} = useSkills();
```

### useAutomation

```typescript
const {
  captureScreen,  // (options?) => Promise<Screenshot>
  click,          // (x: number, y: number) => Promise<void>
  doubleClick,    // (x: number, y: number) => Promise<void>
  rightClick,     // (x: number, y: number) => Promise<void>
  type,           // (text: string) => Promise<void>
  press,          // (key: string) => Promise<void>
  hotkey,         // (...keys: string[]) => Promise<void>
  scroll,         // (amount: number) => Promise<void>
  moveMouse,      // (x: number, y: number) => Promise<void>
  findOnScreen,   // (template: string) => Promise<ElementInfo | null>
} = useAutomation();
```

### useVision

```typescript
const {
  captureScreen,  // (options?) => Promise<Screenshot>
  analyzeScreen,  // (imagePath?: string) => Promise<AnalysisResult>
  findElement,    // (selector: string) => Promise<ElementInfo | null>
  readText,       // (imagePath?: string) => Promise<string>
  clickElement,   // (selector: string) => Promise<boolean>
  typeText,       // (text: string) => Promise<void>
  isProcessing,   // boolean
  error,          // string | null
} = useVision();
```

## Zustand Stores

### useAppStore

```typescript
const {
  status,         // AppStatus
  setStatus,      // (status: AppStatus) => void
  isInitialized,  // boolean
  setInitialized, // (initialized: boolean) => void
  error,          // string | null
  setError,       // (error: string | null) => void
  clearError,     // () => void
} = useAppStore();
```

### useWorkflowStore

```typescript
const {
  workflows,      // Workflow[]
  runs,           // WorkflowRun[]
  createWorkflow, // (data) => Workflow
  updateWorkflow, // (id, data) => void
  deleteWorkflow, // (id) => void
  duplicateWorkflow, // (id) => Workflow | null
  addStep,        // (workflowId, step) => void
  removeStep,     // (workflowId, stepId) => void
  addVariable,    // (workflowId, variable) => void
  removeVariable, // (workflowId, name) => void
  startRun,       // (workflowId, input) => WorkflowRun
  completeRun,    // (runId, output) => void
  failRun,        // (runId, error) => void
} = useWorkflowStore();
```

### useSettingsStore

```typescript
const {
  settings,       // Settings
  updateVoiceSettings, // (data) => void
  updateMemorySettings, // (data) => void
  updateAISettings, // (data) => void
  updateSkillsSettings, // (data) => void
  resetSettings,  // () => void
} = useSettingsStore();
```
