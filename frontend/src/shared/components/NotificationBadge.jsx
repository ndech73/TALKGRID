import './NotificationBadge.css';

const NotificationBadge = ({ count = 0, max = 99, variant = 'primary' }) => {
  if (!count) return null;
  const display = count > max ? `${max}+` : count;

  return (
    <span className={`notification-badge notification-badge--${variant}`}>
      {display}
    </span>
  );
};

export default NotificationBadge;