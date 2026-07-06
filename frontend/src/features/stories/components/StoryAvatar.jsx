import './StoryAvatar.css';

const StoryAvatar = ({ src, name, isOwn = false, hasUnread = false, onClick }) => {
  const initials = name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <button className="story-avatar" onClick={onClick} aria-label={isOwn ? 'Add story' : `View ${name}'s story`}>
      <div className={`story-avatar__ring ${hasUnread ? 'unread' : ''} ${isOwn ? 'own' : ''}`}>
        {src ? (
          <img className="story-avatar__img" src={src} alt={name} />
        ) : (
          <div className="story-avatar__fallback">
            {isOwn ? (
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : initials}
          </div>
        )}
      </div>
      <span className="story-avatar__name">{isOwn ? 'Add' : name?.split(' ')[0]}</span>
    </button>
  );
};

export default StoryAvatar;