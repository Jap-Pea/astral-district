// src/services/mockData/users.ts
import { mockInventory } from './items'
import type { User, CrimesTally, CombatTally } from '../../types/user.types'

export const mockUser: User = {
  id: 'user_001',
  username: 'Jay Pea',
  level: 0,
  experience: 0,
  experienceToNext: 55,

  stats: {
    strength: 1.0,
    defense: 1.0,
    speed: 1.0,
    dexterity: 1.0,
  },

  health: 500,
  maxHealth: 500,
  energy: 100,
  maxEnergy: 100,
  heartRate: 50,
  maxHeartRate: 140,
  heat: 0,
  maxHeat: 100,

  money: 0,
  points: 0,

  crimesTally: {
    total: 0,
    success: 0,
    failed: 0,
    critical: 0,
  },

  combatTally: {
    attacks: 0,
    defends: 0,
    kills: 0,
    deaths: 0,
    escapes: 0,
  },

  age: 0, // days
  rank: 'A Nobody',
  location: 'Earth',
  trainingCount: 0, // Total gym sessions for calculating gains

  lastAction: new Date(),
  createdAt: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000),
  inventory: mockInventory,
}

// Helper function to update user stats
export const updateUserStats = (user: User, updates: Partial<User>): User => {
  return {
    ...user,
    ...updates,
    lastAction: new Date(),
  }
}
export const incrementCrime = (user: User, field: keyof CrimesTally): User => {
  return updateUserStats(user, {
    crimesTally: {
      ...user.crimesTally,
      total: user.crimesTally.total + 1,
      [field]: user.crimesTally[field] + 1,
    },
  })
}

export const incrementCombat = (user: User, field: keyof CombatTally): User => {
  return updateUserStats(user, {
    combatTally: {
      ...user.combatTally,
      [field]: user.combatTally[field] + 1,
    },
  })
}
