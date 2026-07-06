import { useState, useRef, useEffect } from 'react';
import './AiAgentPanel.css';

const AIAgentPanel = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { id: 1, role: 'agent', text: "Hey, I'm your Triad assistant. How can I help?" },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', text: trimmed }]);
    setInput('');
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'agent', text: "I'm still being set up, but I'll be able to help you soon!" }]);
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="ai-panel">
      <div className="ai-panel__header">
        <div className="ai-panel__title">
          <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
            <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" stroke="var(--primary)" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
          <span>Triad AI</span>
        </div>
        <button className="ai-panel__close" onClick={onClose}>✕</button>
      </div>
      <div className="ai-panel__messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`ai-panel__msg ai-panel__msg--${msg.role}`}>
            <p>{msg.text}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="ai-panel__input-row">
        <input className="ai-panel__input" placeholder="Ask me anything…" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()} />
        <button className="ai-panel__send" onClick={handleSend} disabled={!input.trim()}>
          <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
            <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AIAgentPanel;