# UI Context

## Design Philosophy

Little Buddy should feel like a futuristic AI operating system rather than a traditional desktop application.

Design goals:

* Minimal visual noise
* Voice-first experience
* High information density when needed
* Premium AI-native interface
* Fast and responsive interactions
* Persistent assistant presence

Visual inspiration:

* JARVIS
* Arc Browser
* Raycast
* Linear
* Notion Calendar
* Modern AI operating systems

Primary Mode:

Dark Theme

The assistant should feel alive and active without becoming distracting.

---

## Color Palette

### Background

```css
Background Primary: #0A0A0A
Background Secondary: #121212
Background Tertiary: #1A1A1A
```

### Accent

```css
Primary Accent: #3B82F6
Secondary Accent: #60A5FA
Success: #22C55E
Warning: #F59E0B
Danger: #EF4444
```

### Text

```css
Primary Text: #FFFFFF
Secondary Text: #A1A1AA
Muted Text: #71717A
```

### Agent Status Colors

```css
Listening: #3B82F6
Thinking: #A855F7
Executing: #F59E0B
Speaking: #22C55E
Error: #EF4444
```

---

## Typography Conventions

### Font Family

```text
Inter
```

Fallback:

```text
system-ui
sans-serif
```

### Headings

```text
H1: 32px
H2: 24px
H3: 20px
H4: 18px
```

### Body

```text
Body Large: 16px
Body Standard: 14px
Caption: 12px
```

### Font Weight

```text
Regular: 400
Medium: 500
SemiBold: 600
Bold: 700
```

---

## Spacing Rules

Use 8px spacing system.

```text
xs = 4px
sm = 8px
md = 16px
lg = 24px
xl = 32px
2xl = 48px
```

Never use arbitrary spacing values.

---

## Layout Rules

Maximum content width:

```text
1440px
```

Sidebar width:

```text
320px
```

Agent Console:

```text
400px
```

Floating Assistant Width:

```text
480px
```

---

## Component Conventions

### Buttons

Primary:

* Filled accent background
* Rounded large corners
* Hover transition

Secondary:

* Ghost style
* Transparent background

Danger:

* Red background
* Confirmation required

---

### Cards

Use for:

* Memory items
* Agent logs
* Skills
* Workflows

Card Rules:

* 12px radius
* Subtle border
* Dark surface background

---

### Forms

Every form must support:

* Keyboard navigation
* Validation
* Error states
* Loading states

---

### Modals

Used for:

* Permissions
* Skill installation
* Settings

Rules:

* Escape closes modal
* Focus trap enabled

---

### Loading States

Use skeleton loaders.

Never use spinning loaders longer than 3 seconds.

---

## Page Layout Patterns

### Main Assistant Page

Contains:

* Voice orb
* Conversation history
* Agent status
* Quick actions

---

### Memory Center

Contains:

* Stored memories
* Search
* Categories
* Memory management

---

### Skills Marketplace

Contains:

* Installed skills
* Available skills
* Permissions
* Skill documentation

---

### Agent Monitor

Contains:

* Running agents
* Agent logs
* Agent performance
* Execution history

---

### Workflow Builder

Contains:

* Workflow editor
* Trigger selection
* Agent chaining
* Execution history

---

### Settings

Contains:

* Voice settings
* Memory settings
* Skill permissions
* AI model settings

---

## Icons

Use Lucide Icons.

Common Icons:

```text
Mic
Brain
Terminal
Folder
File
Search
Settings
Bot
Monitor
Play
Pause
MemoryStick
```

---

## Responsive Behavior

Desktop First.

Supported:

```text
1280px+
1440px+
1920px+
```

Tablet support optional.

Mobile support not required.

---

## Accessibility

Requirements:

* Keyboard navigation
* ARIA labels
* Screen reader support
* Focus indicators
* Contrast ratio AA compliant

---

## Animations

Animation Duration:

```text
150ms
200ms
300ms
```

Allowed:

* Fade
* Slide
* Scale

Avoid:

* Excessive motion
* Parallax
* Distracting effects

---

## Voice Orb States

### Idle

Subtle glow

### Listening

Pulsing blue ring

### Thinking

Rotating purple ring

### Executing

Orange pulse

### Speaking

Green waveform animation

### Error

Red pulse
