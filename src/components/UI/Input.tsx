import React from 'react';
import './Input.css';

export interface InputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  maxLength?: number;
  error?: string;
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  disabled?: boolean;
  className?: string;
  id?: string;
}

const Input: React.FC<InputProps> = ({
  value,
  onChange,
  placeholder,
  maxLength,
  error,
  label,
  type = 'text',
  disabled = false,
  className = '',
  id,
}) => {
  const inputId = id || `input-${label?.replace(/\s+/g, '-').toLowerCase()}`;
  const hasError = Boolean(error);
  const showCharCount = maxLength !== undefined;
  const currentLength = value.length;

  return (
    <div className={`input-wrapper ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}

      <div className="input-container">
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          className={`input ${hasError ? 'input--error' : ''}`}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : undefined}
        />

        {showCharCount && (
          <div className="input-char-count">
            <span className={currentLength > maxLength * 0.9 ? 'input-char-count--warning' : ''}>
              {currentLength}/{maxLength}
            </span>
          </div>
        )}
      </div>

      {hasError && (
        <div id={`${inputId}-error`} className="input-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default Input;
