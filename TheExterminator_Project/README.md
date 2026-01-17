# Kali Focus Workspace (Phase 1 MVP)

## Folder Structure

```
kali_focus_workspace/
├── backend/
│   ├── server.js          # Main API, Session Logic, AI Guardrails
│   └── package.json       # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Single-Screen UI Logic
│   │   ├── main.jsx       # React Entry
│   │   └── index.css      # CSS Grid Layout (Dark Theme)
│   ├── index.html         # HTML root
│   ├── vite.config.js     # Frontend Build Config
│   └── package.json       # Frontend dependencies
└── infrastructure/
    ├── Dockerfile.kali    # Kali + XFCE + VNC + NoVNC
    └── docker-compose.yml # Orchestration
```

# Bug Bounty Thinking Workspace (Phase 1)

A browser-based Kali Linux workspace with an AI analyst that helps reduce confusion, preserve context, and support decision-making during authorized security testing.

This project is **not** an automated hacking tool.  
It does not exploit systems, generate payloads, or run attacks on behalf of users.

---

## What This Is

This application provides:

- A **browser-based Kali Linux environment** (ephemeral, per session)
- A **single-screen workspace** designed to reduce cognitive overload
- An **AI assistant** that:
  - interprets user-provided tool output
  - helps prioritize effort
  - supports scope awareness
  - assists with documentation clarity

All testing actions are **user-initiated and user-executed**.

---

## What This Is NOT

This project explicitly does **not** include:

- ❌ Exploit or payload generation  
- ❌ Automated scanning or recon  
- ❌ Command execution by AI  
- ❌ Vulnerability exploitation guidance  
- ❌ Target discovery or scope expansion  
- ❌ Persistent environments or long-term storage  
- ❌ Collaboration or team workflows  

If you are looking for a tool that automates attacks or bypasses security controls, this is **not** that tool.

---

## Design Principles

- **Clarity over speed**  
- **Interpretation over instruction**  
- **User responsibility over automation**  
- **Scope awareness at all times**  

The goal is to help users decide *what matters* — not to tell them *how to break things*.

---

## Phase 1 Scope

Phase 1 is intentionally minimal and exists to validate one thing:

> Can a structured workspace with AI interpretation reduce frustration and wasted effort for bug bounty hunters?

Phase 1 includes:
- Single-screen UI
- Scope input and gating
- Ephemeral Kali Linux session
- Read-only AI interpretation panel
- Notes and evidence capture

Anything outside this list is out of scope for Phase 1.

---

## Safety & Responsibility

- Users are responsible for ensuring they have **explicit authorization** to test any systems.
- Users must provide valid scope before AI assistance is enabled.
- The AI assistant does not perform attacks or suggest exploitation steps.
- Sessions are isolated and ephemeral.

This project is built to operate within ethical and legal boundaries.

---

## Local Development

> **Note:** This project is under active development. Expect rough edges.

### Prerequisites

- Node.js (18+ recommended)
- Docker
- A system capable of running containers
- (Optional) A supported VNC service (Kasm or Guacamole)

### Setup

```bash
git clone <repo-url>
cd <repo>
cp .env.example .env
npm install
npm run dev
Environment variables are documented in .env.example.

Project Structure
/frontend    # React / UI
/backend     # API, session management, AI guardrails
/ai          # AI prompt contracts and enforcement
/infra       # Container and VNC setup
PHASE_1_LOCK.md
Contribution Status
This project is currently in private alpha development.

Features are locked to Phase 1

Feedback is focused on clarity, friction, and usability

Feature requests outside scope are logged but not implemented

Roadmap (High-Level)
Phase 1: Private alpha (current)

Phase 1.5: Clarity and UX iteration

Phase 2: Deeper analysis and reporting assistance (no automation)

There is no timeline for public release.

Disclaimer
This software is provided as-is, without warranty.

The maintainers are not responsible for misuse, unauthorized testing, or violations of program rules or law. Use responsibly.


