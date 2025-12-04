// src/services/mockData/spaceWeapons.ts
import type { Item } from '../../types/item.types'

// MAIN WEAPONS (Heavy, high damage, slower)
export const MAIN_WEAPONS: Item[] = [
  {
    id: 'plasma_rifle',
    name: 'Plasma Rifle',
    description: 'Standard military-grade energy weapon. Reliable and deadly.',
    type: 'weapon',
    rarity: 'common',
    marketValue: 5000,
    tradeable: true,
    usable: false,
    stats: {
      damage: 15,
      accuracy: 70,
      requiredLevel: 1,
    },
  },
  {
    id: 'ion_cannon',
    name: 'Ion Cannon',
    description:
      'Heavy weapon that disrupts shields and armor with electromagnetic pulses.',
    type: 'weapon',
    rarity: 'uncommon',
    marketValue: 12000,
    tradeable: true,
    usable: false,
    stats: {
      damage: 25,
      accuracy: 65,
      requiredLevel: 5,
    },
  },
  {
    id: 'gauss_launcher',
    name: 'Gauss Launcher',
    description:
      'Electromagnetic projectile weapon. Devastating at close range.',
    type: 'weapon',
    rarity: 'rare',
    marketValue: 25000,
    tradeable: true,
    usable: false,
    stats: {
      damage: 35,
      accuracy: 60,
      requiredLevel: 10,
    },
  },
  {
    id: 'neutron_beam',
    name: 'Neutron Beam Rifle',
    description: 'Experimental energy weapon. Ignores most armor.',
    type: 'weapon',
    rarity: 'epic',
    marketValue: 50000,
    tradeable: true,
    usable: false,
    stats: {
      damage: 50,
      accuracy: 75,
      requiredLevel: 15,
    },
  },
]

// SECONDARY WEAPONS (Fast, lower damage, high accuracy)
export const SECONDARY_WEAPONS: Item[] = [
  {
    id: 'laser_pistol',
    name: 'Laser Pistol',
    description: 'Quick-draw sidearm. Perfect for close encounters.',
    type: 'weapon',
    rarity: 'common',
    marketValue: 2000,
    tradeable: true,
    usable: false,
    stats: {
      damage: 8,
      accuracy: 80,
      requiredLevel: 1,
    },
  },
  {
    id: 'photon_blaster',
    name: 'Photon Blaster',
    description: 'High-frequency light weapon. Fast and accurate.',
    type: 'weapon',
    rarity: 'uncommon',
    marketValue: 6000,
    tradeable: true,
    usable: false,
    stats: {
      damage: 12,
      accuracy: 85,
      requiredLevel: 5,
    },
  },
  {
    id: 'arc_pistol',
    name: 'Arc Pistol',
    description: 'Chains electricity between targets. Highly accurate.',
    type: 'weapon',
    rarity: 'rare',
    marketValue: 15000,
    tradeable: true,
    usable: false,
    stats: {
      damage: 18,
      accuracy: 90,
      requiredLevel: 10,
    },
  },
  {
    id: 'antimatter_sidearm',
    name: 'Antimatter Sidearm',
    description: 'Compact but incredibly powerful. Military-grade.',
    type: 'weapon',
    rarity: 'epic',
    marketValue: 30000,
    tradeable: true,
    usable: false,
    stats: {
      damage: 28,
      accuracy: 88,
      requiredLevel: 15,
    },
  },
]

