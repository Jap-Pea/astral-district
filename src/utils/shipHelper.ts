import { Ship } from '../types/user.types'

/**
 * Apply travel damage to a ship (very slow degradation)
 */
export const applyTravelDamage = (
  ship: Ship,
  travelTimeMinutes: number
): Ship => {
  // Damage scales with travel time, but very slowly
  // Roughly 1% hull/shield damage per hour of travel
  const damagePercent = (travelTimeMinutes / 60) * 0.01
  const hullDamage = Math.floor(ship.maxHull * damagePercent)
  const shieldDamage = Math.floor(ship.maxShields * damagePercent)

  return {
    ...ship,
    hull: Math.max(0, ship.hull - hullDamage),
    shields: Math.max(0, ship.shields - shieldDamage),
  }
}

/**
 * Apply crime damage to a ship (on failed crimes)
 */
export const applyCrimeDamage = (
  ship: Ship,
  failureSeverity: 'minor' | 'moderate' | 'severe'
): Ship => {
  const damageMultipliers = {
    minor: 0.02, // 2% damage
    moderate: 0.05, // 5% damage
    severe: 0.1, // 10% damage
  }

  const multiplier = damageMultipliers[failureSeverity]
  const hullDamage = Math.floor(ship.maxHull * multiplier)
  const shieldDamage = Math.floor(ship.maxShields * multiplier)

  return {
    ...ship,
    hull: Math.max(0, ship.hull - hullDamage),
    shields: Math.max(0, ship.shields - shieldDamage),
  }
}

/**
 * Check if ship is critically damaged
 */
export const isShipCritical = (ship: Ship): boolean => {
  return ship.hull === 0
}

/**
 * Check if ship needs repair warning
 */
export const needsRepairWarning = (ship: Ship): boolean => {
  const hullPercent = (ship.hull / ship.maxHull) * 100
  const shieldPercent = (ship.shields / ship.maxShields) * 100
  return hullPercent < 30 || shieldPercent < 30
}
