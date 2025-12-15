import React, { useCallback, useRef } from 'react';
import './Controls.css';

export interface ControlsProps {
  uiMode: 'default' | 'findNearest';
  onModeChange: (mode: 'default' | 'findNearest') => void;
  onExport: () => void;
  onImport: (data: string) => void;
  onReset: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  uiMode,
  onModeChange,
  onExport,
  onImport,
  onReset,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleModeToggle = useCallback(() => {
    const newMode = uiMode === 'default' ? 'findNearest' : 'default';
    onModeChange(newMode);
  }, [uiMode, onModeChange]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          onImport(content);
        } catch (error) {
          console.error('Error reading file:', error);
          alert('Failed to read file. Please ensure it is a valid JSON file.');
        }
      };
      reader.readAsText(file);
      event.target.value = '';
    },
    [onImport]
  );

  const handleResetConfirm = useCallback(() => {
     // The dashboard handles the confirmation dialog, 
     // but here we just trigger the prop.
     // Wait, the prop onReset in Dashboard opens the dialog. 
     // So we just call onReset.
     onReset();
  }, [onReset]);

  return (
    <div className="controls">
      <div className="controls__group">
        <button
          className={`controls__btn ${uiMode === 'findNearest' ? 'active' : ''}`}
          onClick={handleModeToggle}
          title={uiMode === 'findNearest' ? "Disable Find Nearest Mode" : "Enable Find Nearest Mode"}
          aria-label="Toggle Find Nearest Mode"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
            <path d="M13 13l6 6" />
          </svg>
          <span className="controls__label">Nearest</span>
        </button>
      </div>

      <div className="controls__divider" />

      <div className="controls__group">
        <button className="controls__btn" onClick={onExport} title="Export boxes to JSON">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span className="controls__label">Export</span>
        </button>

        <button className="controls__btn" onClick={handleImportClick} title="Import boxes from JSON">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span className="controls__label">Import</span>
        </button>

         <button className="controls__btn controls__btn--danger" onClick={handleResetConfirm} title="Delete all boxes">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        className="controls__file-input"
      />
    </div>
  );
};

export default Controls;
