# Product Design Specification: Kali Focus Workspace (Phase 1 MVP)

## 1. Product Overview

**What Not Hack Does:**
Kali Focus is a constrained, browser-based security assessment environment designed to combat decision paralysis and context loss during bug bounty engagements. It provides an ephemeral, single-session Kali Linux instance paired with a read-only AI analyst that acts as a cognitive guardrail. The system enforces scope boundaries, maintains documentation in real-time, and assists with data interpretation to ensure every action taken is purposeful and defensible in a final report.

**What Not Hack Explicitly Does NOT Do:**
This product is not an automated hacking tool or an exploit generator. It explicitly rejects the "script kiddie" model of automation. It does not generate payloads, execute attacks on behalf of the user, suggest bypass techniques, or chain vulnerabilities. It does not scan targets automatically (e.g., no background Nuclei/out-of-band scanning) and contains no persistent memory between sessions to enforce security isolation.

---

## 2. UI Wireframe Description

**Design Philosophy:**
Clinical, high-contrast, distraction-free. The interface is immutable during a session—no resizing, closing, or rearranging panels.

**Global Layout (Grid System):**
- **Screen:** 100vw x 100vh, fixed layout. No scrolling on the main container.
- **Top Bar:** Fixed height (48px).
- **Main Content Area:** Three columns (20% Left, 50% Center, 30% Right).
- **Bottom Panel:** Fixed height (25% of vertical space).

### Component Specifications

#### A. Top Bar (Global Status)
- **Left:** `Session ID: [UUID-Short]` (Monospace, dimmed).
- **Center:** `SCOPE STATUS: ACTIVE` (Green indicator if valid, Red if verification fails).
- **Right:** `00:14:23` (Session Timer) | `[End Session]` Button (Red outline, requires double-click).

#### B. Scope Panel (Left Column - 20%)
*Purpose: Context Anchor*
1.  **Header:** "Engagement Scope" (H3, Uppercase).
2.  **Asset List:**
    -   Active verification of input against these rules.
    -   *In-Scope:* List of domains/IPs (Green accent).
    -   *Out-of-Scope:* List of excluded assets (Red accent).
3.  **Ambiguities:** Manually entered notes on edge cases (e.g., "Dev enpoints ok?").
4.  **State - Locked:** Once session starts, this panel is read-only to prevent scope creep.

#### C. Kali Workspace (Center Column - 50%)
*Purpose: Execution Environment*
-   **Viewport:** HTML5 VNC Canvas rendering the remote XFCE/remote desktop.
-   **Constraints:**
    -   Single Window Mode (user is encouraged to maximize terminal/browser).
    -   No overlay UI elements from the host app inside this frame.
    -   Focus border active when typing.

#### D. AI Panel (Right Column - 30%)
*Purpose: Cognitive Guardrail*
Layout is strictly vertical stack of 4 cards.
1.  **Card 1: "Observation"** (Top)
    -   *Content:* "Terminal shows Nmap output for port 443 only. 2 scripts failed."
    -   *Style:* Monospace, muted text.
2.  **Card 2: "Interpretation"**
    -   *Content:* "Target is running an old version of Apache. This version has known disclosure history, but default configs often patch it."
    -   *Style:* Plain text, clinical tone.
3.  **Card 3: "Value Assessment"**
    -   *Signal:* `LOW` / `MEDIUM` / `HIGH` priority badge.
    -   *Rationale:* "Low value. Version is likely patched designated by the .12 suffix."
4.  **Card 4: "Next Action Category"**
    -   *Content:* "Documentation / Validation".
    -   *Prohibited:* Specific exploit commands.

#### E. Notes & Evidence (Bottom Panel - Spans Width)
*Purpose: Continuous Reporting*
-   **Left (Editor):** Simple Markdown editor. Auto-saves.
-   **Right (Evidence Stream):** List of "Snapshots". User clicks "Capture" -> Screenshots VNC, timestamps it, adds to list.
-   **Export:** "Generate Report Skeleton" button (JSON/MD download).

