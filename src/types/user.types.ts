import type { InventoryItem, Item } from './item.types'

export type Gender = 'male' | 'female'
export type Race = 'human' | 'gleek' | 'ortanz'

export interface User {
  id: string
  username: string
  gender?: Gender
  race?: Race
  level: number
  experience: number
  experienceToNext: number
  stats: UserStats
  health: number
  maxHealth: number
  energy: number
  maxEnergy: number
  heartRate: number
  maxHeartRate: number
  heat: number
  maxHeat: number
  money: number
  points: number
  age: number
  rank: string
  location: string
  faction?: string
  trainingCount: number // Total gym training sessions for calculating gains scaling
  crimesTally: CrimesTally
  combatTally: CombatTally
  ship?: Ship
  cargo?: Item[]
  activeMissions?: unknown[]
  lastAction: Date
  createdAt: Date
  inventory: InventoryItem[]
  profilePic?: string // base64 image string for avatar
  profilePicOffset?: { x: number; y: number } // position offset for avatar image
  loanHistory?: LoanHistory
}

export interface CrimesTally {
  total: number
  success: number
  failed: number
  critical: number
}

export interface CombatTally {
  attacks: number
  defends: number
  kills: number
  deaths: number
  escapes: number
}

export interface UserStats {
  strength: number
  defense: number
  speed: number
  dexterity: number
}

export interface Loan {
  id: string
  amount: number
  interest: number
  totalOwed: number
  dueDate: Date
  takenAt: Date
  isPaid: boolean
  paidAt?: Date
  wasLate: boolean
  // Running total of repayments made against this loan (principal+interest)
  paidAmount?: number
}

export interface LoanHistory {
  totalLoans: number
  paidOnTime: number
  paidLate: number
  defaulted: number
  currentLoans: Loan[]
  pastLoans: Loan[]
}

export interface Ship {
  id: string
  name: string
  tier: 'basic' | 'advanced' | 'elite' | 'legendary'
  modelPath: string
  price: number
  hull: number
  maxHull: number
  shields: number
  maxShields: number
  cargoCapacity: number
  cargo?: Item[]
  fuelTypes: ('ion' | 'fusion' | 'quantum')[]
  travelTimeReduction: number
  statModifiers?: {
    strength?: number
    defense?: number
    speed?: number
    dexterity?: number
  }
  description: string
}
