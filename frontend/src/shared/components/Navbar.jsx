import './Navbar.css'
import Avatar from './Avatar'

function Navbar({ user }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">💬</span>
        <span className="navbar-name">Triad</span>
      </div>
      <div className="navbar-right">
        {user && <Avatar name={user.username} online={true} size="sm" />}
      </div>
    </nav>
  )
}

export default Navbar