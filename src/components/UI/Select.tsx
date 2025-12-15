import React from 'react';
import './Select.css';

export interface SelectOption<T = string> {
  value: T;
  label: string;
}

export interface SelectProps<T = string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  error?: string;
}

function Select<T extends string | number = string>({
  value,
  onChange,
  options,
  label,
  placeholder,
  disabled = false,
  className = '',
  id,
  error,
}: SelectProps<T>): React.ReactElement {
  const selectId = id || `select-${label?.replace(/\s+/g, '-').toLowerCase()}`;
  const hasError = Boolean(error);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;

    // Find the matching option to get the properly typed value
    const selectedOption = options.find(
      (opt) => String(opt.value) === selectedValue
    );

    if (selectedOption) {
      onChange(selectedOption.value);
    }
  };

  return (
    <div className={`select-wrapper ${className}`.trim()}>
      {label && (
        <label htmlFor={selectId} className="select-label">
          {label}
        </label>
      )}

      <div className="select-container">
        <select
          id={selectId}
          value={String(value)}
          onChange={handleChange}
          disabled={disabled}
          className={`select ${hasError ? 'select--error' : ''}`}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${selectId}-error` : undefined}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={String(option.value)} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="select-icon" aria-hidden="true">
          <svg
            width="12"
            height="8"
            viewBox="0 0 12 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1.5L6 6.5L11 1.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {hasError && (
        <div id={`${selectId}-error`} className="select-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

export default Select;
