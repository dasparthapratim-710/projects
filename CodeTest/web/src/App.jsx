import React, { useState } from 'react';

export default function App() {
  const [selectedTool, setSelectedTool] = useState('gdrive'); // 'gdrive' | 'onedrive'
  const [isRunning, setIsRunning] = useState(false);
  const [coverage, setCoverage] = useState(68);
  const [logs, setLogs] = useState([
    '🤖 CodeTest Engine v1.0 Initialized',
    '📁 Workspace: /Users/partha/My Projects/CodeTest',
    '💡 Ready to audit target migration tools'
  ]);

  const runCodeTestAudit = () => {
    setIsRunning(true);
    setCoverage(68);
    const fileName = selectedTool === 'gdrive' ? 'gdrive_discovery.js' : 'onedrive_migration.js';

    setLogs([`🚀 Launching CodeTest Agent for: ${fileName}...`]);

    setTimeout(() => {
      setLogs(prev => [
        ...prev, 
        `🔍 Step 1/5: AST Parsing -> Found methods in ${fileName}`,
        `   └─ Traced Shared Core Import: company_base_scanner.js (CompanyOAuthClient)`
      ]);
    }, 1000);

    setTimeout(() => {
      setLogs(prev => [
        ...prev, 
        `⚠️ Step 2/5: Logic Audit -> Health Score: ${selectedTool === 'gdrive' ? '85%' : '75%'}`,
        `   └─ Checked: HTTP 429 Rate Limits, HTTP 401 Auth Expiration, Chunk Resumability`
      ]);
    }, 2200);

    setTimeout(() => {
      setCoverage(88);
      setLogs(prev => [
        ...prev, 
        `⚡ Step 3/5: Calling AI Model to synthesize Jest Mocks & Tests...`,
        `🔄 Step 4/5: Self-Correction Loop Iteration 1 -> Line Coverage: 88%`
      ]);
    }, 3500);

    setTimeout(() => {
      setCoverage(96);
      setIsRunning(false);
      setLogs(prev => [
        ...prev, 
        `🔄 Step 4/5: Self-Correction Loop Iteration 2 -> Target Coverage Reached: 96%! 🎉`,
        `✅ Step 5/5: Saved test suite to ${selectedTool === 'gdrive' ? 'gdrive_discovery.test.js' : 'onedrive_migration.test.js'}`
      ]);
    }, 4800);
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
      {/* Header */}
      <header className="dashboard-header">
        <div className="logo-badge">
          <div className="logo-icon">CT</div>
          <div className="title-text">
            <h1>CodeTest AI Engine</h1>
            <p>Agentic Test Suite Generator & Migration Logic Audit System</p>
          </div>
        </div>
        <button 
          className="btn-primary" 
          onClick={runCodeTestAudit}
          disabled={isRunning}
        >
          {isRunning ? '🤖 Running CodeTest...' : '▶ Run CodeTest Agent'}
        </button>
      </header>

      {/* Tool Selector Bar */}
      <div className="tool-selector-bar">
        <span style={{ fontSize: '0.85rem', color: '#9ca3af', alignSelf: 'center', marginRight: '0.5rem' }}>Select Target Tool:</span>
        <button 
          className={`tool-btn ${selectedTool === 'gdrive' ? 'active' : ''}`}
          onClick={() => setSelectedTool('gdrive')}
        >
          📄 Google Drive Discovery Scanner (gdrive_discovery.js)
        </button>
        <button 
          className={`tool-btn ${selectedTool === 'onedrive' ? 'active' : ''}`}
          onClick={() => setSelectedTool('onedrive')}
        >
          📄 OneDrive Migration Engine (onedrive_migration.js)
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid-layout">
        {/* Left Column */}
        <div>
          {/* Metrics */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>📊 Audit Metrics</h2>
            
            <div className="metric-box">
              <div>
                <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Jest Line Coverage</p>
                <div className={`metric-value ${coverage > 90 ? 'gauge-emerald' : 'gauge-amber'}`}>
                  {coverage}%
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Target Threshold</p>
                <div className="metric-value" style={{ color: '#6366f1' }}>95%</div>
              </div>
            </div>

            <div className="metric-box">
              <div>
                <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Shared Core Import</p>
                <div className="metric-value" style={{ fontSize: '1rem', color: '#06b6d4', marginTop: '0.4rem' }}>
                  company_base_scanner.js
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Import Traced</p>
                <div className="metric-value gauge-emerald" style={{ fontSize: '1rem', marginTop: '0.4rem' }}>Yes (100%)</div>
              </div>
            </div>
          </div>

          {/* Logic Flaws */}
          <div className="glass-card" style={{ marginTop: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>⚠️ Detected Migration Edge Cases</h2>
            
            {selectedTool === 'onedrive' ? (
              <div className="flaw-item">
                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>NON_RESUMABLE_CHUNK_UPLOAD (Medium)</div>
                <p style={{ fontSize: '0.8rem', color: '#d1d5db' }}>
                  File chunking in <code>migrateFileChunks()</code> lacks resume offset logging. Network drop forces 100% re-upload.
                </p>
              </div>
            ) : (
              <div className="flaw-item" style={{ background: 'rgba(16, 185, 129, 0.08)', borderLeftColor: '#10b981' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981', marginBottom: '0.25rem' }}>RATE_LIMIT_RETRY_PASS (Passed)</div>
                <p style={{ fontSize: '0.8rem', color: '#d1d5db' }}>
                  Rate limit handling inherited from <code>CompanyOAuthClient.executeWithRetry()</code>.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* Terminal */}
          <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>🤖 CodeTest Agent Execution Terminal</h2>
            <div className="terminal-window">
              {logs.map((log, i) => (
                <div key={i} style={{ marginBottom: '0.35rem' }}>{log}</div>
              ))}
            </div>
          </div>

          {/* Code Preview */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>⚡ Generated Jest Test Suite Preview</h2>
            <div className="code-viewer">
{selectedTool === 'gdrive' ? `/** CODETEST AUTO-GENERATED JEST SUITE: gdrive_discovery.js */
import { GoogleDriveDiscoveryScanner } from './gdrive_discovery.js';

describe('GoogleDriveDiscoveryScanner Suite', () => {
  test('scanFolder should retrieve files with nextPageToken', async () => {
    mockAuthClient.files.list.mockResolvedValueOnce({
      data: { files: [{ id: '1', name: 'Plan.pdf' }], nextPageToken: 'TOK_2' }
    });
    const res = await scanner.scanFolder('root');
    expect(res.files).toHaveLength(1);
    expect(res.nextPageToken).toBe('TOK_2');
  });
});` : `/** CODETEST AUTO-GENERATED JEST SUITE: onedrive_migration.js */
import { OneDriveMigrationEngine } from './onedrive_migration.js';

describe('OneDriveMigrationEngine Suite', () => {
  test('migrateFileChunks should stream 5MB chunks to destination', async () => {
    mockAuthClient.files.get.mockResolvedValueOnce({ data: { size: '10485760' } });
    mockDestinationClient.uploadChunk.mockResolvedValue(true);
    const res = await engine.migrateFileChunks('file_1', mockDestinationClient);
    expect(res.success).toBe(true);
  });
});`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
