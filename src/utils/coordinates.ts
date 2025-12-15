import type { NormalizedCoords, Rectangle } from '../types/index';

/**
 * Converts pixel coordinates to normalized coordinates (0-1 range).
 * Normalized coordinates are resolution-independent and preserve relative positions
 * when the container is resized.
 *
 * @param x - The x position in pixels
 * @param y - The y position in pixels
 * @param width - The width in pixels
 * @param height - The height in pixels
 * @param containerWidth - The container's width in pixels
 * @param containerHeight - The container's height in pixels
 * @returns NormalizedCoords object with values in 0-1 range
 */
export function normalizeCoords(
  x: number,
  y: number,
  width: number,
  height: number,
  containerWidth: number,
  containerHeight: number
): NormalizedCoords {
  // Validate container dimensions to prevent division by zero
  if (containerWidth <= 0 || containerHeight <= 0) {
    throw new Error('Container dimensions must be greater than zero');
  }

  // Convert pixel values to 0-1 range by dividing by container dimensions
  return {
    x: x / containerWidth,
    y: y / containerHeight,
    width: width / containerWidth,
    height: height / containerHeight,
  };
}

/**
 * Converts normalized coordinates (0-1 range) back to pixel coordinates.
 * This is used to render boxes at the correct position and size for the
 * current container dimensions.
 *
 * @param normalizedCoords - The normalized coordinates (0-1 range)
 * @param containerWidth - The container's width in pixels
 * @param containerHeight - The container's height in pixels
 * @returns Rectangle object with pixel coordinates
 */
export function denormalizeCoords(
  normalizedCoords: NormalizedCoords,
  containerWidth: number,
  containerHeight: number
): Rectangle {
  // Validate container dimensions to prevent invalid calculations
  if (containerWidth <= 0 || containerHeight <= 0) {
    throw new Error('Container dimensions must be greater than zero');
  }

  // Convert 0-1 range values back to pixels by multiplying by container dimensions
  return {
    x: normalizedCoords.x * containerWidth,
    y: normalizedCoords.y * containerHeight,
    width: normalizedCoords.width * containerWidth,
    height: normalizedCoords.height * containerHeight,
  };
}
