// src/services/mockData/items.ts

import type { Item, InventoryItem } from '../../types/item.types'
import type { User } from '../../types/user.types'

// Helper to find item by ID
export const getItemById = (id: string): Item | undefined => {
  return mockItems.find((item) => item.id === id)
}
//Use item
export function useItem(item: Item, user: User) {
  // Apply basic consumable effects; extend as needed
  const effects = item.effects
  if (!effects) return

  if (effects.healthRestore) {
    user.health = Math.min(user.health + effects.healthRestore, user.maxHealth)
  }
  if (effects.energyRestore) {
    user.energy = Math.min(user.energy + effects.energyRestore, user.maxEnergy)
  }
  if (effects.heartRateRestore) {
    user.heartRate = Math.max(50, user.heartRate - effects.heartRateRestore)
  }
  if (effects.heatRestore) {
    user.heat = Math.max(0, user.heat - effects.heatRestore)
  }
}
// Helper to get items by type
export const getItemsByType = (type: Item['type']): Item[] => {
  return mockItems.filter((item) => item.type === type)
}

export const mockItems: Item[] = [
  {
    id: 'quantum_repair_module',
    name: 'Quantum Repair Module',
    description:
      'Advanced nanite technology that instantly repairs ship hull and shields. Single-use device.',
    type: 'consumable',
    rarity: 'legendary',
    marketValue: 50000,
    image: '/images/items/quantum_repair.png',
    stackable: true,
    usable: false, // Used via repair system, not useItem()
    tradeable: true,
  },
  {
    id: 'weapon_001',
    name: 'Baseball Bat',
    description: 'A wooden baseball bat. Good for more than just sports.',
    type: 'weapon',
    rarity: 'common',
    marketValue: 500,
    stats: {
      damage: 15,
      accuracy: 75,
      requiredLevel: 1,
    },
    stackable: false,
    tradeable: true,
    usable: false,
  },
  {
    id: 'weapon_002',
    name: '9mm Pistol',
    description: 'A reliable semi-automatic handgun.',
    type: 'weapon',
    rarity: 'uncommon',
    marketValue: 5000,
    stats: {
      damage: 45,
      accuracy: 85,
      requiredLevel: 5,
    },
    stackable: false,
    tradeable: true,
    usable: false,
  },
  {
    id: 'weapon_003',
    name: 'Desert Eagle',
    description: 'High-powered pistol with devastating damage.',
    type: 'weapon',
    rarity: 'rare',
    marketValue: 25000,
    stats: {
      damage: 95,
      accuracy: 80,
      requiredLevel: 10,
      requiredStrength: 150,
    },
    stackable: false,
    tradeable: true,
    usable: false,
  },
  {
    id: 'armor_001',
    name: 'Leather Jacket',
    description: 'Basic protection against light attacks.',
    type: 'armor',
    rarity: 'common',
    marketValue: 750,
    stats: {
      defense: 20,
      requiredLevel: 1,
    },
    stackable: false,
    tradeable: true,
    usable: false,
  },
  {
    id: 'armor_002',
    name: 'Kevlar Vest',
    description: 'Military-grade body armor.',
    type: 'armor',
    rarity: 'rare',
    marketValue: 15000,
    stats: {
      defense: 85,
      requiredLevel: 8,
    },
    stackable: false,
    tradeable: true,
    usable: false,
  },
  {
    id: 'consumable_001',
    name: 'First Aid Kit',
    description: 'Restores health quickly.',
    type: 'consumable',
    rarity: 'common',
    marketValue: 200,
    effects: {
      healthRestore: 150,
    },
    stackable: true,
    tradeable: true,
    usable: true,
  },
  {
    id: 'consumable_002',
    name: 'Energy Drink',
    description: 'Restores energy. Tastes terrible.',
    type: 'consumable',
    rarity: 'common',
    marketValue: 150,
    effects: {
      energyRestore: 25,
    },
    stackable: true,
    tradeable: true,
    usable: true,
  },
  {
    id: 'consumable_003',
    name: 'Xanax',
    description: 'Pharmaceutical sedative. Restores Heart Rate.',
    type: 'consumable',
    rarity: 'uncommon',
    marketValue: 500,
    effects: {
      heartRateRestore: 10,
    },
    stackable: true,
    tradeable: true,
    usable: true,
  },
  {
    id: 'special_001',
    name: 'Steroid Injection',
    description: 'Temporary strength boost. Side effects may vary.',
    type: 'special',
    rarity: 'rare',
    marketValue: 3000,
    effects: {
      strengthBoost: 50,
      duration: 3600, // 1 hour
    },
    stackable: true,
    tradeable: true,
    usable: true,
  },
  {
    id: 'material_001',
    name: 'Lockpick',
    description: 'Used for breaking into places.',
    type: 'material',
    rarity: 'common',
    marketValue: 100,
    stackable: true,
    tradeable: true,
    usable: false,
  },
  // FUEL ITEMS
  {
    id: 'fuel_ion_propellant',
    name: 'Ion Propellant',
    description: 'Basic fuel for short-range space travel. Efficient but slow.',
    type: 'consumable',
    rarity: 'common',
    marketValue: 10,
    image: '/images/me.jpg', // Update with your image path
    stackable: true,
    usable: false, // Fuel is consumed via useFuel(), not useItem()
    tradeable: true,
  },
  {
    id: 'fuel_fusion_core',
    name: 'Fusion Core Fuel',
    description:
      'Advanced fuel for medium-range travel. 25% faster and uses 66% less fuel.',
    type: 'consumable',
    rarity: 'uncommon',
    marketValue: 50,
    image: '/images/me.jpg',
    stackable: true,
    usable: false,
    tradeable: true,
  },
  {
    id: 'fuel_quantum_flux',
    name: 'Quantum Flux',
    description:
      'Premium fuel for long-range travel. 50% faster and uses 83% less fuel.',
    type: 'consumable',
    rarity: 'rare',
    marketValue: 200,
    image: '/images/me.jpg',
    stackable: true,
    usable: false,
    tradeable: false,
  },
  {
    id: 'quantum_warp',
    name: 'Quantum Warp Device',
    description:
      'Rare technology that allows travel to the most distant regions of space, including the galactic core.',
    type: 'special',
    rarity: 'legendary',
    marketValue: 250,
    image: '/images/me.jpg',
    stackable: false,
    usable: false,
    tradeable: false,
  },
]

