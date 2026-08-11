import { MODES } from '../config/modes';

export default function Sidebar({ activeMode, onModeChange }) {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">🎓</div>
        <div className="logo-text">
          <h1>StudyBuddy</h1>
          <span className="logo-sub">AI</span>
          <div className="badge">Multi-Model AI</div>
        </div>
      </div>

      <p className="sidebar-tagline">Your AI-powered study companion</p>

      {/* Mode List */}
      <nav className="sidebar-nav">
        <p className="nav-label">AI Modes</p>
        {MODES.map((mode) => (
          <button
            key={mode.id}
            className={`mode-btn ${activeMode === mode.id ? 'active' : ''}`}
            onClick={() => onModeChange(mode.id)}
            style={activeMode === mode.id ? { '--mode-color': mode.color } : {}}
          >
            <span className="mode-icon">{mode.icon}</span>
            <span className="mode-label">{mode.label}</span>
            {activeMode === mode.id && <span className="mode-active-dot" />}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <a
          href="https://openrouter.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="powered-by"
        >
          <span>⚡</span>
          Powered by OpenRouter
        </a>
      </div>
    </aside>
  );
}
