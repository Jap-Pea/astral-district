// Helpers that encapsulate randomness and decision logic so components don't call
// Math.random during render. Keep these in a separate module to avoid fast-refresh
// warnings when used from component files.

export const rollPercentage = () => Math.random() * 100

export const computeInjuryDecision = (heartRate: number, maxHealth: number, maxHeartRate: number) => {
  // Danger zone starts at 90% of max heart rate
  const dangerThreshold = maxHeartRate * 0.9
  if (heartRate <= dangerThreshold) return { injured: false, damage: 0 }
  
  // Calculate how far over the threshold (as a percentage of the danger zone)
  const dangerZone = maxHeartRate - dangerThreshold
  const overLimit = heartRate - dangerThreshold
  const dangerPercent = overLimit / dangerZone // 0 to 1
  
  // Injury chance scales from 0% to 90% as you approach max
  const injuryChance = Math.min(dangerPercent * 90, 90)
  const roll = rollPercentage()
  
  if (roll < injuryChance) {
    // Damage scales from 5% to 25% of max health
    const damagePercent = 0.05 + dangerPercent * 0.2
    const damage = Math.floor(maxHealth * damagePercent)
    return { injured: true, damage }
  }
  return { injured: false, damage: 0 }
}

export const computeArrestDecision = (heat: number) => {
  if (heat <= 75) return { arrested: false, jailMinutes: 0 }
  const overLimit = heat - 75
  const arrestChance = Math.min((overLimit / 25) * 100, 95)
  const roll = rollPercentage()
  if (roll < arrestChance) {
    const jailMinutes = Math.floor(10 + (overLimit / 25) * 50)
    return { arrested: true, jailMinutes }
  }
  return { arrested: false, jailMinutes: 0 }
}

export const computeEscapeRoll = (chancePercent: number) => {
  const roll = rollPercentage()
  return roll < chancePercent
}

export const computeTrainingGain = (membershipBonus: number = 0) => {
  // Random gain between 0.01 and 0.2
  const randomGain = 0.01 + Math.random() * 0.19

  // Membership multiplier (e.g., 10% bonus = 1.1x multiplier)
  const membershipMultiplier = 1 + membershipBonus / 100

  // Final gain: randomGain * membershipMultiplier
  const gain = Math.round(randomGain * membershipMultiplier * 1000) / 1000

  // Calculate variance for display (percentage increase from membership bonus)
  const variance = Math.round((membershipMultiplier - 1) * 100)

  return { gain, variance }
}
