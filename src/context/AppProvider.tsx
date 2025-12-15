import { useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import { AppContext, initialState } from './AppContext';
import type { AppState, AppAction } from '../types';

// Reducer function to handle state updates
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };

    case 'SET_DOCUMENT':
      return { ...state, document: action.payload };

    case 'ADD_BOX':
      return { ...state, boxes: [...state.boxes, action.payload] };

    case 'UPDATE_BOX':
      return {
        ...state,
        boxes: state.boxes.map((box) =>
          box.id === action.payload.id
            ? { ...box, ...action.payload.updates }
            : box
        ),
      };

    case 'DELETE_BOX':
      return {
        ...state,
        boxes: state.boxes.filter((box) => box.id !== action.payload),
        selectedBoxId: state.selectedBoxId === action.payload ? null : state.selectedBoxId,
      };

    case 'SET_MODE':
      return { ...state, uiMode: action.payload };

    case 'SET_SEARCH':
      return { ...state, searchFilter: action.payload };

    case 'SELECT_BOX':
      return { ...state, selectedBoxId: action.payload };

    case 'LOAD_BOXES':
      return { ...state, boxes: action.payload };

    case 'RESET_ALL':
      return {
        ...initialState,
        currentView: 'upload',
      };

    default:
      return state;
  }
}

const STORAGE_KEY = 'legal-doc-redaction-boxes';

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState, (initial) => {
    // Load boxes from localStorage on mount
    try {
      const savedBoxes = localStorage.getItem(STORAGE_KEY);
      if (savedBoxes) {
        const boxes = JSON.parse(savedBoxes);
        return { ...initial, boxes };
      }
    } catch (error) {
      console.error('Failed to load boxes from localStorage:', error);
    }
    return initial;
  });

  // Save boxes to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.boxes));
    } catch (error) {
      console.error('Failed to save boxes to localStorage:', error);
    }
  }, [state.boxes]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}
