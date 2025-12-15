import React, { useRef, useEffect, useCallback } from 'react';
import type { MouseEvent } from 'react';
import type { RedactionBox, Rectangle } from '../../types/index';
import { normalizeCoords, denormalizeCoords } from '../../utils/coordinates';
import { findNearestBox } from '../../utils/distance';
import './RedactionCanvas.css';

interface RedactionCanvasProps {
  documentDimensions: { width: number; height: number } | null;
  boxes: RedactionBox[];
  selectedBoxId: string | null;
  uiMode: 'normal' | 'findNearest';
  onBoxCreate: (coords: Rectangle) => void;
  onBoxSelect: (id: string | null) => void;
  onBoxUpdate: (id: string, newCoords: Rectangle) => void;
  onNearestBoxFound: (boxId: string, distance: number) => void;
  onPointerMove?: (coords: { x: number; y: number } | null) => void;
}

interface DragState {
  mode: 'IDLE' | 'DRAWING' | 'MOVING' | 'RESIZING';
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  activeBoxId: string | null;
  initialBoxCoords: Rectangle | null; // For moving/resizing
  resizeHandle: 'TL' | 'TR' | 'BL' | 'BR' | null;
}

const HANDLE_SIZE = 8;
const SNAP_THRESHOLD = 8; // Pixels

// Types for snap lines
interface SnapLine { axis: 'x' | 'y'; value: number; }

