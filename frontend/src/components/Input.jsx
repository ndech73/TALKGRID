import './Input.css'

function Input({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  error,
  icon
}) {
  return (
    <div className="input-wrapper">
      {label && <label className="input-label">{label}</label>}
      <div className={`input-container ${error ? 'input-error' : ''}`}>
        {icon && <span className="input-icon">{icon}</span>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="input-field"
        />
      </div>
      {error && <span className="input-error-text">{error}</span>}
    </div>
  )
}

export default Input