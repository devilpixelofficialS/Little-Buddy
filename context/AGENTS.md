# AGENTS.md

## What Is This Project

Little Buddy is a local-first AI desktop assistant designed to function as an intelligent operating layer for a user's computer. The system combines voice interaction, multi-agent orchestration, persistent memory, desktop automation, browser automation, screen understanding, and a modular skills framework. The objective is to create a JARVIS-like assistant capable of hearing, speaking, seeing, remembering, planning, and executing tasks autonomously while remaining fully controllable by the user.

---

## Sprint Goal

Build a functional voice-first desktop assistant capable of:

* Wake word detection
* Voice conversation
* Agent orchestration
* Desktop command execution
* Memory storage
* Skills framework foundation

---

## ⚠️ This Is a LOCAL Development Project

This project runs on your local machine only.

* Run: `npm run dev` to start the app
* Run: `npx prisma db push` to sync the database
* Run: `npx triggerdev@latest dev` to start background jobs
* All env vars go in `.env.local`
* Do NOT use or suggest Bolt, Base44, Lovable, v0, Replit, StackBlitz, or any cloud builder.

---

# Mandatory Reading Order

Every AI coding agent must read files in the following order before making any changes.

| Order | File                    |
| ----- | ----------------------- |
| 1     | AGENTS.md               |
| 2     | project-overview.md     |
| 3     | architecture-context.md |
| 4     | ui-context.md           |
| 5     | ai-workflow-rules.md    |
| 6     | progress-tracker.md     |

Failure to follow this order is considered a workflow violation.

---

# Quick Reference

| Topic             | Location                |
| ----------------- | ----------------------- |
| Product Vision    | project-overview.md     |
| Business Goals    | project-overview.md     |
| Tech Stack        | architecture-context.md |
| Database Schema   | architecture-context.md |
| Folder Structure  | architecture-context.md |
| UI Design Rules   | ui-context.md           |
| Development Rules | ai-workflow-rules.md    |
| Task Priorities   | progress-tracker.md     |

---

# Agent Responsibilities

## Orchestrator Agent

Responsibilities:

* Route requests
* Select agents
* Coordinate execution
* Manage workflows

---

## Planner Agent

Responsibilities:

* Decompose tasks
* Build execution plans
* Prioritize actions

---

## Memory Agent

Responsibilities:

* Store memories
* Retrieve context
* Summarize interactions

---

## Context Agent

Responsibilities:

* Gather system state
* Collect file context
* Analyze active applications

---

## Execution Agent

Responsibilities:

* Execute skills
* Control desktop
* Trigger workflows

---

# Development Workflow

When beginning work:

1. Read mandatory files.
2. Review current sprint goal.
3. Check progress tracker.
4. Select highest priority unfinished task.
5. Create implementation plan.
6. Build feature.
7. Verify implementation.
8. Update progress tracker.

---

# Architecture Principles

## Principle 1

Voice First

Voice interactions are primary.

---

## Principle 2

Local First

Critical functionality should operate locally whenever possible.

---

## Principle 3

Agent Driven

Complex tasks must be handled through agent coordination.

---

## Principle 4

Skill Based

New functionality should be added through skills whenever possible.

---

## Principle 5

Memory Aware

Agents should leverage memory before requesting user information.

---

# Quality Standards

Every completed feature must include:

* Types
* Validation
* Error handling
* Logging
* Documentation

---

# Definition Of Done

A task is complete only if:

* Code builds successfully
* Types pass
* Lint passes
* Documentation updated
* Progress tracker updated
* Feature tested

---

# Immediate Next Tasks

1. Electron shell setup
2. Voice engine implementation
3. Database implementation
4. Agent runtime creation
5. Memory integration
6. Skills registry implementation

These tasks take precedence over all future work until MVP functionality exists.
