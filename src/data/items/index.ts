//src/data/items/index.ts
import { WEAPONS } from './weapons'
import { ARMOR } from './armor'
import { CONSUMABLES } from './consumables'
import { FUEL } from './fuel'
import { SPECIAL_ITEMS } from './special'

export const ALL_ITEMS: Item[] = [
  ...WEAPONS,
  ...ARMOR,
  ...CONSUMABLES,
  ...FUEL,
  ...SPECIAL_ITEMS,
]

export const getItemById = (id: string): Item | undefined => {
  return ALL_ITEMS.find((item) => item.id === id)
}

export const getItemsByType = (type: ItemType): Item[] => {
  return ALL_ITEMS.filter((item) => item.type === type)
}

export const getItemsByCategory = (category: string): Item[] => {
  return ALL_ITEMS.filter((item) => item.category === category)
}

export const getItemsByRarity = (rarity: ItemRarity): Item[] => {
  return ALL_ITEMS.filter((item) => item.rarity === rarity)
}

// Export all categories
export { WEAPONS, ARMOR, CONSUMABLES, FUEL, SPECIAL_ITEMS }

export type {
  Item,
  ItemType,
  ItemRarity,
  ItemEffects,
} from '../../types/item.types'
