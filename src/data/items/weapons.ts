// src/data/items/weapons.ts
import type { Item } from '../../types/item.types'

// ====================
// MAIN WEAPONS (Heavy damage, slower, rifles/cannons)
// ====================
export const MAIN_WEAPONS: Item[] = [
  {
    id: 'plasma_rifle',
    name: 'Plasma Rifle',
    description: 'Standard energy rifle. Reliable and deadly.',
    type: 'weapon',
    weaponCategory: 'main',
    rarity: 'common',
    marketValue: 8000,
    stackable: false,
    tradeable: true,
    usable: false,
    imageUrl: '/images/weapons/Plasma-Rifle.jpg',
    stats: {
      damage: 25,
      accuracy: 70,
      requiredLevel: 1,
    },
  },
  {
    id: 'ion_cannon',
    name: 'Ion Cannon',
    description: 'Heavy electromagnetic weapon. Disrupts shields.',
    type: 'weapon',
    weaponCategory: 'main',
    rarity: 'uncommon',
    marketValue: 18000,
    stackable: false,
    tradeable: true,
    usable: false,
    stats: {
      damage: 35,
      accuracy: 65,
      requiredLevel: 5,
    },
  },
  {
    id: 'gauss_rifle',
    name: 'Gauss Rifle',
    description: 'Electromagnetic projectile weapon. Devastating power.',
    type: 'weapon',
    weaponCategory: 'main',
    rarity: 'rare',
    marketValue: 35000,
    stackable: false,
    tradeable: true,
    usable: false,
    stats: {
      damage: 45,
      accuracy: 68,
      requiredLevel: 10,
    },
  },
  {
    id: 'neutron_cannon',
    name: 'Neutron Cannon',
    description: 'Experimental particle weapon. Ignores most armor.',
    type: 'weapon',
    weaponCategory: 'main',
    rarity: 'epic',
    marketValue: 65000,
    stackable: false,
    tradeable: true,
    usable: false,
    stats: {
      damage: 60,
      accuracy: 72,
      critChance: 10,
      requiredLevel: 15,
    },
  },
  {
    id: 'antimatter_beam',
    name: 'Antimatter Beam Cannon',
    description: 'Ultimate weapon. Pure destructive power.',
    type: 'weapon',
    weaponCategory: 'main',
    rarity: 'legendary',
    marketValue: 150000,
    stackable: false,
    tradeable: true,
    usable: false,
    stats: {
      damage: 80,
      accuracy: 75,
      critChance: 15,
      requiredLevel: 20,
    },
  },
]

// ====================
// SECONDARY WEAPONS (Fast, accurate, pistols/blasters)
// ====================
export const SECONDARY_WEAPONS: Item[] = [
  {
    id: 'laser_pistol',
    name: 'Laser Pistol',
    description: 'Quick-draw sidearm. Fast and accurate.',
    type: 'weapon',
    weaponCategory: 'secondary',
    rarity: 'common',
    marketValue: 3000,
    stackable: false,
    tradeable: true,
    usable: false,
    imageUrl: '/images/weapons/Laser-Pistol.png',
    stats: {
      damage: 15,
      accuracy: 80,
      requiredLevel: 1,
    },
  },
  {
    id: 'photon_blaster',
    name: 'Photon Blaster',
    description: 'High-frequency light weapon. Precise shots.',
    type: 'weapon',
    weaponCategory: 'secondary',
    rarity: 'uncommon',
    marketValue: 8000,
    stackable: false,
    tradeable: true,
    usable: false,
    stats: {
      damage: 22,
      accuracy: 85,
      requiredLevel: 5,
    },
  },
  {
    id: 'arc_pistol',
    name: 'Arc Pistol',
    description: 'Chains electricity. Highly accurate.',
    type: 'weapon',
    weaponCategory: 'secondary',
    rarity: 'rare',
    marketValue: 20000,
    stackable: false,
    tradeable: true,
    usable: false,
    stats: {
      damage: 30,
      accuracy: 88,
      critChance: 8,
      requiredLevel: 10,
    },
  },
  {
    id: 'quantum_sidearm',
    name: 'Quantum Sidearm',
    description: 'Compact antimatter pistol. Deadly precision.',
    type: 'weapon',
    weaponCategory: 'secondary',
    rarity: 'epic',
    marketValue: 50000,
    stackable: false,
    tradeable: true,
    usable: false,
    stats: {
      damage: 40,
      accuracy: 90,
      critChance: 12,
      requiredLevel: 15,
    },
  },
  {
    id: 'void_pistol',
    name: 'Void Pistol',
    description: 'Harnesses dark energy. Never misses.',
    type: 'weapon',
    weaponCategory: 'secondary',
    rarity: 'legendary',
    marketValue: 120000,
    stackable: false,
    tradeable: true,
    usable: false,
    stats: {
      damage: 55,
      accuracy: 95,
      critChance: 20,
      requiredLevel: 20,
    },
  },
]

