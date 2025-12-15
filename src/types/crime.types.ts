export type CrimeLocation = 'docked' | 'orbital' | 'both'

export interface Crime {
  id: string
  name: string
  description: string
  location: CrimeLocation // Where this crime can be performed

  // Requirements
  heartRateCost: number
  requiredLevel: number
  energyCost: number

  // Rewards
  minReward: number
  maxReward: number
  experienceGain: number

  // Item rewards (optional)
  possibleItems?: CrimeItemDrop[]

  // Success rates (percentage)
  baseSuccessRate: number

  // Injury chance (percentage)
  injuryChance?: number

  // Cooldown
  cooldown?: number // in seconds
}

export interface CrimeItemDrop {
  itemId: string
  dropChance: number // 0-100 percentage
  minQuantity: number
  maxQuantity: number
}

export interface CrimeResult {
  success: boolean
  critical: boolean
  injured: boolean

  crime: Crime

  // Rewards earned
  moneyEarned: number
  experienceEarned: number
  itemsFound?: ItemFound[]

  // Damage taken
  healthLost: number

  // Message to display
  message: string

  timestamp: Date
}

export interface ItemFound {
  itemId: string
  itemName: string
  quantity: number
}

export interface CrimeHistory {
  results: CrimeResult[]
  totalAttempts: number
  successfulAttempts: number
  moneyEarned: number
}
