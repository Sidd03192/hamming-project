import { useState, useCallback, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useRedactionBoxes } from '../../hooks/useRedactionBoxes';
import Dashboard from '../Dashboard/Dashboard';
import { DocumentViewer } from '../DocumentViewer/DocumentViewer';
import { RedactionCanvas } from '../DocumentViewer/RedactionCanvas';
import BoxDetailsModal from '../Modals/BoxDetailsModal';
import { saveFileToDB, getFileFromDB, clearFileFromDB } from '../../utils/indexedDB'; // Import DB utils
import type { Rectangle, SensitivityLevel } from '../../types';
import './EditorPage.css';

interface BoxModalState {
  isOpen: boolean;
  coords: Rectangle | null;
  mode?: 'create' | 'edit';
}

export function EditorPage() {
  const { state, dispatch } = useAppContext();
  const { boxes, selectedBoxId, createBox, selectBox, updateBox } = useRedactionBoxes();

  const [documentDimensions, setDocumentDimensions] = useState<{ width: number; height: number } | null>(null);
  const [boxModal, setBoxModal] = useState<BoxModalState>({ isOpen: false, coords: null });
  const [nearestDistance, setNearestDistance] = useState<number | null>(null);
  
  // Page and Zoom State
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1.0); // Default 100%
  const [totalPages, setTotalPages] = useState(1);
  const [pointerCoords, setPointerCoords] = useState<{ x: number; y: number } | null>(null);

  // Highlight/Navigate to selected box
  useEffect(() => {
    if (selectedBoxId) {
      const box = boxes.find(b => b.id === selectedBoxId);
      if (box && box.page && box.page !== currentPage) {
        setCurrentPage(box.page);
      }
    }
  }, [selectedBoxId, boxes, currentPage]);

  // Clear selection when switching modes (e.g. entering "Pointer Mode"/Assist)
  useEffect(() => {
    selectBox(null);
  }, [state.uiMode, selectBox]);

  const handlePointerMove = useCallback((coords: { x: number; y: number } | null) => {
    setPointerCoords(coords);
  }, []);

  // Calculate Redacted Percentage
  const calculateRedactionPercentage = useCallback(() => {
    if (!boxes.length) return 0;
    
    // Sum of areas normalized (0 to 1 scale)
    // Each box is relative to ONE page.
    let totalNormalizedArea = 0;
    
    boxes.forEach(box => {
      totalNormalizedArea += (box.normalizedCoords.width * box.normalizedCoords.height);
    });

    // Total Document Area in Page Units = totalPages * 1 (since normalized is 0-1)
    const docArea = Math.max(1, totalPages);
    
    return (totalNormalizedArea / docArea) * 100;
  }, [boxes, totalPages]);

  const stats = {
    percentage: calculateRedactionPercentage(),
    pointer: pointerCoords
  };

  // Handle Box Update (Resize/Move)
  const handleBoxUpdate = useCallback((id: string, newCoords: Rectangle) => {
    try {
        updateBox(id, { normalizedCoords: newCoords });
    } catch (e) {
        console.error("Failed to update box", e);
    }
  }, [updateBox]);

  // Load file from IndexedDB on mount
  useEffect(() => {
    const loadPersistedFile = async () => {
      if (state.document.file) return;

      try {
        const file = await getFileFromDB();
        if (file) {
          const fileUrl = URL.createObjectURL(file);
          const fileType = file.type === 'application/pdf' ? 'pdf' : 'image';
          
          dispatch({
            type: 'SET_DOCUMENT',
            payload: {
              file,
              fileUrl,
              fileType,
              dimensions: null,
            },
          });
        }
      } catch (err) {
        console.error('Failed to load persisted file:', err);
      }
    };

    loadPersistedFile();
  }, [dispatch, state.document.file]);

  // Handle dimensions change from DocumentViewer
  const handleDimensionsChange = useCallback((width: number, height: number, pages?: number) => {
    setDocumentDimensions({ width, height });
    if (pages) setTotalPages(pages);
  }, []);

  // Handle file upload
  const handleUpload = useCallback(async (file: File) => {
    try {
      await saveFileToDB(file);
      const fileUrl = URL.createObjectURL(file);
      const fileType = file.type === 'application/pdf' ? 'pdf' : 'image';

      dispatch({
        type: 'SET_DOCUMENT',
        payload: {
          file,
          fileUrl,
          fileType,
          dimensions: null,
        },
      });
      // Reset view state
      setCurrentPage(1);
      setZoomLevel(1.0);
      setTotalPages(1); // Default until loaded
    } catch (err) {
      console.error('Failed to process upload:', err);
      alert('Failed to upload file');
    }
  }, [dispatch]);



  // Handle New Document (Remove current)
  const handleNewDocument = useCallback(async () => {
    if (window.confirm('Are you sure you want to optimize/replace the current document? All redactions will be lost.')) {
      try {
        // Clear from persistence
        await clearFileFromDB();
        
        // Reset global state
        dispatch({ type: 'RESET_ALL' }); 
        
        // Explicitly clear document to ensure UploadZone appears
        dispatch({
          type: 'SET_DOCUMENT',
          payload: {
            file: null,
            fileUrl: '',
            fileType: 'image', // default
            dimensions: null
          }
        });
        
        setTotalPages(1);

      } catch (err) {
        console.error('Failed to clear document:', err);
      }
    }
  }, [dispatch]);

  // Handle box creation from canvas
  const handleBoxCreate = useCallback((coords: Rectangle) => {
    setBoxModal({
      isOpen: true,
      coords,
      mode: 'create'
    });
  }, []);

  const handleBoxSave = useCallback(
    (data: { label: string; sensitivity: SensitivityLevel }) => {
      if (!boxModal.coords) return;
      try {
        createBox(boxModal.coords, data.label, data.sensitivity, currentPage);
        setBoxModal({ isOpen: false, coords: null });
      } catch (error) {
        console.error('Failed to create box:', error);
        alert(error instanceof Error ? error.message : 'Failed to create box');
      }
    },
    [boxModal.coords, createBox, currentPage]
  );

  const handleNearestBoxFound = useCallback((boxId: string, distance: number) => {
    selectBox(boxId);
    setNearestDistance(distance);
    setTimeout(() => setNearestDistance(null), 3000);
  }, [selectBox]);

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3.0));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  const handleZoomReset = () => setZoomLevel(1.0);

  // Filter boxes for current page
  // Assumption: existing legacy boxes without page property default to page 1
  const currentBoxes = boxes.filter(box => (box.page || 1) === currentPage);

  return (
    <div className="editor-page ">
      <header className="editor-header">
        <h1 className="editor-title">Document Redaction Editor</h1>
        
        {/* Zoom Controls */}
        {state.document.fileUrl && (
          <div className="zoom-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px' }}>
            <button className="back-button" onClick={handleZoomOut} title="Zoom Out">-</button>
            <span style={{ color: '#fff', fontSize: '13px', minWidth: '40px', textAlign: 'center' }}>
              {Math.round(zoomLevel * 100)}%
            </span>
            <button className="back-button" onClick={handleZoomIn} title="Zoom In">+</button>
            <button className="back-button" onClick={handleZoomReset} title="Reset Zoom">Fit</button>
          </div>
        )}

        {state.document.fileUrl && (
          <div className="action-buttons" style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
            <button 
              className="back-button"
              onClick={handleNewDocument}
              title="Upload a new document (removes current)"
            >
              New Document
            </button>
          </div>
        )}

        {state.uiMode === 'findNearest' && nearestDistance !== null && (
          <div className="distance-indicator" style={{ marginLeft: '12px' }}>
            Distance: <strong>{nearestDistance.toFixed(2)}px</strong>
          </div>
        )}
      </header>

      <div className="editor-content">
        <aside className="editor-sidebar">
          <Dashboard stats={stats} />
        </aside>

        <main className="editor-document-area">
          <div className="document-container">
            <div className="document-wrapper">
              <DocumentViewer 
                onDimensionsChange={handleDimensionsChange} 
                onUpload={handleUpload}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                zoomLevel={zoomLevel}
              />
              {documentDimensions && state.document.fileUrl && (
                <RedactionCanvas
                  documentDimensions={documentDimensions}
                  boxes={currentBoxes} 
                  selectedBoxId={selectedBoxId}
                  uiMode={state.uiMode}
                  onBoxCreate={handleBoxCreate}
                  onBoxSelect={selectBox}
                  onBoxUpdate={handleBoxUpdate}
                  onNearestBoxFound={handleNearestBoxFound}
                  onPointerMove={handlePointerMove}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      <BoxDetailsModal
        isOpen={boxModal.isOpen}
        onClose={() => setBoxModal({ isOpen: false, coords: null })}
        onSave={handleBoxSave}
        mode="create"
      />
    </div>
  );
}
