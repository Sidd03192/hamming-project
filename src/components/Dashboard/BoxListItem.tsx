import React, { useState, useRef, useEffect } from 'react';
import type { RedactionBox } from '../../types';
import './BoxListItem.css';

export interface BoxListItemProps {
  box: RedactionBox;
  isSelected: boolean;
  onFocus: (boxId: string) => void;
  onEdit: (boxId: string) => void;
  onDelete: (boxId: string) => void;
}

const BoxListItem: React.FC<BoxListItemProps> = ({
  box,
  isSelected,
  onFocus,
  onEdit,
  onDelete,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const getSensitivityClass = (sensitivity: string): string => {
    switch (sensitivity) {
      case 'Low': return 'sensitivity-badge--low';
      case 'Med': return 'sensitivity-badge--med';
      case 'High': return 'sensitivity-badge--high';
      default: return '';
    }
  };

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const handleItemClick = (e: React.MouseEvent) => {
    // Don't trigger focus if clicking on menu button
    if ((e.target as HTMLElement).closest('.box-list-item__menu-btn')) return;
    onFocus(box.id);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleViewDetails = () => {
    setShowDetails(!showDetails);
    setIsMenuOpen(false);
  };

  const handleEdit = () => {
    onEdit(box.id);
    setIsMenuOpen(false);
  };

  const handleDelete = () => {
    onDelete(box.id);
    setIsMenuOpen(false);
  };

  return (
    <div 
      className={`box-list-item ${isSelected ? 'box-list-item--selected' : ''}`}
      onClick={handleItemClick}
    >
      <div className="box-list-item__main">
        <div className="box-list-item__info">
          <span className="box-list-item__label">{box.label}</span>
          <span className={`sensitivity-badge sensitivity-badge--sm ${getSensitivityClass(box.sensitivity)}`}>
            {box.sensitivity}
          </span>
        </div>

        <div className="box-list-item__menu" ref={menuRef}>
          <button 
            className="box-list-item__menu-btn"
            onClick={handleMenuClick}
            aria-label="More options"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>

          {isMenuOpen && (
            <div className="box-list-item__dropdown">
              <button className="dropdown__item" onClick={handleViewDetails}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                {showDetails ? 'Hide Details' : 'View Details'}
              </button>
              <button className="dropdown__item" onClick={handleEdit}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit
              </button>
              <div className="dropdown__divider" />
              <button className="dropdown__item dropdown__item--danger" onClick={handleDelete}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {showDetails && (
        <div className="box-list-item__details">
          <div className="details__row">
            <span className="details__label">Position:</span>
            <span className="details__value">
              X: {formatPercentage(box.normalizedCoords.x)}, Y: {formatPercentage(box.normalizedCoords.y)}
            </span>
          </div>
          <div className="details__row">
            <span className="details__label">Size:</span>
            <span className="details__value">
              W: {formatPercentage(box.normalizedCoords.width)}, H: {formatPercentage(box.normalizedCoords.height)}
            </span>
          </div>
          {box.page && (
            <div className="details__row">
              <span className="details__label">Page:</span>
              <span className="details__value">{box.page}</span>
            </div>
          )}
          {box.overlayText && (
            <div className="details__row">
              <span className="details__label">Overlay:</span>
              <span className="details__value">{box.overlayText}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BoxListItem;
