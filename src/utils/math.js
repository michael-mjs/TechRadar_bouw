// Deterministic semi-random number generator
function random(seed) {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

/**
 * Calculate blip coordinates within a dynamic quadrant layout.
 * @param {Object} blip - The blip with .ring and .quadrant (original quadrant ID)
 * @param {Array} rings - Ring definitions with .radius
 * @param {number} quadrantCount - Total number of visible quadrant slices
 * @param {number} quadrantSlotIndex - The slot index (0..n-1) this blip's quadrant maps to in the visible layout
 */
export function calculateBlipCoordinates(blip, rings, quadrantCount = 4, quadrantSlotIndex = null) {
  const ringIndex = blip.ring;
  const innerRadius = ringIndex === 0 ? 30 : rings[ringIndex - 1].radius + 20;
  const outerRadius = rings[ringIndex].radius - 20;
  
  const slice = (2 * Math.PI) / quadrantCount;
  
  // Use the remapped slot index if provided, otherwise fall back to blip.quadrant
  const slot = quadrantSlotIndex !== null ? quadrantSlotIndex : blip.quadrant;
  
  let minAngle = slice * slot;
  let maxAngle = slice * (slot + 1);
  
  // Add margin to angles so blips don't overlap the crosshairs
  const margin = Math.min(0.08, slice * 0.1);
  minAngle += margin;
  maxAngle -= margin;

  // Use blip ID for deterministic position
  const rSeed = random(blip.id * 10);
  const aSeed = random(blip.id * 20);
  
  const radius = innerRadius + (outerRadius - innerRadius) * rSeed;
  const angle = minAngle + (maxAngle - minAngle) * aSeed;
  
  const x = radius * Math.cos(angle);
  const y = radius * Math.sin(angle);
  
  return { x, y };
}
