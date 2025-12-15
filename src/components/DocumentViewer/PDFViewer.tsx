import { useRef, useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import './PDFViewer.css';

// Configure the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  fileUrl: string;
  onDimensionsLoaded: (width: number, height: number, pages?: number) => void;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  zoomLevel?: number;
}

export const PDFViewer = ({ 
  fileUrl, 
  onDimensionsLoaded, 
  currentPage = 1,
  onPageChange,
  zoomLevel = 1.5
}: PDFViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
  const isRenderingRef = useRef(false);
  const onDimensionsLoadedRef = useRef(onDimensionsLoaded);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [isDocumentLoaded, setIsDocumentLoaded] = useState(false);

  // Keep the callback ref updated
  useEffect(() => {
    onDimensionsLoadedRef.current = onDimensionsLoaded;
  }, [onDimensionsLoaded]);

  // Load PDF document
  useEffect(() => {
    let isCancelled = false;

    const loadPDF = async () => {
      setIsLoading(true);
      setError(null);
      setIsDocumentLoaded(false);
      setTotalPages(0);
      
      // Clean up previous document
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // Ignore cancellation errors
        }
        renderTaskRef.current = null;
      }

      if (pdfDocRef.current) {
        pdfDocRef.current.destroy();
        pdfDocRef.current = null;
      }

      try {
        const loadingTask = pdfjsLib.getDocument({
          url: fileUrl,
          cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
          cMapPacked: true,
        });

        const pdf = await loadingTask.promise;

        if (isCancelled) {
          pdf.destroy();
          return;
        }

        pdfDocRef.current = pdf;
        setTotalPages(pdf.numPages);
        setIsDocumentLoaded(true);
      } catch (err) {
        console.error('Error loading PDF:', err);
        if (!isCancelled) {
          setError('Failed to load PDF. Please try a different file.');
          setIsLoading(false);
        }
      }
    };

    loadPDF();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // Ignore
        }
        renderTaskRef.current = null;
      }
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy();
        pdfDocRef.current = null;
      }
    };
  }, [fileUrl]);

  // Render page when document is loaded or page/zoom changes
  useEffect(() => {
    if (!isDocumentLoaded || !pdfDocRef.current || !canvasRef.current) {
      return;
    }

    // Prevent concurrent renders
    if (isRenderingRef.current) {
      return;
    }

    const renderPage = async () => {
      const pdfDoc = pdfDocRef.current;
      const canvas = canvasRef.current;

      if (!pdfDoc || !canvas) return;

      // Cancel any ongoing render
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // Ignore
        }
        renderTaskRef.current = null;
      }

      isRenderingRef.current = true;

      try {
        const page = await pdfDoc.getPage(currentPage);
        const dpr = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale: zoomLevel * dpr });
        const context = canvas.getContext('2d');

        if (!context) {
          throw new Error('Could not get canvas context');
        }

        // Set canvas internal dimensions (high resolution)
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Set CSS dimensions (logical size)
        canvas.style.width = `${viewport.width / dpr}px`;
        canvas.style.height = `${viewport.height / dpr}px`;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
        renderTaskRef.current = null;

        // Report dimensions after render (logical size)
        const logicalWidth = viewport.width / dpr;
        const logicalHeight = viewport.height / dpr;
        if (logicalWidth > 0 && logicalHeight > 0) {
          onDimensionsLoadedRef.current(logicalWidth, logicalHeight, pdfDoc.numPages);
        }

        setIsLoading(false);
        setError(null);
      } catch (err: unknown) {
        // Check if it's a cancellation
        if (err && typeof err === 'object' && 'name' in err && err.name === 'RenderingCancelledException') {
          // Don't update state on cancellation
          return;
        }
        console.error('Error rendering page:', err);
        setError('Failed to render PDF page.');
        setIsLoading(false);
      } finally {
        isRenderingRef.current = false;
      }
    };

    renderPage();
  }, [isDocumentLoaded, currentPage, zoomLevel]);

  // Listen for window resize - debounced
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (canvasRef.current && pdfDocRef.current) {
          const { clientWidth, clientHeight } = canvasRef.current;
          if (clientWidth > 0 && clientHeight > 0) {
            onDimensionsLoadedRef.current(clientWidth, clientHeight, pdfDocRef.current.numPages);
          }
        }
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const goToPrevPage = () => {
    if (currentPage > 1 && !isRenderingRef.current) {
      onPageChange?.(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages && !isRenderingRef.current) {
      onPageChange?.(currentPage + 1);
    }
  };

  return (
    <div className="pdf-viewer-container" ref={containerRef}>
      {isLoading && (
        <div className="pdf-viewer-loading">
          <div className="spinner"></div>
          <p>Loading PDF...</p>
        </div>
      )}

      {error && (
        <div className="pdf-viewer-error">
          <p>{error}</p>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="pdf-viewer-canvas"
      />

      {totalPages > 1 && !isLoading && !error && (
        <div className="pdf-pagination">
          <button
            className="pdf-nav-btn"
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
            aria-label="Previous page"
          >
            ←
          </button>
          <span className="pdf-page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="pdf-nav-btn"
            onClick={goToNextPage}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
};
