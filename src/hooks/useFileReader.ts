import { useState } from 'react';

export interface FileReaderResult {
  handleFile: (file: File) => void;
  fileUrl: string | null;
  fileType: 'image' | 'pdf' | null;
  dimensions: { width: number; height: number } | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for reading and processing file uploads
 * Handles both images and PDFs, extracting relevant metadata
 * @returns Object containing file handling function and file state
 */
export function useFileReader(): FileReaderResult {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'pdf' | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    // Reset state
    setError(null);
    setIsLoading(true);
    setFileUrl(null);
    setFileType(null);
    setDimensions(null);

    // Validate file
    if (!file) {
      setError('No file provided');
      setIsLoading(false);
      return;
    }

    // Determine file type
    const type = file.type;
    let detectedFileType: 'image' | 'pdf' | null = null;

    if (type.startsWith('image/')) {
      detectedFileType = 'image';
    } else if (type === 'application/pdf') {
      detectedFileType = 'pdf';
    } else {
      setError('Unsupported file type. Please upload an image or PDF.');
      setIsLoading(false);
      return;
    }

    setFileType(detectedFileType);

    // Use FileReader to read file as data URL
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      const result = e.target?.result;

      if (typeof result !== 'string') {
        setError('Failed to read file');
        setIsLoading(false);
        return;
      }

      setFileUrl(result);

      // Handle different file types
      if (detectedFileType === 'image') {
        // For images, get dimensions using Image object
        const img = new Image();

        img.onload = () => {
          setDimensions({
            width: img.width,
            height: img.height,
          });
          setIsLoading(false);
        };

        img.onerror = () => {
          setError('Failed to load image');
          setIsLoading(false);
        };

        img.src = result;
      } else if (detectedFileType === 'pdf') {
        // For PDFs, dimensions will be handled by the PDF viewer
        // Set dimensions to null as per requirements
        setDimensions(null);
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Failed to read file');
      setIsLoading(false);
    };

    reader.onabort = () => {
      setError('File reading was aborted');
      setIsLoading(false);
    };

    // Start reading the file
    try {
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setIsLoading(false);
    }
  };

  return {
    handleFile,
    fileUrl,
    fileType,
    dimensions,
    isLoading,
    error,
  };
}
