// Core data models for the legal document redaction application

export type SensitivityLevel = 'Low' | 'Med' | 'High';

export interface NormalizedCoords {
  x: number;        // 0-1 range
  y: number;        // 0-1 range
  width: number;    // 0-1 range
  height: number;   // 0-1 range
}

export interface RedactionBox {
  id: string;
  label: string;                     // Max 80 characters
  sensitivity: SensitivityLevel;
  normalizedCoords: NormalizedCoords;
  page: number;                      // Page number (1-based)
  createdAt: number;                 // Timestamp
  overlayText?: string;              // Optional text displayed on the box
}

export interface DocumentState {
  file: File | null;
  fileUrl: string | null;
  fileType: 'image' | 'pdf' | null;
  dimensions: {
    width: number;
    height: number;
  } | null;
}

export type UIMode = 'normal' | 'findNearest';
export type ViewType = 'upload' | 'editor';

export interface AppState {
  currentView: ViewType;
  document: DocumentState;
  boxes: RedactionBox[];
  uiMode: UIMode;
  searchFilter: string;
  selectedBoxId: string | null;
}

// Action types for reducer
export type AppAction =
  | { type: 'SET_VIEW'; payload: ViewType }
  | { type: 'SET_DOCUMENT'; payload: DocumentState }
  | { type: 'ADD_BOX'; payload: RedactionBox }
  | { type: 'UPDATE_BOX'; payload: { id: string; updates: Partial<RedactionBox> } }
  | { type: 'DELETE_BOX'; payload: string }
  | { type: 'SET_MODE'; payload: UIMode }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SELECT_BOX'; payload: string | null }
  | { type: 'RESET_ALL' }
  | { type: 'LOAD_BOXES'; payload: RedactionBox[] };

// Utility types
export interface Point {
  x: number;
  y: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface NearestBoxResult {
  box: RedactionBox | null;
  distance: number;
}

// Modal state types
export interface BoxModalState {
  isOpen: boolean;
  mode: 'create' | 'edit';
  box?: RedactionBox;
  coords?: Rectangle;
}

// Export/Import types
export interface ExportData {
  version: string;
  timestamp: number;
  boxes: RedactionBox[];
}
