// src/types/item.types.ts - UPDATED WITH COMBAT STATS

export type ItemType =
  | 'weapon'
  | 'armor'
  | 'consumable'
  | 'fuel'
  | 'special'
  | 'material'
  | 'collectible'

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

// NEW: Weapon categories for combat slots
export type WeaponCategory = 'main' | 'secondary' | 'temp' | 'melee'

export interface ItemStats {
  // Combat stats (for weapons)
  damage?: number // Base damage in combat
  accuracy?: number // Hit chance bonus (0-100)
  critChance?: number // Critical hit chance bonus

  // Defense stats (for armor)
  defense?: number // Damage reduction

  // Stat boosts (for equipment)
  strengthBoost?: number
  defenseBoost?: number
  speedBoost?: number
  dexterityBoost?: number

  // Requirements
  requiredLevel?: number
  requiredStats?: {
    strength?: number
    defense?: number
    speed?: number
    dexterity?: number
  }
}

export interface ItemEffects {
  // Restoration
  healthRestore?: number
  energyRestore?: number
  heartRateRestore?: number // Reduces heart rate
  heatReduction?: number // Reduces police heat

  // Stat boosts (temporary from consumables)
  strengthBoost?: number
  defenseBoost?: number
  speedBoost?: number
  dexterityBoost?: number

  // Duration for temporary effects (in minutes)
  duration?: number

  // Crime bonuses (from special items)
  crimeSuccessBonus?: number // % increase to crime success
  heatGainReduction?: number // % reduction in heat gain
  arrestChanceReduction?: number // % reduction in arrest chance
}

export interface Item {
  id: string
  name: string
  description: string
  type: ItemType
  rarity: ItemRarity
  marketValue?: number
  value?: number // Deprecated, use marketValue instead

  // Display
  image?: string
  imageUrl?: string
  icon?: string

  // Properties
  stackable: boolean
  tradeable: boolean
  usable: boolean // Can be "used" (consumables, temp weapons)
  equippable?: boolean // DEPRECATED - use category instead

  // NEW: Weapon category for combat system
  weaponCategory?: WeaponCategory // 'main', 'secondary', 'temp', 'melee'

  // OLD: General category (keep for backwards compatibility)
  category?: string

  // Stats and effects
  stats?: ItemStats
  effects?: ItemEffects

  // Ship-specific (for ship items)
  shipStats?: {
    hullBonus?: number
    shieldBonus?: number
    cargoBonus?: number
    speedBonus?: number
  }
}

export interface InventoryItem {
  item: Item
  quantity: number
  equipped: boolean
  acquiredAt: Date
}
