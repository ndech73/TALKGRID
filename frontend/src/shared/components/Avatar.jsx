import './Avatar.css';

const Avatar = ({ src, name, size = 42, showOnline = false, isOnline = false }) => {
  const initials = name
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="avatar-wrapper" style={{ width: size, height: size }}>
      {src ? (
        <img className="avatar-img" src={src} alt={name} />
      ) : (
        <div className="avatar-fallback" style={{ fontSize: size * 0.35 }}>
          {initials}
        </div>
      )}
      {showOnline && (
        <span className={`avatar-status ${isOnline ? 'online' : 'offline'}`} />
      )}
    </div>
  );
};

export default Avatar;