import { useNavigate, useLocation } from 'react-router-dom';
import NotificationBadge from './NotificationBadge';
import './BottomNav.css';

const NAV_ITEMS = [
  { key: 'chats', label: 'Chats', path: '/home', icon: <svg viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg> },
  { key: 'groups', label: 'Groups', path: '/groups', icon: <svg viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg> },
  { key: 'calls', label: 'Calls', path: '/calls', icon: <svg viewBox="0 0 24 24" fill="none"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg> },
  { key: 'notifications', label: 'Alerts', path: '/notifications', icon: <svg viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg> },
];

const BottomNav = ({ notificationCount = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path) => { navigate(path); };

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav__inner">
        {NAV_ITEMS.map((item) => (
          <button key={item.key} className={`bottom-nav__item ${location.pathname === item.path ? 'active' : ''}`} onClick={() => handleNav(item.path)} aria-label={item.label}>
            <span className="bottom-nav__icon" style={{ position: 'relative' }}>
              {item.icon}
              {item.key === 'notifications' && notificationCount > 0 && (
                <span className="bottom-nav__dot" style={{ position: 'absolute', top: '-4px', right: '-4px' }}>
                  <NotificationBadge count={notificationCount} />
                </span>
              )}
            </span>
            <span className="bottom-nav__label">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;