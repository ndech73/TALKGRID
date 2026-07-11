import { useNavigate } from 'react-router-dom';
import './TopBar.css';

const TopBar = ({ title, showBack = false, showLogo = true, onAIAgent, actions = [] }) => {
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <div className="topbar__left">
        {showBack && (
          <button className="topbar__icon-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <div className="topbar__logo">
          {showLogo && (
            <img src="/Gemini_Generated_Image_b2hq4ob2hq4ob2hq.png" alt="Triad Logo" className="topbar__logo-img" />
          )}
          {title && <h1 className="topbar__title">{title}</h1>}
        </div>
      </div>
      <div className="topbar__right">
        {onAIAgent && (
          <button className="topbar__icon-btn topbar__ai-btn" onClick={onAIAgent} aria-label="Open AI assistant">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        {actions.map((action, i) => (
          <button key={i} className="topbar__icon-btn" onClick={action.onClick} aria-label={action.label}>
            {action.icon}
          </button>
        ))}
      </div>
    </header>
  );
};

export default TopBar;