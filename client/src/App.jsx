import { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatArea from './components/ChatArea';
import InputArea from './components/InputArea';
import EmptyState from './components/EmptyState';
import { MODES } from './config/modes';
import { sendMessage, fetchConfig } from './services/api';
import './App.css';

// Initialize empty history for all modes
const initChats = () => Object.fromEntries(MODES.map((m) => [m.id, []]));

export default function App() {
  const [activeModeId, setActiveModeId] = useState('explain');
  // Each mode keeps its OWN message history — switching modes never erases another mode's chat
  const [chats, setChats] = useState(initChats);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const activeMode = MODES.find((m) => m.id === activeModeId);
  const modeConfig = config[activeModeId] || {};
  const messages = chats[activeModeId] || [];

  // Fetch model config from server on mount
  useEffect(() => {
    fetchConfig()
      .then((data) => setConfig(data.modes || {}))
      .catch(() => {});
  }, []);

  // Auto-scroll to bottom whenever messages or loading change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Helper: update messages only for the active mode
  const setModeMessages = useCallback((modeId, updater) => {
    setChats((prev) => ({
      ...prev,
      [modeId]: typeof updater === 'function' ? updater(prev[modeId] || []) : updater,
    }));
  }, []);

  const handleSend = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    setError(null);
    const userMsg = { role: 'user', content: trimmed, timestamp: Date.now() };

    // Capture current mode at send time (user might switch before response)
    const sendingModeId = activeModeId;

    setModeMessages(sendingModeId, (prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    // Build history from this mode's existing messages (last 10 turns)
    const history = messages
      .slice(-10)
      .map(({ role, content }) => ({ role, content }));

    try {
      const result = await sendMessage(sendingModeId, trimmed, history);
      const aiMsg = {
        role: 'assistant',
        content: result.content,
        timestamp: Date.now(),
        model: result.model,
        specialist: result.specialist,
      };
      setModeMessages(sendingModeId, (prev) => [...prev, aiMsg]);

      // Update specialist badge for this mode
      if (result.model) {
        setConfig((prev) => ({
          ...prev,
          [sendingModeId]: {
            ...prev[sendingModeId],
            model: result.model,
            specialist: { name: result.specialist },
          },
        }));
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || err.message || 'Something went wrong. Please try again.';
      setError(errorMsg);
      // Remove the optimistically-added user message so they can retry
      setModeMessages(sendingModeId, (prev) => prev.slice(0, -1));
      setInputValue(trimmed);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, activeModeId, messages, setModeMessages]);

  // Switching modes now just changes the active mode — no history is cleared
  const handleModeChange = (modeId) => {
    setActiveModeId(modeId);
    setError(null);
    // Keep inputValue — don't clear it, user might be mid-typing
  };

  // Clear only the current mode's history
  const handleClear = () => {
    setModeMessages(activeModeId, []);
    setError(null);
  };

  const handleExampleClick = (example) => {
    setInputValue(example);
  };

  return (
    <div className={`app-container ${sidebarOpen ? '' : 'sidebar-closed'}`}>
      {/* Mobile hamburger */}
      {!sidebarOpen && (
        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
          ☰
        </button>
      )}

      <Sidebar
        activeMode={activeModeId}
        onModeChange={(id) => { handleModeChange(id); }}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main-content">
        <Header
          mode={activeMode}
          specialist={modeConfig?.specialist?.name}
          model={modeConfig?.model}
          onClear={handleClear}
          messageCount={messages.length}
        />

        <div className="content-body">
          {messages.length === 0 && !isLoading ? (
            <EmptyState mode={activeMode} onExampleClick={handleExampleClick} />
          ) : (
            <ChatArea
              messages={messages}
              isLoading={isLoading}
              messagesEndRef={messagesEndRef}
            />
          )}
        </div>

        {error && (
          <div className="error-banner">
            <span>⚠️</span> {error}
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        <InputArea
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSend}
          isLoading={isLoading}
          placeholder={activeMode.placeholder}
        />
      </main>
    </div>
  );
}
