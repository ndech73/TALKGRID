import './Avatar.css'

function Avatar({ name, image, size = 'md', online = false }) {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase()
    : '?'

  return (
    <div className={`avatar avatar-${size}`}>
      {image 
        ? <img src={image} alt={name} className="avatar-img" />
        : <span className="avatar-initials">{initials}</span>
      }
      {online && <span className="avatar-online"></span>}
    </div>
  )
}

export default Avatar