import React, { useState, useEffect, useRef } from 'react';
import Button from '../UI/Button';
import type { SensitivityLevel } from '../../types';
import './BoxDetailsModal.css';

export interface BoxDetailsFormData {
  label: string;
  sensitivity: SensitivityLevel;
  overlayText?: string;
}

export interface BoxDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BoxDetailsFormData) => void;
  initialData?: BoxDetailsFormData;
  mode: 'create' | 'edit';
}

const BoxDetailsModal: React.FC<BoxDetailsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode,
}) => {
  const [label, setLabel] = useState('');
  const [sensitivity, setSensitivity] = useState<SensitivityLevel>('Med');
  const [overlayText, setOverlayText] = useState('');
  const [errors, setErrors] = useState<{ label?: string }>({});
  const modalRef = useRef<HTMLDivElement>(null);
  const labelInputRef = useRef<HTMLInputElement>(null);

  const MAX_LABEL_LENGTH = 80;

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setLabel(initialData.label);
        setSensitivity(initialData.sensitivity);
        setOverlayText(initialData.overlayText || '');
      } else {
        setLabel('');
        setSensitivity('Med');
        setOverlayText('');
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  // Focus trap and ESC key handling
  useEffect(() => {
    if (!isOpen) return;

    // Focus the label input when modal opens
    labelInputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }

      // Focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { label?: string } = {};
    const trimmedLabel = label.trim();

    if (!trimmedLabel) {
      newErrors.label = 'Label is required';
    } else if (trimmedLabel.length > MAX_LABEL_LENGTH) {
      newErrors.label = `Label must be ${MAX_LABEL_LENGTH} characters or less`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const trimmedLabel = label.trim();
    onSave({
      label: trimmedLabel,
      sensitivity,
      overlayText: overlayText.trim() || undefined,
    });

    handleClose();
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_LABEL_LENGTH) {
      setLabel(value);
      // Clear error when user starts typing
      if (errors.label) {
        setErrors({ ...errors, label: undefined });
      }
    }
  };

  if (!isOpen) return null;

  const remainingChars = MAX_LABEL_LENGTH - label.length;
  const isNearLimit = remainingChars <= 20;

  return (
    <div
      className="modal-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal" ref={modalRef}>
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">
            {mode === 'create' ? 'Create Redaction Box' : 'Edit Redaction Box'}
          </h2>
          <button
            type="button"
            className="modal-close"
            onClick={handleClose}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="label-input" className="form-label">
              Label <span className="required">*</span>
            </label>
            <input
              ref={labelInputRef}
              id="label-input"
              type="text"
              className={`form-input ${errors.label ? 'form-input--error' : ''}`}
              value={label}
              onChange={handleLabelChange}
              placeholder="Enter redaction box label"
              aria-required="true"
              aria-invalid={!!errors.label}
              aria-describedby={errors.label ? 'label-error' : 'label-counter'}
            />
            <div className="form-input-footer">
              {errors.label ? (
                <span id="label-error" className="form-error" role="alert">
                  {errors.label}
                </span>
              ) : (
                <span className="form-helper-text">&nbsp;</span>
              )}
              <span
                id="label-counter"
                className={`char-counter ${isNearLimit ? 'char-counter--warning' : ''}`}
              >
                {remainingChars} / {MAX_LABEL_LENGTH}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="sensitivity-select" className="form-label">
              Sensitivity Level <span className="required">*</span>
            </label>
            <select
              id="sensitivity-select"
              className="form-select"
              value={sensitivity}
              onChange={(e) => setSensitivity(e.target.value as SensitivityLevel)}
              aria-required="true"
            >
              <option value="Low">Low</option>
              <option value="Med">Medium</option>
              <option value="High">High</option>
            </select>
            <span className="form-helper-text">
              Select the sensitivity level for this redaction
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="overlayText-input" className="form-label">
              Overlay Text <span className="optional">(optional)</span>
            </label>
            <input
              id="overlayText-input"
              type="text"
              className="form-input"
              value={overlayText}
              onChange={(e) => setOverlayText(e.target.value)}
              placeholder="Text to display on the box"
              maxLength={50}
            />
            <span className="form-helper-text">
              Optional text displayed on top of the redaction box
            </span>
          </div>

          <div className="modal-actions">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {mode === 'create' ? 'Create' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BoxDetailsModal;