export const RedactionCanvas: React.FC<RedactionCanvasProps> = ({
  documentDimensions,
  boxes,
  selectedBoxId,
  uiMode,
  onBoxCreate,
  onBoxSelect,
  onBoxUpdate,
  onNearestBoxFound,
  onPointerMove,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Use refs for state that updates frequently to avoid react re-renders
  const boxesRef = useRef(boxes);
  const selectedBoxIdRef = useRef(selectedBoxId);
  const snapLinesRef = useRef<SnapLine[]>([]); // Track active snap guidelines
  const dragStateRef = useRef<DragState>({
    mode: 'IDLE',
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    activeBoxId: null,
    initialBoxCoords: null,
    resizeHandle: null,
  });

  // Keep refs in sync with props
  useEffect(() => {
    boxesRef.current = boxes;
  }, [boxes]);

  useEffect(() => {
    selectedBoxIdRef.current = selectedBoxId;
  }, [selectedBoxId]);

  // Keyboard Nudging
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const selectedId = selectedBoxIdRef.current;
      if (!selectedId || !documentDimensions) return;

      const activeBox = boxesRef.current.find(b => b.id === selectedId);
      if (!activeBox) return;

      const NUDGE_SMALL = 1;
      const NUDGE_LARGE = 10;
      const step = e.shiftKey ? NUDGE_LARGE : NUDGE_SMALL;

      let dx = 0;
      let dy = 0;

      switch (e.key) {
        case 'ArrowUp': dy = -step; break;
        case 'ArrowDown': dy = step; break;
        case 'ArrowLeft': dx = -step; break;
        case 'ArrowRight': dx = step; break;
        default: return; // Exit if not an arrow key
      }

      e.preventDefault(); // Prevent scrolling

      // Calculate new pixel coords
      const currentPixel = denormalizeCoords(activeBox.normalizedCoords, documentDimensions.width, documentDimensions.height);
      const newPixel = {
        ...currentPixel,
        x: currentPixel.x + dx,
        y: currentPixel.y + dy
      };

      // Normalize and Update
      const normalized = normalizeCoords(newPixel.x, newPixel.y, newPixel.width, newPixel.height, documentDimensions.width, documentDimensions.height);
      onBoxUpdate(selectedId, normalized);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [documentDimensions, onBoxUpdate]);

  /**
   * Calculates snap adjustments for a given rectangle against other boxes.
   * Returns the snapped rectangle and the list of active snap lines.
   */
  const calculateSnap = (
    activeRect: Rectangle,
    activeBoxId: string | null,
    allBoxes: RedactionBox[],
    docDims: { width: number; height: number }
  ): { snappedRect: Rectangle; lines: SnapLine[] } => {
    const lines: SnapLine[] = [];
    const snapped = { ...activeRect };

    const activeLeft = snapped.x;
    const activeRight = snapped.x + snapped.width;
    const activeTop = snapped.y;
    const activeBottom = snapped.y + snapped.height;

    for (const box of allBoxes) {
      if (box.id === activeBoxId) continue; // Don't snap to self

      const other = denormalizeCoords(box.normalizedCoords, docDims.width, docDims.height);
      const otherLeft = other.x;
      const otherRight = other.x + other.width;
      const otherTop = other.y;
      const otherBottom = other.y + other.height;

      // Snap Left edge to Other's Left/Right
      if (Math.abs(activeLeft - otherLeft) < SNAP_THRESHOLD) {
        snapped.x = otherLeft;
        lines.push({ axis: 'x', value: otherLeft });
      } else if (Math.abs(activeLeft - otherRight) < SNAP_THRESHOLD) {
        snapped.x = otherRight;
        lines.push({ axis: 'x', value: otherRight });
      }

      // Snap Right edge to Other's Left/Right
      if (Math.abs(activeRight - otherLeft) < SNAP_THRESHOLD) {
        snapped.x = otherLeft - snapped.width;
        lines.push({ axis: 'x', value: otherLeft });
      } else if (Math.abs(activeRight - otherRight) < SNAP_THRESHOLD) {
        snapped.x = otherRight - snapped.width;
        lines.push({ axis: 'x', value: otherRight });
      }

      // Snap Top edge to Other's Top/Bottom
      if (Math.abs(activeTop - otherTop) < SNAP_THRESHOLD) {
        snapped.y = otherTop;
        lines.push({ axis: 'y', value: otherTop });
      } else if (Math.abs(activeTop - otherBottom) < SNAP_THRESHOLD) {
        snapped.y = otherBottom;
        lines.push({ axis: 'y', value: otherBottom });
      }

      // Snap Bottom edge to Other's Top/Bottom
      if (Math.abs(activeBottom - otherTop) < SNAP_THRESHOLD) {
        snapped.y = otherTop - snapped.height;
        lines.push({ axis: 'y', value: otherTop });
      } else if (Math.abs(activeBottom - otherBottom) < SNAP_THRESHOLD) {
        snapped.y = otherBottom - snapped.height;
        lines.push({ axis: 'y', value: otherBottom });
      }
    }

    return { snappedRect: snapped, lines };
  };

  // Main render loop using requestAnimationFrame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !documentDimensions) return;

    let animationFrameId: number;

    const render = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = documentDimensions.width;
      const height = documentDimensions.height;

      // Set canvas internal dimensions (high resolution)
      const internalWidth = width * dpr;
      const internalHeight = height * dpr;
      
      if (canvas.width !== internalWidth || canvas.height !== internalHeight) {
        canvas.width = internalWidth;
        canvas.height = internalHeight;
      }

      // Scale context for HiDPI
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      const currentBoxes = boxesRef.current;
      const currentSelectedId = selectedBoxIdRef.current;
      const drag = dragStateRef.current;

      // Draw all boxes except the one being manipulated/selected (drawn last)
      const visibleBoxes = currentBoxes.filter(
        b => b.id !== currentSelectedId && b.id !== drag.activeBoxId
      );

      const opacityMap: Record<string, string> = {
        Low: 'rgba(0, 0, 0, 0.3)',
        Med: 'rgba(0, 0, 0, 0.6)',
        High: 'rgba(0, 0, 0, 1)',
      };

      // Draw standard unselected boxes
      visibleBoxes.forEach(box => {
        const pixelCoords = denormalizeCoords(box.normalizedCoords, width, height);
        ctx.fillStyle = opacityMap[box.sensitivity] || opacityMap['Low'];
        ctx.fillRect(pixelCoords.x, pixelCoords.y, pixelCoords.width, pixelCoords.height);

        // Draw overlay text if exists
        if (box.overlayText) {
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const centerX = pixelCoords.x + pixelCoords.width / 2;
          const centerY = pixelCoords.y + pixelCoords.height / 2;
          ctx.fillText(box.overlayText, centerX, centerY, pixelCoords.width - 8);
        }
      });

      // Clear snap lines each frame
      let currentSnapLines: SnapLine[] = [];

      // Draw the "active" box (Moving/Resizing) or Selected Box specially
      const activeId = drag.activeBoxId || currentSelectedId;
      if (activeId) {
        let activeBox = currentBoxes.find(b => b.id === activeId);
        let pixelCoords: Rectangle | null = null;
        
        if (activeBox) {
           pixelCoords = denormalizeCoords(activeBox.normalizedCoords, width, height);

           // If we are actively dragging/resizing, compute the temporary visual state
           if (drag.mode === 'MOVING' && drag.initialBoxCoords) {
             const dx = drag.currentX - drag.startX;
             const dy = drag.currentY - drag.startY;
             let proposedRect: Rectangle = {
               x: drag.initialBoxCoords.x + dx,
               y: drag.initialBoxCoords.y + dy,
               width: drag.initialBoxCoords.width,
               height: drag.initialBoxCoords.height
             };

             // Apply snapping
             const snapResult = calculateSnap(proposedRect, activeId, currentBoxes, documentDimensions);
             pixelCoords = snapResult.snappedRect;
             currentSnapLines = snapResult.lines;

           } else if (drag.mode === 'RESIZING' && drag.initialBoxCoords && drag.resizeHandle) {
             const dx = drag.currentX - drag.startX;
             const dy = drag.currentY - drag.startY;
             const init = drag.initialBoxCoords;
             
             let newX = init.x;
             let newY = init.y;
             let newW = init.width;
             let newH = init.height;

             // Simple resize logic
             if (drag.resizeHandle === 'BR') {
               newW = Math.max(5, init.width + dx);
               newH = Math.max(5, init.height + dy);
             } else if (drag.resizeHandle === 'BL') {
               const right = init.x + init.width;
               newX = Math.min(right - 5, init.x + dx);
               newW = right - newX;
               newH = Math.max(5, init.height + dy);
             } else if (drag.resizeHandle === 'TR') {
               const bottom = init.y + init.height;
               newY = Math.min(bottom - 5, init.y + dy);
               newH = bottom - newY;
               newW = Math.max(5, init.width + dx);
             } else if (drag.resizeHandle === 'TL') {
               const right = init.x + init.width;
               const bottom = init.y + init.height;
               newX = Math.min(right - 5, init.x + dx);
               newY = Math.min(bottom - 5, init.y + dy);
               newW = right - newX;
               newH = bottom - newY;
             }
             
             let proposedRect: Rectangle = { x: newX, y: newY, width: newW, height: newH };

             // Apply snapping for resize (optional, can be more complex)
             const snapResult = calculateSnap(proposedRect, activeId, currentBoxes, documentDimensions);
             pixelCoords = snapResult.snappedRect;
             currentSnapLines = snapResult.lines;
           }

           // Draw Active/Selected Box
           ctx.fillStyle = 'rgba(255, 165, 0, 0.4)';
           ctx.fillRect(pixelCoords.x, pixelCoords.y, pixelCoords.width, pixelCoords.height);
           
           ctx.strokeStyle = 'rgb(255, 140, 0)';
           ctx.lineWidth = 2;
           ctx.strokeRect(pixelCoords.x, pixelCoords.y, pixelCoords.width, pixelCoords.height);

           // Draw Handles for Selected Box (only if not drawing new box)
           if (drag.mode !== 'DRAWING') {
             const handleSize = HANDLE_SIZE;
             const half = handleSize / 2;
             
             const handles = [
               { x: pixelCoords.x - half, y: pixelCoords.y - half },          // TL
               { x: pixelCoords.x + pixelCoords.width - half, y: pixelCoords.y - half }, // TR
               { x: pixelCoords.x - half, y: pixelCoords.y + pixelCoords.height - half }, // BL
               { x: pixelCoords.x + pixelCoords.width - half, y: pixelCoords.y + pixelCoords.height - half } // BR
             ];

             ctx.fillStyle = '#fff';
             ctx.strokeStyle = '#000';
             ctx.lineWidth = 1;

             handles.forEach(pos => {
               ctx.fillRect(pos.x, pos.y, handleSize, handleSize);
               ctx.strokeRect(pos.x, pos.y, handleSize, handleSize);
             });
           }
        }
      }

      // Draw Preview Rectangle (Creating New Box)
      if (drag.mode === 'DRAWING') {
        const x = Math.min(drag.startX, drag.currentX);
        const y = Math.min(drag.startY, drag.currentY);
        const w = Math.abs(drag.currentX - drag.startX);
        const drawH = Math.abs(drag.currentY - drag.startY);

        ctx.strokeStyle = '#0d99ff';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(x, y, w, drawH);
        ctx.setLineDash([]); 

        ctx.fillStyle = 'rgba(13, 153, 255, 0.2)';
        ctx.fillRect(x, y, w, drawH);
      }

      // Draw Snap Guidelines (Blue Lines)
      if (currentSnapLines.length > 0) {
        ctx.strokeStyle = '#0d99ff';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 2]);

        currentSnapLines.forEach(line => {
          ctx.beginPath();
          if (line.axis === 'x') {
            ctx.moveTo(line.value, 0);
            ctx.lineTo(line.value, height);
          } else {
            ctx.moveTo(0, line.value);
            ctx.lineTo(width, line.value);
          }
          ctx.stroke();
        });

        ctx.setLineDash([]);
      }

      // Store snap lines for mouseUp to use
      snapLinesRef.current = currentSnapLines;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [documentDimensions]); 

  // --- Helper to get mouse handle interaction ---
  const getHandleAtPos = (pos: { x: number, y: number }, rect: Rectangle): 'TL' | 'TR' | 'BL' | 'BR' | null => {
    // Check specific points with a bit of tolerance
    const tolerance = 6; 
    
    // Corners
    if (Math.abs(pos.x - rect.x) < tolerance && Math.abs(pos.y - rect.y) < tolerance) return 'TL';
    if (Math.abs(pos.x - (rect.x + rect.width)) < tolerance && Math.abs(pos.y - rect.y) < tolerance) return 'TR';
    if (Math.abs(pos.x - rect.x) < tolerance && Math.abs(pos.y - (rect.y + rect.height)) < tolerance) return 'BL';
    if (Math.abs(pos.x - (rect.x + rect.width)) < tolerance && Math.abs(pos.y - (rect.y + rect.height)) < tolerance) return 'BR';
    
    return null;
  };

  // Get mouse position relative to canvas
  const getMousePos = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = useCallback((e: MouseEvent<HTMLCanvasElement>) => {
    if (!documentDimensions) return;
    const pos = getMousePos(e);
    
    // Nearest Mode interaction (unchanged)
    if (uiMode === 'findNearest') {
      const result = findNearestBox(pos, boxesRef.current, documentDimensions);
      if (result.box) {
        onNearestBoxFound(result.box.id, result.distance);
        onBoxSelect(result.box.id);
      }
      return;
    }

    // Normal Mode
    const selectedId = selectedBoxIdRef.current;
    let selectedBoxRect: Rectangle | null = null;
    let clickedHandle: 'TL' | 'TR' | 'BL' | 'BR' | null = null;

    // 1. Check if clicking handles of currently selected box
    if (selectedId) {
       const box = boxesRef.current.find(b => b.id === selectedId);
       if (box) {
         const px = denormalizeCoords(box.normalizedCoords, documentDimensions.width, documentDimensions.height);
         clickedHandle = getHandleAtPos(pos, px);
         selectedBoxRect = px;
       }
    }

    // Handle Click
    if (clickedHandle && selectedBoxRect) {
      // Start Resizing
      dragStateRef.current = {
        mode: 'RESIZING',
        startX: pos.x,
        startY: pos.y,
        currentX: pos.x,
        currentY: pos.y,
        activeBoxId: selectedId,
        initialBoxCoords: selectedBoxRect,
        resizeHandle: clickedHandle
      };
      return;
    }

    // 2. Check if clicking INSIDE a box (for selection/moving)
    let clickedBoxId: string | null = null;
    let clickedBoxInitialRect: Rectangle | null = null;
    
    // Check reverse to select top-most
    for (let i = boxesRef.current.length - 1; i >= 0; i--) {
      const box = boxesRef.current[i];
      const px = denormalizeCoords(box.normalizedCoords, documentDimensions.width, documentDimensions.height);
      
      if (
        pos.x >= px.x && pos.x <= px.x + px.width &&
        pos.y >= px.y && pos.y <= px.y + px.height
      ) {
        clickedBoxId = box.id;
        clickedBoxInitialRect = px;
        break;
      }
    }

    if (clickedBoxId) {
      onBoxSelect(clickedBoxId);
      // Start Moving
      dragStateRef.current = {
        mode: 'MOVING',
        startX: pos.x,
        startY: pos.y,
        currentX: pos.x,
        currentY: pos.y,
        activeBoxId: clickedBoxId,
        initialBoxCoords: clickedBoxInitialRect,
        resizeHandle: null
      };
    } else {
      // Clicked on empty space -> Start Drawing
      onBoxSelect(null);
      dragStateRef.current = {
        mode: 'DRAWING',
        startX: pos.x,
        startY: pos.y,
        currentX: pos.x,
        currentY: pos.y,
        activeBoxId: null,
        initialBoxCoords: null,
        resizeHandle: null
      };
    }
  }, [documentDimensions, uiMode, onBoxSelect, onNearestBoxFound]);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    if (onPointerMove) {
      onPointerMove(pos);
    }

    const drag = dragStateRef.current;
    if (drag.mode === 'IDLE') return;

    drag.currentX = pos.x;
    drag.currentY = pos.y;
    
    // We don't trigger state updates here to keep it fast, 
    // the render loop picks up dragged positions.
  }, [onPointerMove]);

  const handleMouseUp = useCallback((e: MouseEvent<HTMLCanvasElement>) => {
    const drag = dragStateRef.current;
    if (drag.mode === 'IDLE' || !documentDimensions) return;
    
    const pos = getMousePos(e);

    if (drag.mode === 'DRAWING') {
      // Finish Drawing
      const x = Math.min(drag.startX, pos.x);
      const y = Math.min(drag.startY, pos.y);
      const width = Math.abs(pos.x - drag.startX);
      const height = Math.abs(pos.y - drag.startY);

      if (width >= 5 && height >= 5) {
        const normalized = normalizeCoords(x, y, width, height, documentDimensions.width, documentDimensions.height);
        onBoxCreate(normalized);
      }
    } else if ((drag.mode === 'MOVING' || drag.mode === 'RESIZING') && drag.activeBoxId && drag.initialBoxCoords) {
      // Finish Move/Resize -> Calculate final coords and update
      // Re-calculate the final rect same as the render loop did
      let finalRect = { ...drag.initialBoxCoords };
      const dx = pos.x - drag.startX;
      const dy = pos.y - drag.startY;

      if (drag.mode === 'MOVING') {
        finalRect.x += dx;
        finalRect.y += dy;
      } else if (drag.mode === 'RESIZING' && drag.resizeHandle) {
         const init = drag.initialBoxCoords;
         if (drag.resizeHandle === 'BR') {
           finalRect.width = Math.max(5, init.width + dx);
           finalRect.height = Math.max(5, init.height + dy);
         } else if (drag.resizeHandle === 'BL') {
           const right = init.x + init.width;
           finalRect.x = Math.min(right - 5, init.x + dx);
           finalRect.width = right - finalRect.x;
           finalRect.height = Math.max(5, init.height + dy);
         } else if (drag.resizeHandle === 'TR') {
           const bottom = init.y + init.height;
           finalRect.y = Math.min(bottom - 5, init.y + dy);
           finalRect.height = bottom - finalRect.y;
           finalRect.width = Math.max(5, init.width + dx);
         } else if (drag.resizeHandle === 'TL') {
           const right = init.x + init.width;
           const bottom = init.y + init.height;
           finalRect.x = Math.min(right - 5, init.x + dx);
           finalRect.y = Math.min(bottom - 5, init.y + dy);
           finalRect.width = right - finalRect.x;
           finalRect.height = bottom - finalRect.y;
         }
      }

      // Apply snapping to final rect before committing
      const snapResult = calculateSnap(finalRect, drag.activeBoxId, boxesRef.current, documentDimensions);
      finalRect = snapResult.snappedRect;
      
      const normalized = normalizeCoords(finalRect.x, finalRect.y, finalRect.width, finalRect.height, documentDimensions.width, documentDimensions.height);
      onBoxUpdate(drag.activeBoxId, normalized);
    }

    // Reset Drag State
    dragStateRef.current = {
      mode: 'IDLE',
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      activeBoxId: null,
      initialBoxCoords: null,
      resizeHandle: null
    };
  }, [documentDimensions, onBoxCreate, onBoxUpdate]);

  const handleMouseLeave = useCallback((e: MouseEvent<HTMLCanvasElement>) => {
    if (onPointerMove) onPointerMove(null);
    handleMouseUp(e);
  }, [handleMouseUp, onPointerMove]);

  if (!documentDimensions) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`redaction-canvas ${uiMode === 'findNearest' ? 'find-nearest-mode' : ''}`}
      style={{
        width: documentDimensions.width,
        height: documentDimensions.height,
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 50,
        cursor: uiMode === 'findNearest' ? 'pointer' : 'crosshair',
        pointerEvents: 'auto'
      }}
      width={documentDimensions.width}
      height={documentDimensions.height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    />
  );
};
