// src/hooks/useItem.ts
import { useUser } from './useUser'
import type { InventoryItem } from '../types/item.types'

export const useItem = () => {
  const {
    user,
    addMoney,
    removeItemFromInventory,
    useItem: useItemFromContext,
    equipItem: equipItemFromContext,
    unequipItem: unequipItemFromContext,
  } = useUser()

  const useItem = (itemId: string): boolean => {
    return useItemFromContext(itemId)
  }

  const equipItem = (itemId: string): boolean => {
    return equipItemFromContext(itemId)
  }

  const unequipItem = (itemId: string): boolean => {
    return unequipItemFromContext(itemId)
  }

  const sellItem = (invItem: InventoryItem): { success: boolean; amount?: number } => {
    if (!user) return { success: false }

    const marketValue = invItem.item.marketValue ?? 0
    const isTradeable = invItem.item.tradeable ?? true

    if (!isTradeable) {
      return { success: false }
    }

    if (invItem.equipped) {
      return { success: false }
    }

    const sellPrice = Math.floor(marketValue * 0.7)
    addMoney(sellPrice)
    removeItemFromInventory(invItem.item.id, 1)

    return { success: true, amount: sellPrice }
  }

  const getItemDefaults = (invItem: InventoryItem) => {
    return {
      marketValue: invItem.item.marketValue ?? 0,
      isUsable: invItem.item.usable ?? (invItem.item.type === 'consumable'),
      isTradeable: invItem.item.tradeable ?? true,
      isEquippable: invItem.item.type === 'weapon' || invItem.item.type === 'armor',
      sellPrice: Math.floor((invItem.item.marketValue ?? 0) * 0.7),
    }
  }

  return {
    user,
    useItem,
    equipItem,
    unequipItem,
    sellItem,
    getItemDefaults,
  }
}
