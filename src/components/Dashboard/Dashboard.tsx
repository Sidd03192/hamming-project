import React, { useState, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useRedactionBoxes } from '../../hooks/useRedactionBoxes';
import { exportBoxesToJSON, importBoxesFromJSON } from '../../utils/exportImport';
import Controls from './Controls';
import SearchBar from './SearchBar';
import BoxList from './BoxList';
import BoxDetailsModal from '../Modals/BoxDetailsModal';
import type { BoxDetailsFormData } from '../Modals/BoxDetailsModal';
import ConfirmDialog from '../Modals/ConfirmDialog';
import type { UIMode } from '../../types';
import './Dashboard.css';

interface DashboardProps {
  stats?: {
    percentage: number;
    pointer: { x: number; y: number } | null;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  const { state, dispatch } = useAppContext();
  const { getFilteredBoxes, selectBox, updateBox, deleteBox } = useRedactionBoxes();

  // Modal states
  const [editModalState, setEditModalState] = useState<{
    isOpen: boolean;
    boxId: string | null;
  }>({
    isOpen: false,
    boxId: null,
  });

  const [confirmDialogState, setConfirmDialogState] = useState<{
    isOpen: boolean;
    type: 'delete' | 'reset' | null;
    boxId?: string;
  }>({
    isOpen: false,
    type: null,
  });

  // Get filtered boxes based on search
  const filteredBoxes = getFilteredBoxes();

  // Handle search filter changes
  const handleSearchChange = useCallback(
    (value: string) => {
      dispatch({ type: 'SET_SEARCH', payload: value });
    },
    [dispatch]
  );

  // Handle UI mode toggle
  const handleModeChange = useCallback(
    (mode: 'default' | 'findNearest') => {
      // Map 'default' to 'normal' for UIMode type
      const uiMode: UIMode = mode === 'default' ? 'normal' : 'findNearest';
      dispatch({ type: 'SET_MODE', payload: uiMode });
    },
    [dispatch]
  );

  // Handle export
  const handleExport = useCallback(() => {
    try {
      exportBoxesToJSON(state.boxes);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export redaction boxes. Please try again.');
    }
  }, [state.boxes]);

  // Handle import file reading
  const handleImport = useCallback(
    (jsonContent: string) => {
      try {
        const result = importBoxesFromJSON(jsonContent);

        if (!result.valid) {
          alert(`Import failed: ${result.error || 'Invalid file format'}`);
          return;
        }

        if (result.boxes && result.boxes.length === 0) {
          alert('Warning: No redaction boxes found in the file.');
          return;
        }

        // Filter boxes based on available pages
        const totalPages = state.document.totalPages;
        if (totalPages !== null) {
          const originalCount = result.boxes ? result.boxes.length : 0;
          const boxesToImport = result.boxes ? result.boxes.filter(box => !box.page || box.page <= totalPages) : [];

          if (boxesToImport.length < originalCount) {
             console.warn(`Filtered out ${originalCount - boxesToImport.length} boxes outside usage page range.`);
             alert(`Imported ${boxesToImport.length} boxes. ${originalCount - boxesToImport.length} boxes were skipped because they belonged to pages not present in the current document.`);
          } else {
             alert(`Successfully imported ${boxesToImport.length} redaction box${boxesToImport.length !== 1 ? 'es' : ''}`);
          }

          if (boxesToImport.length > 0) {
            dispatch({ type: 'LOAD_BOXES', payload: boxesToImport });
          }
        } else {
            alert('Please upload a document before importing redaction boxes to ensure they match the page count.');
            return;
        }
      } catch (error) {
        console.error('Import error:', error);
        alert('Failed to import redaction boxes. Please ensure the file is valid.');
      }
    },
    [dispatch, state.document.totalPages] // Added state.totalPages to dependencies
  );

  // Handle reset
  const handleReset = useCallback(() => {
    setConfirmDialogState({
      isOpen: true,
      type: 'reset',
    });
  }, []);

  const handleResetConfirm = useCallback(() => {
    dispatch({ type: 'RESET_ALL' });
  }, [dispatch]);

  // Handle box focus
  const handleBoxFocus = useCallback(
    (boxId: string) => {
      selectBox(boxId);
    },
    [selectBox]
  );

  // Handle box edit
  const handleBoxEdit = useCallback((boxId: string) => {
    setEditModalState({
      isOpen: true,
      boxId,
    });
  }, []);

  const handleEditModalSave = useCallback(
    (data: BoxDetailsFormData) => {
      if (editModalState.boxId) {
        try {
          updateBox(editModalState.boxId, {
            label: data.label,
            sensitivity: data.sensitivity,
            overlayText: data.overlayText,
          });
        } catch (error) {
          console.error('Update failed:', error);
          const message = error instanceof Error ? error.message : 'Failed to update redaction box. Please try again.';
          alert(message);
        }
      }
    },
    [editModalState.boxId, updateBox]
  );

  const handleEditModalClose = useCallback(() => {
    setEditModalState({
      isOpen: false,
      boxId: null,
    });
  }, []);

  // Handle box delete
  const handleBoxDelete = useCallback((boxId: string) => {
    setConfirmDialogState({
      isOpen: true,
      type: 'delete',
      boxId,
    });
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (confirmDialogState.type === 'delete' && confirmDialogState.boxId) {
      deleteBox(confirmDialogState.boxId);
    }
  }, [confirmDialogState, deleteBox]);

  const handleConfirmDialogClose = useCallback(() => {
    setConfirmDialogState({
      isOpen: false,
      type: null,
    });
  }, []);

  // Get current box data for edit modal
  const getEditModalInitialData = (): BoxDetailsFormData | undefined => {
    if (!editModalState.boxId) return undefined;

    const box = state.boxes.find((b) => b.id === editModalState.boxId);
    if (!box) return undefined;

    return {
      label: box.label,
      sensitivity: box.sensitivity,
      overlayText: box.overlayText,
    };
  };

  // Map UIMode to Controls mode format
  const controlsMode = state.uiMode === 'normal' ? 'default' : 'findNearest';

  return (
    <div className="dashboard">
      {stats && (
        <div className="dashboard__stats" style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--figma-border)',
          fontSize: '11px',
          color: 'var(--figma-text-secondary)',
          backgroundColor: 'var(--figma-bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Redacted Area:</span>
            <span style={{ color: 'var(--figma-text-primary)', fontWeight: 600 }}>
              {stats.percentage.toFixed(2)}%
            </span>
          </div>
        </div>
      )}
      <div className="dashboard__controls">
        <Controls
          uiMode={controlsMode}
          onModeChange={handleModeChange}
          onExport={handleExport}
          onImport={handleImport}
          onReset={handleReset}
        />
      </div>

      <div className="dashboard__search">
        <SearchBar value={state.searchFilter} onChange={handleSearchChange} />
      </div>

      <div className="dashboard__content">
        <BoxList
          boxes={filteredBoxes}
          selectedBoxId={state.selectedBoxId}
          onBoxFocus={handleBoxFocus}
          onBoxEdit={handleBoxEdit}
          onBoxDelete={handleBoxDelete}
          isFiltered={state.searchFilter.length > 0}
        />
      </div>

      {/* Edit Modal */}
      <BoxDetailsModal
        isOpen={editModalState.isOpen}
        onClose={handleEditModalClose}
        onSave={handleEditModalSave}
        initialData={getEditModalInitialData()}
        mode="edit"
      />

      {/* Delete Confirmation Dialog */}
      {confirmDialogState.type === 'delete' && (
        <ConfirmDialog
          isOpen={confirmDialogState.isOpen}
          onClose={handleConfirmDialogClose}
          onConfirm={handleDeleteConfirm}
          title="Delete Redaction Box"
          message="Are you sure you want to delete this redaction box? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}

      {/* Reset Confirmation Dialog */}
      {confirmDialogState.type === 'reset' && (
        <ConfirmDialog
          isOpen={confirmDialogState.isOpen}
          onClose={handleConfirmDialogClose}
          onConfirm={handleResetConfirm}
          title="Reset All Data"
          message="Are you sure you want to reset all data? This will remove all redaction boxes and cannot be undone."
          confirmText="Reset All"
          cancelText="Cancel"
        />
      )}
    </div>
  );
};

export default Dashboard;
