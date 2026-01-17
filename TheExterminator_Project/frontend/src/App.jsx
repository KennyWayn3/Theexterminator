import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:3001/api';

function App() {
    const [session, setSession] = useState(null);
    const [scopeText, setScopeText] = useState('');
    const [scopeData, setScopeData] = useState(null);
    const [notes, setNotes] = useState('');
    const [aiAnalysis, setAiAnalysis] = useState({
        observation: "Waiting for input...",
        interpretation: "",
        worth: "",
        nextActionCategory: ""
    });
    const [terminalInput, setTerminalInput] = useState(""); // Manual input for Phase 1 limitation
    const [loadingAI, setLoadingAI] = useState(false);

    // SESSION MANAGEMENT
    const startSession = async () => {
        try {
            const res = await fetch(`${API_BASE}/session/start`, { method: 'POST' });
            const data = await res.json();
            setSession(data);
        } catch (e) {
            alert("Backend not connected. Ensure server is running.");
        }
    };

    const endSession = async () => {
        if (!window.confirm("Are you sure? This will destroy the container.")) return;
        await fetch(`${API_BASE}/session/end`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: session.sessionId })
        });
        setSession(null);
        setScopeData(null);
    };

    // SCOPE MANAGEMENT
    const confirmScope = async () => {
        if (!session) return;
        const res = await fetch(`${API_BASE}/scope/confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: session.sessionId, scopeText })
        });
        const data = await res.json();
        if (data.status === 'confirmed') {
            setScopeData(data.parsedScope);
        }
    };

    // AI ANALYST
    const analyzeOutput = async () => {
        if (!session || !scopeData) return alert("Scope must be confirmed first.");
        setLoadingAI(true);
        try {
            const res = await fetch(`${API_BASE}/ai/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: session.sessionId,
                    terminalOutput: terminalInput,
                    userNotes: notes
                })
            });
            const data = await res.json();
            setAiAnalysis(data);
        } catch (e) {
            setAiAnalysis({ ...aiAnalysis, interpretation: "Error contacting AI service" });
        }
        setLoadingAI(false);
    };

    return (
        <div className="app-container">
            {/* TOP BAR */}
            <div className="top-bar">
                <div className="session-id">SID: {session ? session.sessionId.substring(0, 8) : 'NOT_STARTED'}</div>
                <div className={`scope-status ${scopeData ? 'active' : 'wait'}`}>
                    SCOPE: {scopeData ? 'LOCKED' : 'WAITING'}
                </div>
                <div>
                    {session ? (
                        <button className="end-btn" onDoubleClick={endSession}>END SESSION (DBL CLICK)</button>
                    ) : (
                        <button className="end-btn" style={{ borderColor: '#238636', color: '#238636' }} onClick={startSession}>START NEW SESSION</button>
                    )}
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="main-content">

                {/* LEFT: SCOPE PANEL */}
                <div className="panel">
                    <div className="panel-header">Engagement Scope</div>
                    <div className="panel-body">
                        {!scopeData ? (
                            <>
                                <p style={{ fontSize: '11px', color: '#8b949e' }}>Enter domains/IPs. Start line with '!' to exclude.</p>
                                <textarea
                                    className="scope-input"
                                    value={scopeText}
                                    onChange={(e) => setScopeText(e.target.value)}
                                    disabled={!session}
                                    placeholder="example.com&#10;192.168.1.1&#10;!admin.example.com"
                                />
                                <button
                                    onClick={confirmScope}
                                    disabled={!session || !scopeText}
                                    style={{ marginTop: '8px', width: '100%', padding: '6px', background: '#238636', border: 'none', color: 'white', cursor: 'pointer' }}
                                >
                                    Confirm Scope
                                </button>
                            </>
                        ) : (
                            <div className="scope-list">
                                {scopeData.inScope.map((s, i) => <span key={i} className="scope-list-item scope-in">✓ {s}</span>)}
                                <hr style={{ borderColor: '#30363d' }} />
                                {scopeData.outScope.map((s, i) => <span key={i} className="scope-list-item scope-out">✗ {s}</span>)}
                            </div>
                        )}
                    </div>
                </div>

                {/* CENTER: KALI WORKSPACE */}
                <div className="panel" style={{ borderRight: '1px solid #30363d' }}>
                    <div className="panel-header">Kali Linux (Isolated Container)</div>
                    <div className="kali-frame">
                        {session ? (
                            <iframe
                                src={session.vncUrl}
                                style={{ width: '100%', height: '100%', border: 'none' }}
                                title="Kali VNC"
                            />
                        ) : (
                            <div className="kali-placeholder">
                                <p>NO ACTIVE SESSION</p>
                                <p>Start a session to provision workspace.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: AI PANEL */}
                <div className="panel">
                    <div className="panel-header">AI Analyst (Read-Only)</div>
                    <div className="panel-body ai-cards">

                        {/* Manual Input for Phase 1 - simulating "Reading Screen" */}
                        <div className="ai-card">
                            <div className="ai-card-title">Manual Context Feed</div>
                            <textarea
                                className="scope-input"
                                style={{ height: '60px' }}
                                placeholder="Paste terminal output here for analysis..."
                                value={terminalInput}
                                onChange={(e) => setTerminalInput(e.target.value)}
                            />
                            <button onClick={analyzeOutput} disabled={loadingAI || !scopeData} style={{ width: '100%', fontSize: '10px', marginTop: '4px' }}>Analyze Selection</button>
                        </div>

                        <div className={`ai-card ${aiAnalysis.refusal ? 'ai-warning-amber' : ''}`}>
                            <div className="ai-card-title">Observation</div>
                            <div className="ai-card-content" style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                                {aiAnalysis.refusal ? aiAnalysis.refusal : aiAnalysis.observation}
                            </div>
                        </div>

                        {!aiAnalysis.refusal && (
                            <>
                                <div className="ai-card">
                                    <div className="ai-card-title">Interpretation</div>
                                    <div className="ai-card-content">{aiAnalysis.interpretation}</div>
                                </div>

                                <div className="ai-card">
                                    <div className="ai-card-title">Value Assessment</div>
                                    <div className="ai-card-content">
                                        <span className={`priority-badge priority-${aiAnalysis.worth || 'LOW'}`}>{aiAnalysis.worth || 'unknown'}</span>
                                    </div>
                                </div>

                                <div className="ai-card">
                                    <div className="ai-card-title">Possible Next Action</div>
                                    <div className="ai-card-content">{aiAnalysis.nextActionCategory}</div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

            </div>

            {/* BOTTOM: NOTES */}
            <div className="notes-container">
                <textarea
                    className="notes-editor"
                    placeholder="# Session Notes (Markdown)&#10;Type here to document findings..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
                <div className="evidence-list">
                    <div className="panel-header" style={{ background: 'transparent', paddingLeft: 0 }}>Evidence Locker</div>
                    <div style={{ fontSize: '12px', color: '#8b949e', fontStyle: 'italic' }}>
                        Snapshots will appear here.
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App
