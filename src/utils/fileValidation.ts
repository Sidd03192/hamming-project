/**
 * File validation utilities for legal document redaction application
 * Supports image files (PNG, JPG, JPEG) and PDF documents
 */

// Supported MIME types for the application
const SUPPORTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
const SUPPORTED_PDF_TYPES = ['application/pdf'];
const SUPPORTED_TYPES = [...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_PDF_TYPES];

// Default maximum file size in megabytes
const DEFAULT_MAX_SIZE_MB = 10;

/**
 * Validates if a file is of an accepted type (image or PDF)
 * @param file - The file to validate
 * @returns Object containing validation status and optional error message
 */
export function validateFileType(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return {
      valid: false,
      error: 'No file provided'
    };
  }

  const fileType = file.type.toLowerCase();

  if (!SUPPORTED_TYPES.includes(fileType)) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.type}. Please upload a PNG, JPG, or PDF file.`
    };
  }

  return { valid: true };
}

/**
 * Validates if a file size is within acceptable limits
 * @param file - The file to validate
 * @param maxSizeMB - Maximum file size in megabytes (default: 10MB)
 * @returns Object containing validation status and optional error message
 */
export function validateFileSize(
  file: File,
  maxSizeMB: number = DEFAULT_MAX_SIZE_MB
): { valid: boolean; error?: string } {
  if (!file) {
    return {
      valid: false,
      error: 'No file provided'
    };
  }

  if (maxSizeMB <= 0) {
    return {
      valid: false,
      error: 'Maximum size must be greater than 0'
    };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxSizeBytes) {
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size (${fileSizeMB}MB) exceeds maximum allowed size of ${maxSizeMB}MB`
    };
  }

  return { valid: true };
}

/**
 * Determines the file type category from MIME type
 * @param file - The file to check
 * @returns 'image' for image files, 'pdf' for PDF files, or null for unsupported types
 */
export function getFileType(file: File): 'image' | 'pdf' | null {
  if (!file) {
    return null;
  }

  const fileType = file.type.toLowerCase();

  if (SUPPORTED_IMAGE_TYPES.includes(fileType)) {
    return 'image';
  }

  if (SUPPORTED_PDF_TYPES.includes(fileType)) {
    return 'pdf';
  }

  return null;
}
