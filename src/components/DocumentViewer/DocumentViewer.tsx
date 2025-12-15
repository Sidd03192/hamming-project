import { useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ImageViewer } from './ImageViewer';
import { PDFViewer } from './PDFViewer';
import { UploadZone } from '../UploadZone/UploadZone';
import './DocumentViewer.css';

interface DocumentViewerProps {
  onDimensionsChange?: (width: number, height: number, pages?: number) => void;
  onUpload?: (file: File) => void;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  zoomLevel?: number;
}

export const DocumentViewer = ({ 
  onDimensionsChange, 
  onUpload,
  currentPage = 1,
  onPageChange,
  zoomLevel = 1.0
}: DocumentViewerProps) => {
  const { state, dispatch } = useAppContext();
  const { document } = state;

  const handleDimensionsLoaded = (width: number, height: number, pages?: number) => {
    // Update the document dimensions in app state
    dispatch({
      type: 'SET_DOCUMENT',
      payload: {
        ...document,
        dimensions: { width, height },
      },
    });

    // Notify parent component if callback provided
    if (onDimensionsChange) {
      onDimensionsChange(width, height, pages);
    }
  };

  // Reset dimensions when document changes
  useEffect(() => {
    if (!document.fileUrl) {
      dispatch({
        type: 'SET_DOCUMENT',
        payload: {
          ...document,
          dimensions: null,
        },
      });
    }
  }, [document.fileUrl]);

  // Render UploadZone if no document is loaded
  if (!document.fileUrl) {
    return (
      <div className="document-viewer-container" style={{ width: '100%', height: '100%' }}>
        {onUpload ? (
          <UploadZone onFileSelected={onUpload} />
        ) : (
          <div className="document-viewer-placeholder">
            <p>No document loaded</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="document-viewer-container">
      <div className="document-viewer-content">
        {document.fileType === 'image' && (
          <ImageViewer
            fileUrl={document.fileUrl}
            onDimensionsLoaded={handleDimensionsLoaded}
            zoomLevel={zoomLevel}
          />
        )}

        {document.fileType === 'pdf' && (
          <PDFViewer
            fileUrl={document.fileUrl}
            onDimensionsLoaded={handleDimensionsLoaded}
            currentPage={currentPage}
            onPageChange={onPageChange}
            zoomLevel={zoomLevel}
          />
        )}
      </div>
    </div>
  );
};
