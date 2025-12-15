import type { Point, Rectangle, RedactionBox, NearestBoxResult } from '../types/index';
import { denormalizeCoords } from './coordinates';

/**
 * Checks if a point is inside a rectangular box.
 * A point is considered inside if it falls within the box boundaries (inclusive).
 *
 * @param point - The point to check (x, y coordinates)
 * @param box - The rectangular box to check against
 * @returns true if the point is inside the box, false otherwise
 */
export function isPointInBox(point: Point, box: Rectangle): boolean {
  return (
    point.x >= box.x &&
    point.x <= box.x + box.width &&
    point.y >= box.y &&
    point.y <= box.y + box.height
  );
}

/**
 * Calculates the Euclidean distance from a point to the nearest edge of a box.
 * If the point is inside the box, the distance is 0.
 * Otherwise, calculates the shortest distance to any edge or corner.
 *
 * @param point - The point to measure from
 * @param box - The rectangular box to measure to
 * @returns The Euclidean distance in pixels
 */
export function getDistanceToBox(point: Point, box: Rectangle): number {
  // If the point is inside the box, distance is 0
  if (isPointInBox(point, box)) {
    return 0;
  }

  // Find the closest point on the box to the given point
  // Clamp the point's coordinates to the box boundaries
  const closestX = Math.max(box.x, Math.min(point.x, box.x + box.width));
  const closestY = Math.max(box.y, Math.min(point.y, box.y + box.height));

  // Calculate Euclidean distance from the point to the closest point on the box
  const dx = point.x - closestX;
  const dy = point.y - closestY;

  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Finds the nearest redaction box to a given point and calculates the distance.
 * This is useful for the "find nearest box" feature in the UI.
 *
 * @param point - The point to search from (typically a mouse click position) in PIXEL coordinates
 * @param boxes - Array of redaction boxes to search through (with normalized coordinates)
 * @param documentDimensions - The document dimensions needed to denormalize box coordinates
 * @returns NearestBoxResult containing the nearest box and its distance, or null if no boxes exist
 */
export function findNearestBox(
  point: Point,
  boxes: RedactionBox[],
  documentDimensions: { width: number; height: number }
): NearestBoxResult {
  // Handle empty array case
  if (boxes.length === 0) {
    return {
      box: null,
      distance: Infinity,
    };
  }

  let nearestBox: RedactionBox | null = null;
  let minDistance = Infinity;

  // Iterate through all boxes to find the one with minimum distance
  for (const box of boxes) {
    // Denormalize coordinates from 0-1 range to pixel coordinates
    const rect: Rectangle = denormalizeCoords(
      box.normalizedCoords,
      documentDimensions.width,
      documentDimensions.height
    );

    const distance = getDistanceToBox(point, rect);

    // Update nearest box if this one is closer
    if (distance < minDistance) {
      minDistance = distance;
      nearestBox = box;
    }
  }

  return {
    box: nearestBox,
    distance: minDistance,
  };
}