/**
 * Ships are not items in mockItems; keep ships separate.
 * If you want ships to be items, change types accordingly.
 */
export const starterShip = {
  id: 'ship_basic_starter',
  name: 'Nebula Scout',
  tier: 'basic',
  modelPath: '/models/spaceship(2).glb',
  price: 0,
  hull: 100,
  maxHull: 100,
  shields: 50,
  maxShields: 50,
  cargoCapacity: 12,
  fuelTypes: ['ion'],
  travelTimeReduction: 0,
  description: 'A reliable starter vessel. Gets the job done.',
  lastAction: new Date(),
  createdAt: new Date(),
}

export const mockShips = [starterShip]

export const mockInventory: InventoryItem[] = [
  {
    item: getItemById('weapon_002')!, // 9mm Pistol
    quantity: 1,
    equipped: true,
    acquiredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    item: getItemById('armor_001')!, // Leather Jacket
    quantity: 1,
    equipped: true,
    acquiredAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    item: getItemById('consumable_001')!, // First Aid Kit
    quantity: 15,
    equipped: false,
    acquiredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    item: getItemById('consumable_002')!, // Energy Drink
    quantity: 8,
    equipped: false,
    acquiredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    item: getItemById('consumable_003')!, // Xanax
    quantity: 3,
    equipped: false,
    acquiredAt: new Date(),
  },
  {
    item: getItemById('material_001')!, // Lockpick
    quantity: 25,
    equipped: false,
    acquiredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    item: getItemById('fuel_ion_propellant')!, // Ion Propellant
    quantity: 5000,
    equipped: false,
    acquiredAt: new Date(),
  },
]
