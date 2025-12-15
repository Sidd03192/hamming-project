import React from 'react';
import './Button.css';

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      onClick,
      variant = 'primary',
      disabled = false,
      type = 'button',
      className = '',
    },
    ref
  ) => {
    const buttonClass = `btn btn--${variant} ${className}`.trim();

    return (
      <button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={buttonClass}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