// TEMP WEAPONS (One-time use, massive damage)
export const TEMP_WEAPONS: Item[] = [
  {
    id: 'frag_grenade',
    name: 'Frag Grenade',
    description: 'Explosive device. One-time use, guaranteed hit.',
    type: 'weapon',
    rarity: 'common',
    marketValue: 1000,
    tradeable: true,
    usable: true,
    stats: {
      damage: 30,
      accuracy: 100,
      requiredLevel: 1,
    },
    effects: {
      duration: 0, // One-time use
    },
  },
  {
    id: 'emp_grenade',
    name: 'EMP Grenade',
    description: 'Disables shields and electronics. Massive damage bonus.',
    type: 'weapon',
    rarity: 'uncommon',
    marketValue: 3000,
    tradeable: true,
    usable: true,
    stats: {
      damage: 45,
      accuracy: 100,
      requiredLevel: 5,
    },
    effects: {
      duration: 0,
    },
  },
  {
    id: 'plasma_mine',
    name: 'Plasma Mine',
    description: 'Proximity explosive. Devastating area damage.',
    type: 'weapon',
    rarity: 'rare',
    marketValue: 8000,
    tradeable: true,
    usable: true,
    stats: {
      damage: 60,
      accuracy: 100,
      requiredLevel: 10,
    },
    effects: {
      duration: 0,
    },
  },
  {
    id: 'fusion_bomb',
    name: 'Fusion Bomb',
    description: 'Micro-nuclear device. Extreme damage, one-time use.',
    type: 'weapon',
    rarity: 'epic',
    marketValue: 20000,
    tradeable: true,
    usable: true,
    stats: {
      damage: 100,
      accuracy: 100,
      requiredLevel: 15,
    },
    effects: {
      duration: 0,
    },
  },
]

// ARMOR (Defense items)
export const ARMOR_ITEMS: Item[] = [
  {
    id: 'combat_vest',
    name: 'Combat Vest',
    description: 'Basic protection. Better than nothing.',
    type: 'armor',
    rarity: 'common',
    marketValue: 3000,
    tradeable: true,
    usable: false,
    stats: {
      defense: 8,
      requiredLevel: 1,
    },
  },
  {
    id: 'tactical_suit',
    name: 'Tactical Suit',
    description: 'Lightweight armor with shield integration.',
    type: 'armor',
    rarity: 'uncommon',
    marketValue: 8000,
    tradeable: true,
    usable: false,
    stats: {
      defense: 15,
      requiredLevel: 5,
    },
  },
  {
    id: 'nano_armor',
    name: 'Nano-Fiber Armor',
    description: 'Self-repairing molecular armor. Military grade.',
    type: 'armor',
    rarity: 'rare',
    marketValue: 20000,
    tradeable: true,
    usable: false,
    stats: {
      defense: 25,
      requiredLevel: 10,
    },
  },
  {
    id: 'exo_suit',
    name: 'Exo-Suit MK-VII',
    description: 'Powered armor suit. Maximum protection.',
    type: 'armor',
    rarity: 'epic',
    marketValue: 50000,
    tradeable: true,
    usable: false,
    stats: {
      defense: 40,
      requiredLevel: 15,
    },
  },
]

// All items combined
export const ALL_COMBAT_ITEMS: Item[] = [
  ...MAIN_WEAPONS,
  ...SECONDARY_WEAPONS,
  ...TEMP_WEAPONS,
  ...ARMOR_ITEMS,
]

// Helper function to get items by type
export const getItemsByType = (
  type: 'main' | 'secondary' | 'temp' | 'armor'
) => {
  switch (type) {
    case 'main':
      return MAIN_WEAPONS
    case 'secondary':
      return SECONDARY_WEAPONS
    case 'temp':
      return TEMP_WEAPONS
    case 'armor':
      return ARMOR_ITEMS
    default:
      return []
  }
}

// Helper to categorize a weapon
export const categorizeWeapon = (
  itemName: string
): 'main' | 'secondary' | 'temp' | null => {
  const name = itemName.toLowerCase()

  if (
    name.includes('rifle') ||
    name.includes('cannon') ||
    name.includes('launcher') ||
    name.includes('beam')
  ) {
    return 'main'
  }
  if (
    name.includes('pistol') ||
    name.includes('blaster') ||
    name.includes('sidearm')
  ) {
    return 'secondary'
  }
  if (
    name.includes('grenade') ||
    name.includes('mine') ||
    name.includes('bomb')
  ) {
    return 'temp'
  }

  return null
}
