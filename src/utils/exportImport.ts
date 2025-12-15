/**
 * Export and import utilities for redaction boxes
 * Handles JSON serialization/deserialization with validation
 */

import type { RedactionBox, ExportData, SensitivityLevel } from '../types';

// Current version of the export format
const EXPORT_VERSION = '1.0.0';

/**
 * Exports redaction boxes to a JSON file and triggers browser download
 * @param boxes - Array of redaction boxes to export
 */
export function exportBoxesToJSON(boxes: RedactionBox[]): void {
  try {
    // Create export data structure with metadata
    const exportData: ExportData = {
      version: EXPORT_VERSION,
      timestamp: Date.now(),
      boxes: boxes
    };

    // Convert to formatted JSON string
    const jsonString = JSON.stringify(exportData, null, 2);

    // Create blob with JSON content
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `redaction-boxes-${timestamp}.json`;
    link.href = url;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting boxes to JSON:', error);
    throw new Error('Failed to export redaction boxes');
  }
}

/**
 * Validates if a value is a valid SensitivityLevel
 * @param value - The value to check
 * @returns True if the value is a valid sensitivity level
 */
function isValidSensitivityLevel(value: unknown): value is SensitivityLevel {
  return value === 'Low' || value === 'Med' || value === 'High';
}

/**
 * Validates if an object has the correct RedactionBox structure
 * @param obj - The object to validate
 * @returns True if the object is a valid RedactionBox
 */
function isValidRedactionBox(obj: unknown): obj is RedactionBox {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  const box = obj as Record<string, unknown>;

  // Check required fields exist and have correct types
  if (typeof box.id !== 'string' || !box.id) {
    return false;
  }

  if (typeof box.label !== 'string' || box.label.length > 80) {
    return false;
  }

  if (!isValidSensitivityLevel(box.sensitivity)) {
    return false;
  }

  if (typeof box.createdAt !== 'number' || box.createdAt <= 0) {
    return false;
  }

  // Validate normalizedCoords structure
  const coords = box.normalizedCoords;
  if (!coords || typeof coords !== 'object') {
    return false;
  }

  const coordsObj = coords as Record<string, unknown>;
  if (
    typeof coordsObj.x !== 'number' ||
    typeof coordsObj.y !== 'number' ||
    typeof coordsObj.width !== 'number' ||
    typeof coordsObj.height !== 'number'
  ) {
    return false;
  }

  // Validate coordinates are in normalized range (0-1)
  if (
    coordsObj.x < 0 || coordsObj.x > 1 ||
    coordsObj.y < 0 || coordsObj.y > 1 ||
    coordsObj.width < 0 || coordsObj.width > 1 ||
    coordsObj.height < 0 || coordsObj.height > 1
  ) {
    return false;
  }

  return true;
}

/**
 * Validates if an object has the correct ExportData structure
 * @param obj - The object to validate
 * @returns True if the object is a valid ExportData
 */
function isValidExportData(obj: unknown): obj is ExportData {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  const data = obj as Record<string, unknown>;

  // Check version field
  if (typeof data.version !== 'string' || !data.version) {
    return false;
  }

  // Check timestamp field
  if (typeof data.timestamp !== 'number' || data.timestamp <= 0) {
    return false;
  }

  // Check boxes field
  if (!Array.isArray(data.boxes)) {
    return false;
  }

  // Validate each box in the array
  for (const box of data.boxes) {
    if (!isValidRedactionBox(box)) {
      return false;
    }
  }

  return true;
}

/**
 * Imports and validates redaction boxes from a JSON string
 * @param jsonString - The JSON string to parse
 * @returns Object containing validation status, parsed boxes array, or error message
 */
export function importBoxesFromJSON(
  jsonString: string
): { valid: boolean; boxes?: RedactionBox[]; error?: string } {
  try {
    // Check if input is empty
    if (!jsonString || jsonString.trim() === '') {
      return {
        valid: false,
        error: 'Empty JSON string provided'
      };
    }

    // Parse JSON string
    let parsedData: unknown;
    try {
      parsedData = JSON.parse(jsonString);
    } catch (parseError) {
      return {
        valid: false,
        error: 'Invalid JSON format: Unable to parse JSON string'
      };
    }

    // Validate structure
    if (!isValidExportData(parsedData)) {
      return {
        valid: false,
        error: 'Invalid data structure: JSON does not match expected format'
      };
    }

    // Check if boxes array is empty
    if (parsedData.boxes.length === 0) {
      return {
        valid: true,
        boxes: [],
        error: 'No redaction boxes found in the file'
      };
    }

    // Return validated boxes
    return {
      valid: true,
      boxes: parsedData.boxes
    };
  } catch (error) {
    console.error('Error importing boxes from JSON:', error);
    return {
      valid: false,
      error: 'Unexpected error occurred while importing redaction boxes'
    };
  }
}
