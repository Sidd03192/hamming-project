import { createContext, useContext } from 'react';
import type { AppState, AppAction } from '../types';

// Initial state
export const initialState: AppState = {
  currentView: 'upload',
  document: {
    file: null,
    fileUrl: null,
    fileType: null,
    dimensions: null,
  },
  boxes: [],
  uiMode: 'normal',
  searchFilter: '',
  selectedBoxId: null,
};

// Context type
export interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

// Create context
export const AppContext = createContext<AppContextType | undefined>(undefined);

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
