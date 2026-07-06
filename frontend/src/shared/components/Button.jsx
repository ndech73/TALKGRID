import './Button.css'

function Button({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  loading = false, 
  disabled = false,
  fullWidth = false 
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn btn-${variant} ${fullWidth ? 'btn-full' : ''}`}
    >
      {loading ? <span className="btn-spinner"></span> : children}
    </button>
  )
}

export default Button