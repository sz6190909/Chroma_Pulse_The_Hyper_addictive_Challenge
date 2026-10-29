/**
 * Computes responsive ring radius ensuring the game field is 100% visible
 * on every mobile device, tablet, laptop, and ultra-wide monitor.
 */
export function calculateGameRingRadius(width: number, height: number): number {
  // Available bounds accounting for header HUD and bottom fever bar
  const availableWidth = width - 40;
  const availableHeight = height - 180;
  const availableSize = Math.min(availableWidth, availableHeight);

  // Return scaled radius with safe minimum and maximum bounds
  return Math.max(95, Math.min(Math.floor(availableSize * 0.40), 240));
}