// ====================
// TEMP WEAPONS (One-time use, guaranteed hit, massive damage)
// ====================
export const TEMP_WEAPONS: Item[] = [
  {
    id: 'frag_grenade',
    name: 'Frag Grenade',
    description: 'Explosive device. One-time use, guaranteed hit.',
    type: 'weapon',
    weaponCategory: 'temp',
    rarity: 'common',
    marketValue: 1500,
    stackable: true,
    tradeable: true,
    usable: true,
    stats: {
      damage: 40,
      accuracy: 100,
      requiredLevel: 1,
    },
    effects: {
      duration: 0, // Consumed on use
    },
  },
  {
    id: 'emp_grenade',
    name: 'EMP Grenade',
    description: 'Disables electronics. Massive shield damage.',
    type: 'weapon',
    weaponCategory: 'temp',
    rarity: 'uncommon',
    marketValue: 4000,
    stackable: true,
    tradeable: true,
    usable: true,
    stats: {
      damage: 55,
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
    weaponCategory: 'temp',
    rarity: 'rare',
    marketValue: 10000,
    stackable: true,
    tradeable: true,
    usable: true,
    stats: {
      damage: 75,
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
    description: 'Micro-nuclear device. Extreme damage.',
    type: 'weapon',
    weaponCategory: 'temp',
    rarity: 'epic',
    marketValue: 25000,
    stackable: true,
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
  {
    id: 'antimatter_charge',
    name: 'Antimatter Charge',
    description: 'Ultimate explosive. Obliterates everything.',
    type: 'weapon',
    weaponCategory: 'temp',
    rarity: 'legendary',
    marketValue: 75000,
    stackable: true,
    tradeable: true,
    usable: true,
    stats: {
      damage: 150,
      accuracy: 100,
      requiredLevel: 20,
    },
    effects: {
      duration: 0,
    },
  },
]

// ====================
// MELEE WEAPONS (Close combat, no ammo, always available)
// ====================
export const MELEE_WEAPONS: Item[] = [
  {
    id: 'combat_knife',
    name: 'Combat Knife',
    description: 'Silent and deadly. Classic assassin weapon.',
    type: 'weapon',
    weaponCategory: 'melee',
    rarity: 'common',
    marketValue: 800,
    stackable: false,
    tradeable: true,
    usable: false,
    stats: {
      damage: 12,
      accuracy: 75,
      requiredLevel: 1,
    },
  },
  {
    id: 'plasma_blade',
    name: 'Plasma Blade',
    description: 'Energy sword. Cuts through anything.',
    type: 'weapon',
    weaponCategory: 'melee',
    rarity: 'rare',
    marketValue: 25000,
    stackable: false,
    tradeable: true,
    usable: false,
    stats: {
      damage: 35,
      accuracy: 82,
      critChance: 15,
      requiredLevel: 10,
    },
  },
  {
    id: 'void_scythe',
    name: 'Void Scythe',
    description: 'Legendary blade forged from dark matter.',
    type: 'weapon',
    weaponCategory: 'melee',
    rarity: 'legendary',
    marketValue: 100000,
    stackable: false,
    tradeable: true,
    usable: false,
    stats: {
      damage: 70,
      accuracy: 88,
      critChance: 25,
      requiredLevel: 20,
    },
  },
]

// Combine all weapons
export const WEAPONS: Item[] = [
  ...MAIN_WEAPONS,
  ...SECONDARY_WEAPONS,
  ...TEMP_WEAPONS,
  ...MELEE_WEAPONS,
]

// Helper functions
export const getWeaponsByCategory = (
  category: 'main' | 'secondary' | 'temp' | 'melee'
) => {
  return WEAPONS.filter((w) => w.weaponCategory === category)
}

export const getMainWeapons = () => MAIN_WEAPONS
export const getSecondaryWeapons = () => SECONDARY_WEAPONS
export const getTempWeapons = () => TEMP_WEAPONS
export const getMeleeWeapons = () => MELEE_WEAPONS
