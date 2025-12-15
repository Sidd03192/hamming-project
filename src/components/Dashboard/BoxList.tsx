import React from 'react';
import type { RedactionBox } from '../../types';
import BoxListItem from './BoxListItem';
import './BoxList.css';

export interface BoxListProps {
  boxes: RedactionBox[];
  selectedBoxId: string | null;
  onBoxFocus: (boxId: string) => void;
  onBoxEdit: (boxId: string) => void;
  onBoxDelete: (boxId: string) => void;
  isFiltered?: boolean;
}

const BoxList: React.FC<BoxListProps> = ({
  boxes,
  selectedBoxId,
  onBoxFocus,
  onBoxEdit,
  onBoxDelete,
  isFiltered = false,
}) => {
  // Empty state when no boxes exist at all
  if (boxes.length === 0 && !isFiltered) {
    return (
      <div className="box-list box-list--empty">
        <div className="box-list__empty-state">
          <div className="empty-state__icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="9" x2="15" y2="15" />
              <line x1="15" y1="9" x2="9" y2="15" />
            </svg>
          </div>
          <h3 className="empty-state__title">No redaction boxes yet</h3>
          <p className="empty-state__description">
            Start by drawing a redaction box on the document
          </p>
        </div>
      </div>
    );
  }

  // Empty state when filtered list is empty
  if (boxes.length === 0 && isFiltered) {
    return (
      <div className="box-list box-list--empty">
        <div className="box-list__empty-state">
          <div className="empty-state__icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </div>
          <h3 className="empty-state__title">No boxes match your search</h3>
          <p className="empty-state__description">
            Try adjusting your search filters
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="box-list">
      <div className="box-list__header">
        <h2 className="box-list__title">Redaction Boxes</h2>
        <span className="box-list__count">{boxes.length}</span>
      </div>
      <div className="box-list__items">
        {boxes.map((box) => (
          <BoxListItem
            key={box.id}
            box={box}
            isSelected={selectedBoxId === box.id}
            onFocus={onBoxFocus}
            onEdit={onBoxEdit}
            onDelete={onBoxDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default BoxList;
