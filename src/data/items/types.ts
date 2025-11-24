export type ItemType =
  | 'weapon'
  | 'armor'
  | 'consumable'
  | 'fuel'
  | 'special'
  | 'vehicle'
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface ItemEffects {
  healthRestore?: number
  energyRestore?: number
  heartRateRestore?: number
  heatReduction?: number
  strengthBoost?: number
  defenseBoost?: number
  speedBoost?: number
  dexterityBoost?: number
  duration?: number // in minutes, for temporary effects
}

export interface Item {
  id: string
  name: string
  description: string
  type: ItemType
  rarity: ItemRarity
  value: number
  image?: string
  stackable: boolean
  usable: boolean
  equippable?: boolean
  category?: string
  effects?: ItemEffects
  requirements?: {
    level?: number
    stats?: {
      strength?: number
      defense?: number
      speed?: number
      dexterity?: number
    }
  }
}
