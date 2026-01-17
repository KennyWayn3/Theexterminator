const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const Docker = require('dockerode'); // Assuming dockerode for orchestration
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// In-memory session store (Phase 1 persistence constraint)
const sessions = {};

// Docker Client (Mock/Stub for MVP if socket not available, but structured for real implementation)
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

// --- MIDDLEWARE ---

// Scope Enforcement Middleware
const requireScope = (req, res, next) => {
    const { sessionId } = req.body;
    const session = sessions[sessionId];
    if (!session || !session.scopeConfirmed) {
        return res.status(403).json({ error: 'Scope must be defined and confirmed before accessing AI.' });
    }
    req.session = session;
    next();
};

// --- ROUTES ---

// 1. Session Management
app.post('/api/session/start', async (req, res) => {
    const sessionId = uuidv4();
    // Phase 1 MVP: Static Port 6080 as defined in docker-compose
    const port = 6080;

    console.log(`[SESSION] Starting session ${sessionId} on port ${port}`);

    try {
        // In a real build, this pulls/runs the kali-focus-container
        // For MVP, we assume the container is already running via docker-compose up

        sessions[sessionId] = {
            id: sessionId,
            startTime: Date.now(),
            scopeConfirmed: false,
            scope: null,
            containerId: `mock-container-mvp`,
            vncUrl: `http://localhost:${port}/vnc_lite.html`, // standard novnc path
            vncPort: port
        };

        res.json({ sessionId, vncUrl: sessions[sessionId].vncUrl });
    } catch (e) {
        console.error('Failed to start container', e);
        res.status(500).json({ error: 'Infrastructure failure' });
    }
});

app.post('/api/session/end', async (req, res) => {
    const { sessionId } = req.body;
    if (sessions[sessionId]) {
        console.log(`[SESSION] Terminating ${sessionId}`);
        // await docker.getContainer(sessions[sessionId].containerId).stop();
        delete sessions[sessionId];
    }
    res.json({ status: 'terminated' });
});

// 2. Scope Management
app.post('/api/scope/confirm', (req, res) => {
    const { sessionId, scopeText } = req.body;
    if (!sessions[sessionId]) return res.status(404).json({ error: 'Session not found' });

    // Basic Parsing Logic
    const inScope = [];
    const outScope = [];

    // Naive newline splitter
    const lines = scopeText.split('\n');
    lines.forEach(line => {
        if (line.trim().startsWith('!')) {
            outScope.push(line.trim().substring(1));
        } else if (line.trim().length > 0) {
            inScope.push(line.trim());
        }
    });

    sessions[sessionId].scope = { inScope, outScope, raw: scopeText };
    sessions[sessionId].scopeConfirmed = true;

    console.log(`[SCOPE] Confirmed for ${sessionId}`);
    res.json({ status: 'confirmed', parsedScope: sessions[sessionId].scope });
});

// 3. AI Service (The Guardrail)
app.post('/api/ai/analyze', requireScope, (req, res) => {
    const { terminalOutput, userNotes } = req.body;
    const { scope } = req.session;

    // --- SECURITY FILTER ---
    const forbiddenPatterns = [
        /exploit/i, /payload/i, /attack/i, /hack/i, /bypass/i, /sqlmap/i, /nuclei/i
    ];

    // Check constraints - Implementation of "Refusal Pattern"
    // This is a rough keyword check. In production, the LLM system prompt handles this too.
    /* 
       NOTE: In a real LLM call, we would send a system prompt like:
       "You are a defensive security analyst. You interpret logs. You DO NOT generate attacks."
    */

    // Mock AI Response conforming to the strict structure
    const analysis = {
        observation: "Input appears to be Nmap scan output showing open ports 80 and 443.",
        interpretation: "Standard web ports are open. Service versions suggest nginx 1.18.0.",
        worth: "MEDIUM",
        nextActionCategory: "Information Gathering / Documentation",
        refusal: null
    };

    // Simulate refusal if "exploit" is explicitly requested in notes
    if (userNotes && userNotes.toLowerCase().includes('generate payload')) {
        analysis.refusal = "Request violates safety protocols. Focus on analysis and documentation.";
        analysis.observation = "N/A";
        analysis.interpretation = "N/A";
        analysis.worth = "N/A";
        analysis.nextActionCategory = "N/A";
    }

    res.json(analysis);
});

app.listen(port, () => {
    console.log(`Kali Focus Backend running on port ${port}`);
});
