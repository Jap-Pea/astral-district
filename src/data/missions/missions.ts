// src/data/missions.ts
// This file contains all available missions organized by category

export interface Mission {
  id: string
  name: string
  description: string
  location: string
  moneyReward: number
  expReward: number
  timeLimit: number // in minutes
  category: 'combat' | 'smuggling' | 'hacking' | 'exploration'
  requirements?: string[]
}

export interface ActiveMission extends Mission {
  acceptedAt: number // timestamp when mission was accepted
  expiresAt: number // timestamp when mission expires
}

// Combat Missions 💥
const COMBAT_MISSIONS: Mission[] = [
  {
    id: 'combat_1',
    name: 'Bounty: Low-Level Target',
    description:
      'Track down and eliminate a small-time criminal. Easy money for beginners.',
    location: 'Earth',
    moneyReward: 15000,
    expReward: 300,
    timeLimit: 60,
    category: 'combat',
    requirements: ['Level 3+'],
  },
  {
    id: 'combat_2',
    name: 'Pirate Patrol',
    description:
      'Clear out a pirate outpost in the asteroid belt. Expect heavy resistance.',
    location: 'Asteroid Belt',
    moneyReward: 35000,
    expReward: 700,
    timeLimit: 90,
    category: 'combat',
    requirements: ['Level 8+', 'Combat Rating: 50+'],
  },
  {
    id: 'combat_3',
    name: 'Gang War Mediation',
    description: 'Take out rival gang leaders. High danger, higher reward.',
    location: 'Mars Colony',
    moneyReward: 60000,
    expReward: 1200,
    timeLimit: 120,
    category: 'combat',
    requirements: ['Level 12+', 'Weapon: Advanced'],
  },
]

// Smuggling Missions 📦
const SMUGGLING_MISSIONS: Mission[] = [
  {
    id: 'smuggling_1',
    name: 'Simple Contraband Run',
    description:
      'Transport illegal goods across the system. Low heat, low stakes.',
    location: 'Moon Base',
    moneyReward: 20000,
    expReward: 400,
    timeLimit: 90,
    category: 'smuggling',
    requirements: ['Cargo Space: 5+'],
  },
  {
    id: 'smuggling_2',
    name: 'Hot Cargo Delivery',
    description:
      'Move highly illegal substances without getting scanned. Police are watching.',
    location: 'Sirius',
    moneyReward: 45000,
    expReward: 900,
    timeLimit: 150,
    category: 'smuggling',
    requirements: ['Level 7+', 'Cargo Space: 10+'],
  },
  {
    id: 'smuggling_3',
    name: 'Black Market Express',
    description: 'Deliver weapons to underground markets. High heat warning.',
    location: 'Alpha Centauri',
    moneyReward: 75000,
    expReward: 1500,
    timeLimit: 180,
    category: 'smuggling',
    requirements: ['Level 15+', 'Cargo Space: 15+', 'Fast Ship'],
  },
]

// Hacking Missions 💻
const HACKING_MISSIONS: Mission[] = [
  {
    id: 'hacking_1',
    name: 'Corporate Spy Work',
    description:
      'Break into a low-security database and steal employee records.',
    location: 'Earth',
    moneyReward: 18000,
    expReward: 350,
    timeLimit: 45,
    category: 'hacking',
    requirements: ['Level 4+', 'Hacking Tools'],
  },
  {
    id: 'hacking_2',
    name: 'Data Heist',
    description:
      'Steal encrypted data from a corporate server. High risk, high reward.',
    location: 'Alpha Centauri',
    moneyReward: 50000,
    expReward: 1000,
    timeLimit: 120,
    category: 'hacking',
    requirements: ['Level 10+', 'Hacking Tools: Advanced'],
  },
  {
    id: 'hacking_3',
    name: 'Government Breach',
    description:
      'Infiltrate government systems. Extremely dangerous, massive payout.',
    location: 'Mars',
    moneyReward: 100000,
    expReward: 2000,
    timeLimit: 180,
    category: 'hacking',
    requirements: ['Level 20+', 'Hacking Tools: Elite', 'Stealth Skills'],
  },
]

// Exploration Missions 🌌
const EXPLORATION_MISSIONS: Mission[] = [
  {
    id: 'exploration_1',
    name: 'Scout Unknown Sector',
    description:
      'Survey an unexplored region and report back. Watch for anomalies.',
    location: 'Outer Rim',
    moneyReward: 12000,
    expReward: 500,
    timeLimit: 120,
    category: 'exploration',
    requirements: ['Level 2+'],
  },
  {
    id: 'exploration_2',
    name: 'Artifact Recovery',
    description:
      'Locate and retrieve ancient alien artifacts from a derelict station.',
    location: 'Deep Space',
    moneyReward: 40000,
    expReward: 800,
    timeLimit: 150,
    category: 'exploration',
    requirements: ['Level 9+', 'Scanning Equipment'],
  },
  {
    id: 'exploration_3',
    name: 'First Contact Protocol',
    description:
      'Investigate strange signals from uncharted territory. Proceed with caution.',
    location: 'Unknown',
    moneyReward: 80000,
    expReward: 1600,
    timeLimit: 200,
    category: 'exploration',
    requirements: ['Level 18+', 'Advanced Ship', 'Translator Module'],
  },
]

// Export all missions
export const ALL_MISSIONS: Mission[] = [
  ...COMBAT_MISSIONS,
  ...SMUGGLING_MISSIONS,
  ...HACKING_MISSIONS,
  ...EXPLORATION_MISSIONS,
]

// Helper function to get missions by category
export const getMissionsByCategory = (
  category: Mission['category']
): Mission[] => {
  return ALL_MISSIONS.filter((mission) => mission.category === category)
}

// Helper function to get mission by ID
export const getMissionById = (id: string): Mission | undefined => {
  return ALL_MISSIONS.find((mission) => mission.id === id)
}
