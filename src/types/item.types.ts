//src/types/item.types.ts

export type ItemType =
  | 'weapon'
  | 'armor'
  | 'consumable'
  | 'material'
  | 'special'
  | 'collectible'
export type ItemRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'exotic'

export interface Item {
  id: string
  name: string
  description: string
  type: ItemType
  rarity: ItemRarity
  image?: string
  marketValue: number
  stats?: ItemStats
  effects?: ItemEffects
  stackable: boolean
  tradeable: boolean
  usable: boolean
}

export interface ItemStats {
  damage?: number
  defense?: number
  accuracy?: number
  requiredLevel?: number
  requiredStrength?: number
  requiredDefense?: number
}

export interface ItemEffects {
  healthRestore?: number
  energyRestore?: number
  heartRateRestore?: number
  heatRestore?: number
  strengthBoost?: number
  defenseBoost?: number
  speedBoost?: number
  duration?: number
  dexterityBoost?: number
}

// ...existing code...
export interface InventoryItem {
  item: Item
  quantity: number
  equipped?: boolean
  acquiredAt: Date
}

export interface Equipment {
  weapon?: Item
  armor?: Item
  accessory?: Item
}
