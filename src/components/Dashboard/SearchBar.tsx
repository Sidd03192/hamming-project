import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './SearchBar.css';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  const [internalValue, setInternalValue] = useState(value);
  const [debouncedValue, setDebouncedValue] = useState(value);

  // Sync internal value with prop value
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(internalValue);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [internalValue]);

  // Call onChange when debounced value changes
  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, value]);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(event.target.value);
    },
    []
  );

  const handleClear = useCallback(() => {
    setInternalValue('');
    setDebouncedValue('');
    onChange('');
  }, [onChange]);

  const hasValue = useMemo(() => internalValue.length > 0, [internalValue]);

  return (
    <div className="search-bar">
      <div className="search-bar__container">
        <div className="search-bar__icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <input
          value={internalValue}
          onChange={handleInputChange}
          placeholder="Search documents or redactions..."
          className="search-bar__input"
          type="text"
        />

        {hasValue && (
          <button
            type="button"
            onClick={handleClear}
            className="search-bar__clear"
            aria-label="Clear search"
            title="Clear search"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M12 4L4 12M4 4l8 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>

      {hasValue && (
        <div className="search-bar__status" role="status" aria-live="polite">
          Searching...
        </div>
      )}
    </div>
  );
};

export default SearchBar;
