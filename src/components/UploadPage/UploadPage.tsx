import React, { useState, useRef } from 'react';
import { useFileReader } from '../../hooks/useFileReader';
import { validateFileType, validateFileSize } from '../../utils/fileValidation';
import { useAppContext } from '../../context/AppContext';
import Button from '../UI/Button';
import './UploadPage.css';

const UploadPage: React.FC = () => {
  const { dispatch } = useAppContext();
  const { handleFile, fileUrl, fileType, dimensions, isLoading, error: fileReaderError } = useFileReader();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection from input or drag-and-drop
  const processFile = (file: File) => {
    // Reset errors
    setValidationError(null);

    // Validate file type
    const typeValidation = validateFileType(file);
    if (!typeValidation.valid) {
      setValidationError(typeValidation.error || 'Invalid file type');
      setSelectedFile(null);
      return;
    }

    // Validate file size (10MB limit)
    const sizeValidation = validateFileSize(file, 10);
    if (!sizeValidation.valid) {
      setValidationError(sizeValidation.error || 'File too large');
      setSelectedFile(null);
      return;
    }

    // File is valid, process it
    setSelectedFile(file);
    handleFile(file);
  };

  // Handle file input change
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Handle drag events
  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Handle click on upload area to trigger file input
  const handleUploadAreaClick = () => {
    fileInputRef.current?.click();
  };

  // Handle continue to editor
  const handleContinue = () => {
    if (!selectedFile || !fileUrl || !fileType) {
      return;
    }

    // Set document in context
    dispatch({
      type: 'SET_DOCUMENT',
      payload: {
        file: selectedFile,
        fileUrl,
        fileType,
        dimensions,
      },
    });

    // Navigate to editor view
    dispatch({
      type: 'SET_VIEW',
      payload: 'editor',
    });
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Determine if continue button should be enabled
  const canContinue = selectedFile && fileUrl && fileType && !isLoading && !validationError && !fileReaderError;

  return (
    <div className="upload-page">
      <div className="upload-container">
        <h1 className="upload-title">Legal Document Redaction</h1>
        <p className="upload-subtitle">Upload a document to begin redacting sensitive information</p>

        {/* Upload Area */}
        <div
          className={`upload-area ${isDragging ? 'upload-area--dragging' : ''} ${selectedFile ? 'upload-area--has-file' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleUploadAreaClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,image/jpg,application/pdf"
            onChange={handleFileInputChange}
            className="upload-input"
            aria-label="File upload input"
          />

          {!selectedFile && (
            <div className="upload-prompt">
              <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p className="upload-text">
                <strong>Click to upload</strong> or drag and drop
              </p>
              <p className="upload-subtext">PNG, JPG, or PDF (max 10MB)</p>
            </div>
          )}

          {selectedFile && (
            <div className="file-preview">
              {/* Image Preview */}
              {fileType === 'image' && fileUrl && (
                <div className="preview-thumbnail">
                  <img src={fileUrl} alt="Preview" className="preview-image" />
                </div>
              )}

              {/* PDF Icon */}
              {fileType === 'pdf' && (
                <div className="preview-thumbnail">
                  <svg className="pdf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <text x="12" y="16" fontSize="6" textAnchor="middle" fill="currentColor">PDF</text>
                  </svg>
                </div>
              )}

              {/* File Info */}
              <div className="file-info">
                <p className="file-name">{selectedFile.name}</p>
                <p className="file-size">{formatFileSize(selectedFile.size)}</p>
                {dimensions && (
                  <p className="file-dimensions">
                    {dimensions.width} x {dimensions.height} px
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="upload-status upload-status--loading">
            <div className="spinner"></div>
            <p>Processing file...</p>
          </div>
        )}

        {/* Error Messages */}
        {validationError && (
          <div className="upload-status upload-status--error">
            <svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <p>{validationError}</p>
          </div>
        )}

        {fileReaderError && (
          <div className="upload-status upload-status--error">
            <svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <p>{fileReaderError}</p>
          </div>
        )}

        {/* Continue Button */}
        {selectedFile && !isLoading && !validationError && !fileReaderError && (
          <div className="upload-actions">
            <Button
              onClick={handleContinue}
              disabled={!canContinue}
              variant="primary"
              className="continue-button"
            >
              Continue to Editor
            </Button>
          </div>
        )}

        {/* Instructions */}
        <div className="upload-instructions">
          <h3>Supported Formats</h3>
          <ul>
            <li>Image files: PNG, JPG, JPEG</li>
            <li>PDF documents</li>
            <li>Maximum file size: 10MB</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
