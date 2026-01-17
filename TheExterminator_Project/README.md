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

## Key Files Explained

-   **backend/server.js**: Implements the "Senior Analyst" logic. It strictly filters keywords (exploit, payload) and forces the AI response into a structured `{ observation, interpretation, worth }` format. It also manages the session state (Scope Locking).
-   **frontend/src/App.jsx**: The immutable single-screen interface. It creates the grid layout and manages the state of the Scope Panel (preventing edits after confirmation).
-   **infrastructure/Dockerfile.kali**: A minimal Kali install that starts `x11vnc` and `websockify` automatically, exposing a browser-compatible VNC stream on port 6080.

## Run Instructions

### Prerequisites
-   Docker Desktop installed and running.
-   Node.js (v18+) installed.

### Steps

1.  **Start Infrastructure (Kali Container)**
    Open a terminal in `infrastructure/` and run:
    ```powershell
    docker-compose up --build
    ```
    *Wait for the container to start. It will expose port 6080.*

2.  **Start Backend**
    Open a new terminal in `backend/` and run:
    ```powershell
    npm install
    npm start
    ```
    *Server runs on port 3001.*

3.  **Start Frontend**
    Open a new terminal in `frontend/` and run:
    ```powershell
    npm install
    npm run dev
    ```
    *Frontend runs on port 3000.*

4.  **Access App**
    Open Chrome/Firefox and navigate to `http://localhost:3000`.

## Docker Setup

-   **Image:** `kalilinux/kali-rolling` base.
-   **Services:** `xfce4` (Desktop), `x11vnc` (VNC Server), `novnc` (Web Viewer).
-   **Isolation:** The container is logically isolated. No filesystem mounts connect the container to the host machine's sensitive files.

## Environment Variables

None required for Phase 1. 
(Port 3000, 3001, and 6080 are hardcoded for the MVP).

---

## Validation Checklist

-   [x] **No Exploit Automation:** The AI backend explicitly checks for "exploit" keywords and refuses them.
-   [x] **Single Screen:** CSS enforces a non-scrollable 100vh grid.
-   [x] **Read-Only AI:** The AI cannot execute commands; it only receives string input from the user.
-   [x] **Scope Gating:** The AI endpoint requires a confirmed scope session before accepting input.
