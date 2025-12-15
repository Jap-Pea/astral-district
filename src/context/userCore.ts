//src/context/userCore.ts ====================
import { createContext } from 'react'
import type { User } from '../types/user.types'

export interface UserContextType {
  user: User | null
  setUser: (user: User) => void
  updateUser: (updates: Partial<User>) => void
  // Resource management
  consumeEnergy: (amount: number) => boolean
  restoreHealth: (amount: number) => void
  restoreEnergy: (amount: number) => void
  // Fuel management
  // HeartRate and Heat management
  increaseHeartRate: (amount: number) => void
  increaseHeat: (amount: number) => void
  checkInjuryRisk: (currentHeartRate?: number) => {
    injured: boolean
    damage: number
  }
  checkArrestRisk: (currentHeat?: number) => boolean
  // Money management
  addMoney: (amount: number) => void
  spendMoney: (amount: number) => boolean
  // Experience management
  addExperience: (amount: number) => void
  // Crime and Combat tracking
  incrementCrimeTally: (field: 'success' | 'failed' | 'critical') => void
  incrementCombatTally: (
    field: 'attacks' | 'defends' | 'kills' | 'deaths' | 'escapes'
  ) => void
  // Jail & Hospital
  sendToJail: (duration: number) => void
  sendToHospital: (duration: number) => void
  attemptJailEscape: () => boolean
  payBail: (amount: number) => boolean
  applyMedInHospital: (timeReduction: number) => void
  // Inventory management
  addItemToInventory: (itemId: string, quantity: number) => boolean
  removeItemFromInventory: (itemId: string, quantity: number) => boolean
  useItem: (itemId: string) => boolean
  equipItem: (itemId: string) => boolean
  unequipItem: (itemId: string) => boolean
  getInventoryItem: (
    itemId: string
  ) => import('../types/item.types').InventoryItem | undefined
  // Traveling
  isTraveling: boolean
  travelTimeRemaining: number
  setIsTraveling: (traveling: boolean) => void
  setTravelTimeRemaining: (time: number) => void
  // Dev controls
  resetToBeginner: () => void
  scaleAllStats: (multiplier: number) => void
  // Dev tick speed toggle (fast ticks for testing)
  devFastTicks: boolean
  toggleDevSpeed: () => void
  // Dev panel visibility
  devPanelOpen: boolean
  toggleDevPanel: () => void
  // Status checks
  isInJail: boolean
  isInHospital: boolean
  jailTimeRemaining: number
  hospitalTimeRemaining: number
  // Loading state
  isLoading: boolean
  // timestamp of last health regen tick (ms since epoch)
  healthLastTick: number
  // Fuel management
  getFuelCount: (fuelType: 'ion' | 'fusion' | 'quantum') => number
  useFuel: (fuelType: 'ion' | 'fusion' | 'quantum', amount: number) => boolean
  // Docking management
  startDocking: () => boolean
  startUndocking: () => boolean
}

export const UserContext = createContext<UserContextType | undefined>(undefined)
