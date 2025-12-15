import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../context/AppContext';
import type { RedactionBox, SensitivityLevel, Rectangle } from '../types';

/**
 * Custom hook for managing redaction boxes CRUD operations
 */
export function useRedactionBoxes() {
  const { state, dispatch } = useAppContext();

  /**
   * Create a new redaction box
   */
  const createBox = useCallback(
    (coords: Rectangle, label: string, sensitivity: SensitivityLevel, page: number = 1) => {
      // Validate label length
      if (label.length > 80) {
        throw new Error('Label must be 80 characters or less');
      }

      // Validate unique label
      const trimmedLabel = label.trim();
      const isDuplicate = state.boxes.some(
        (box) => box.label.toLowerCase() === trimmedLabel.toLowerCase()
      );
      if (isDuplicate) {
        throw new Error(`A redaction box with the name "${trimmedLabel}" already exists. Please use a unique name.`);
      }

      const newBox: RedactionBox = {
        id: uuidv4(),
        label: trimmedLabel,
        sensitivity,
        normalizedCoords: {
          x: coords.x,
          y: coords.y,
          width: coords.width,
          height: coords.height,
        },
        page,
        createdAt: Date.now(),
      };

      dispatch({ type: 'ADD_BOX', payload: newBox });
      return newBox;
    },
    [dispatch, state.boxes]
  );

  /**
   * Update an existing redaction box
   */
  const updateBox = useCallback(
    (id: string, updates: Partial<RedactionBox>) => {
      // Validate label if provided
      if (updates.label !== undefined && updates.label.length > 80) {
        throw new Error('Label must be 80 characters or less');
      }

      // Validate unique label (if changing label)
      if (updates.label !== undefined) {
        const trimmedLabel = updates.label.trim();
        const isDuplicate = state.boxes.some(
          (box) => box.id !== id && box.label.toLowerCase() === trimmedLabel.toLowerCase()
        );
        if (isDuplicate) {
          throw new Error(`A redaction box with the name "${trimmedLabel}" already exists. Please use a unique name.`);
        }
      }

      dispatch({
        type: 'UPDATE_BOX',
        payload: {
          id,
          updates: updates.label ? { ...updates, label: updates.label.trim() } : updates,
        },
      });
    },
    [dispatch, state.boxes]
  );

  /**
   * Delete a redaction box
   */
  const deleteBox = useCallback(
    (id: string) => {
      dispatch({ type: 'DELETE_BOX', payload: id });
    },
    [dispatch]
  );

  /**
   * Select a box (for focusing/highlighting)
   */
  const selectBox = useCallback(
    (id: string | null) => {
      dispatch({ type: 'SELECT_BOX', payload: id });
    },
    [dispatch]
  );

  /**
   * Get filtered boxes based on search query
   */
  const getFilteredBoxes = useCallback(() => {
    const searchLower = state.searchFilter.toLowerCase().trim();

    if (!searchLower) {
      return state.boxes;
    }

    return state.boxes.filter((box) =>
      box.label.toLowerCase().includes(searchLower)
    );
  }, [state.boxes, state.searchFilter]);

  /**
   * Get a specific box by ID
   */
  const getBoxById = useCallback(
    (id: string) => {
      return state.boxes.find((box) => box.id === id) || null;
    },
    [state.boxes]
  );

  return {
    boxes: state.boxes,
    selectedBoxId: state.selectedBoxId,
    createBox,
    updateBox,
    deleteBox,
    selectBox,
    getFilteredBoxes,
    getBoxById,
  };
}
