//src/data/items/armor.ts
import type { Item } from '../../types/item.types'

export const ARMOR: Item[] = [
  {
    id: 'armor_leather_jacket',
    name: 'Leather Jacket',
    description: 'Basic protection. More style than substance.',
    type: 'armor',
    rarity: 'common',
    marketValue: 1000,
    stackable: false,
    tradeable: true,
    usable: false,
    stats: {
      defense: 5,
      requiredLevel: 1,
    },
  },
  {
    id: 'armor_kevlar_vest',
    name: 'Kevlar Vest',
    description: 'Bulletproof protection. Standard for professionals.',
    type: 'armor',
    rarity: 'uncommon',
    marketValue: 8000,
    stackable: false,
    tradeable: true,
    usable: false,
    stats: {
      defense: 15,
      requiredLevel: 5,
    },
  },
  {
    id: 'armor_tactical_suit',
    name: 'Tactical Suit',
    description: 'Military-grade armor. Mobility and protection.',
    type: 'armor',
    rarity: 'rare',
    marketValue: 25000,
    stackable: false,
    tradeable: true,
    usable: false,
    stats: {
      defense: 25,
      requiredLevel: 10,
    },
    effects: {
      speedBoost: 5,
    },
  },
  {
    id: 'armor_nano_suit',
    name: 'Nano Armor Suit',
    description: 'Self-repairing nano-tech armor. Top-tier protection.',
    type: 'armor',
    rarity: 'epic',
    marketValue: 60000,
    stackable: false,
    tradeable: true,
    usable: false,
    stats: {
      defense: 40,
      requiredLevel: 15,
    },
    effects: {
      strengthBoost: 10,
    },
  },
  {
    id: 'armor_exo_suit',
    name: 'Exo Combat Suit',
    description: 'Powered exoskeleton. Makes you nearly unstoppable.',
    type: 'armor',
    rarity: 'legendary',
    marketValue: 150000,
    stackable: false,
    tradeable: true,
    usable: false,
    stats: {
      defense: 60,
      requiredLevel: 25,
    },
    effects: {
      strengthBoost: 30,
      speedBoost: 10,
    },
  },
]
