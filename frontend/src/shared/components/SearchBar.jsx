import './SearchBar.css';

const SearchBar = ({ value = '', onChange, placeholder = 'Search chats and people', onClear }) => {
  const handleChange = (e) => {
    onChange?.(e.target.value);
  };

  const handleClear = () => {
    onChange?.('');
    onClear?.();
  };

  return (
    <div className="search-bar">
      <svg className="search-bar__icon" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
        <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <input
        className="search-bar__input"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
      />
      {value && (
        <button className="search-bar__clear" onClick={handleClear} aria-label="Clear search">
          ✕
        </button>
      )}
    </div>
  );
};

export default SearchBar;