### UI States
1.  **No Scope (Initial):** Center/Right/Bottom disabled. Scope panel editable. "Confirm Scope" button active.
2.  **Active Session:** Scope locked. VNC connected. AI listening.
3.  **AI Refusal:** If user asks for exploits, AI Panel turns Amber border. Message: "Request violates safety protocols. Focus on analysis."
4.  **Idle Signal:** If no typing/mouse for 5 mins, AI Panel prompts: "Context check. Are you stuck?"

---

## 3. AI Assistant Behavior Spec

**Role:** The AI is a "Senior Analyst" looking over the shoulder, not a "Red Teamer" holding the keyboard.

### Allowed Behaviors
-   **Summarization:** "The curl response shows a 500 error with a Java stack trace."
-   **Contextualization:** "This specific HTTP header is often used by load balancers."
-   **Scope Checking:** "Warning: The IP 192.168.1.5 is not in the loaded scope list."
-   **Documentation:** "Drafting a note about the open port 8080."
-   **Prioritization:** "Given the 403 Forbidden, further fuzzing here is likely low return compared to the login portal found earlier."

### Prohibited Behaviors
-   **Exploitation:** Generating SQLi strings, XSS payloads, or buffer overflow patterns.
-   **Command Generation:** Never output strings formatted as executable bash/powershell commands.
-   **Bypasses:** Suggesting WAF bypass techniques or specific header manipulations to evade filters.
-   **Chaining:** "If you use X and then Y, you can get shell." (Forbidden).

### Refusal Pattern
*Trigger:* User types "Give me an XSS payload for this input."
*Response:* "Payload generation is outside my parameters. I can assist in documenting the input field's behavior or analyzing the response headers for standard security misconfigurations."

### Response Structure
All AI responses must fit the "Observation -> Interpretation -> Worth" model. No conversational filler ("Sure!", "Here you go").

---

## 4. Data Flow Description

1.  **UI $\to$ Container:**
    -   User inputs (Keyboard/Mouse) are sent via WebSocket (Guacamole/NoVNC protocol) to the container.
    -   *Constraint:* No file uploads from local machine allowed in Phase 1 (Pasteboard text only).

2.  **Container $\to$ UI:**
    -   Video stream only.
    -   *Isolation:* The browser has no direct file access to the container filesystem.

3.  **UI $\to$ AI:**
    -   **Text Stream:** The UI captures text from the accessible DOM overlay or OCR trigger of the terminal area.
    -   **Scope Context:** The active Scope List is injected into the AI system prompt.
    -   **Exclusion:** No password fields or flagged PII (masked on client side if detectable) sent to AI.

4.  **AI $\to$ UI:**
    -   Structured JSON objects `{ observation, analysis, priority, action_category }` used to populate the Right Panel cards.
    -   *Constraint:* AI output is sanitized to remove executable markdown blocks.

5.  **Scope Gating:**
    -   Before AI processes a query or observation, it cross-references detected IP/Domains against the Scope List.
    -   If match == False: AI Output = "Output Ignored: Target Out of Scope."

---

## 5. Phase-1 Limitations

| Limitation | Rationale |
| :--- | :--- |
| **Ephemeral Storage** | **Security:** Eliminates risk of exfiltrated data persisting on the platform. **Focus:** Forces user to document findings immediately (in Notes) or lose them. |
| **No Internet-out for AI** | **Privacy:** AI cannot search google/shodan. It relies solely on its training and the user's provided context. |
| **Single Container** | **Simplicity:** Prevents "tab hoarding" and multitasking, which dilutes focus. |
| **No File Persistence** | **Liability:** The platform does not host hacked materials or tools. |
| **No GPU Acceleration** | **Cost & Scope:** Prevents usage for hash cracking; reinforces the tool's purpose as an *analysis* environment, not a brute-force rig. |

---

## 6. Future Phase Hooks (No Implementation)

-   **Spectator Mode:** Allow a mentor to view the VNC session (read-only) to provide guidance.
-   **Report Template Mapping:** Map the "Evidence Locker" items directly to specific vulnerabilities in a standard CVSS calculator.
-   **Integrations:** Read-only API hook into HackerOne/Bugcrowd to pull scope JSON directly (replacing manual entry).
-   **Replay Logs:** Save the VNC input stream (not the video) to allow "instant replay" of how a finding was discovered for the report.
