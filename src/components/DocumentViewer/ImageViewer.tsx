import { useRef, useEffect, useState, useCallback } from 'react';
import './ImageViewer.css';

interface ImageViewerProps {
  fileUrl: string;
  onDimensionsLoaded: (width: number, height: number, pages?: number) => void;
  zoomLevel?: number;
}

export const ImageViewer = ({ 
  fileUrl, 
  onDimensionsLoaded, 
  zoomLevel = 1.0 
}: ImageViewerProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the actual displayed dimensions of the image
  const updateDimensions = useCallback(() => {
    if (imgRef.current) {
      const { clientWidth, clientHeight } = imgRef.current;

      // Only update if we have valid dimensions
      if (clientWidth > 0 && clientHeight > 0) {
        onDimensionsLoaded(clientWidth, clientHeight, 1);
      }
    }
  }, [onDimensionsLoaded]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
  }, [fileUrl]);

  // Listen for window resize to update dimensions
  useEffect(() => {
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [updateDimensions]);

  // Re-measure when zoom changes
  useEffect(() => {
    // Wait for transition/render
    const timer = setTimeout(updateDimensions, 300);
    return () => clearTimeout(timer);
  }, [zoomLevel, updateDimensions]);

  const handleImageLoad = () => {
    setIsLoading(false);

    // Use requestAnimationFrame to ensure the image is rendered before measuring
    requestAnimationFrame(() => {
      updateDimensions();
    });
  };

  const handleImageError = () => {
    setIsLoading(false);
    setError('Failed to load image. Please try a different file.');
  };

  return (
    <div className="image-viewer-container" ref={containerRef}>
      {isLoading && (
        <div className="image-viewer-loading">
          <div className="spinner"></div>
          <p>Loading image...</p>
        </div>
      )}

      {error && (
        <div className="image-viewer-error">
          <p>{error}</p>
        </div>
      )}

      <img
        ref={imgRef}
        src={fileUrl}
        alt="Document"
        className={`image-viewer-image ${isLoading ? 'hidden' : ''}`}
        style={{ 
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'top center',
          transition: 'transform 0.2s ease-out'
        }}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
};
