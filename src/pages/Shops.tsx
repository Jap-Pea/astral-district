// src/pages/Shops.tsx - small fixes: default tradeable behavior, defensive checks, console warnings
import { useState, useEffect } from 'react'
import { useUser } from '../hooks/useUser'
import { useItem } from '../hooks/useItem'
import { getItemById } from '../data/items/index'
//import { Item } from '../types/item.types'
import type {
  Item,
  ItemType,
  ItemRarity,
  ItemEffects,
} from '../data/items/index'

interface ShopItem {
  itemId: string
  stock: number
  restockDaily: number
}

interface Shop {
  id: string
  name: string
  description: string
  icon: string
  items: ShopItem[]
}

const SHOPS: Shop[] = [
  {
    id: 'pharmacy',
    name: 'City Pharmacy',
    description: 'Medical supplies, first aid, and health items',
    icon: '💊',
    items: [
      { itemId: 'consumable_health_pack', stock: 10, restockDaily: 10 },
      { itemId: 'consumable_medkit', stock: 20, restockDaily: 20 },
      { itemId: 'consumable_nano_med', stock: 5, restockDaily: 5 },
    ],
  },
  {
    id: 'blackmarket',
    name: 'The Black Market',
    description: 'Weapons, lockpicks, and illegal items',
    icon: '🔫',
    items: [
      { itemId: 'weapon_knife', stock: 5, restockDaily: 5 },
      { itemId: 'weapon_bat', stock: 3, restockDaily: 3 },
      { itemId: 'weapon_plasma_blade', stock: 1, restockDaily: 1 },
      { itemId: 'weapon_pistol', stock: 15, restockDaily: 15 },
    ],
  },
  {
    id: 'clothing',
    name: 'Street Wear',
    description: 'Clothing, armor, and protective gear',
    icon: '👕',
    items: [
      { itemId: 'armor_leather_jacket', stock: 8, restockDaily: 8 },
      { itemId: 'armor_kevlar_vest', stock: 2, restockDaily: 2 },
    ],
  },
  {
    id: 'cornerstore',
    name: 'Quick Stop',
    description: 'Basic supplies and everyday items',
    icon: '🏪',
    items: [
      { itemId: 'consumable_energy_drink', stock: 30, restockDaily: 30 },
      { itemId: 'consumable_protein_shake', stock: 10, restockDaily: 10 },
    ],
  },
  {
    id: 'pawnshop',
    name: "Rusty's Pawn Shop",
    description: 'Buy and sell used items, fence stolen goods',
    icon: '🗑️',
    items: [
      { itemId: 'weapon_heavy_pistol', stock: 3, restockDaily: 3 },
      { itemId: 'armor_tactical_suit', stock: 5, restockDaily: 5 },
      { itemId: 'weapon_rifle', stock: 2, restockDaily: 2 },
    ],
  },
  {
    id: 'gym',
    name: 'Iron Paradise Supplements',
    description: 'Fitness supplements and performance enhancers',
    icon: '🏋️',
    items: [
      { itemId: 'consumable_speed_serum', stock: 5, restockDaily: 5 },
      { itemId: 'consumable_focus_pills', stock: 15, restockDaily: 15 },
    ],
  },
]

const Shops = () => {
  const {
    user,
    spendMoney,
    addItemToInventory,
    removeItemFromInventory,
  } = useUser()
  const { sellItem, getItemDefaults } = useItem()

  const [activeShop, setActiveShop] = useState<string | null>(null)
  const [shopStocks, setShopStocks] = useState<Record<string, ShopItem[]>>({})
  const [purchasesToday, setPurchasesToday] = useState(0)
  const [message, setMessage] = useState<string | null>(null)
  const [view, setView] = useState<'buy' | 'sell'>('buy')

  useEffect(() => {
    const stocks: Record<string, ShopItem[]> = {}
    SHOPS.forEach((shop) => {
      stocks[shop.id] = shop.items.map((item) => ({ ...item }))
    })
    setShopStocks(stocks)
  }, [])

  if (!user) return null

  const MAX_DAILY_PURCHASES = 50

  const handleBuyItem = (shopId: string, itemId: string) => {
    if (purchasesToday >= MAX_DAILY_PURCHASES) {
      return setMessage(
        `❌ Daily purchase limit reached! (${MAX_DAILY_PURCHASES} items max)`
      )
    }

    const item = getItemById(itemId)
    if (!item) {
      console.warn(`Shops: item not found for id "${itemId}" (shop ${shopId})`)
      return setMessage('❌ Item not found')
    }

    const shopStock = shopStocks[shopId]?.find((s) => s.itemId === itemId)
    if (!shopStock || shopStock.stock <= 0) {
      return setMessage('❌ Out of stock!')
    }

    if (user.money < (item.value ?? 0)) {
      return setMessage(
        `❌ Not enough money! Need $${(item.value ?? 0).toLocaleString()}`
      )
    }

    if (spendMoney(item.value ?? 0)) {
      // Update stock
      setShopStocks((prev) => ({
        ...prev,
        [shopId]: prev[shopId].map((s) =>
          s.itemId === itemId ? { ...s, stock: s.stock - 1 } : s
        ),
      }))

      setPurchasesToday((prev) => prev + 1)

      // Add to inventory
      addItemToInventory(itemId, 1)

      setMessage(
        `✅ Purchased ${item.name} for $${(item.value ?? 0).toLocaleString()}!`
      )
    }
  }

  const handleSellItem = (itemId: string) => {
    const inventoryItem = user.inventory.find((i) => i.item.id === itemId)
    if (!inventoryItem || inventoryItem.quantity <= 0) {
      return setMessage("❌ You don't have this item")
    }

    if (inventoryItem.equipped) {
      return setMessage('❌ Cannot sell equipped items')
    }

    const { isTradeable } = getItemDefaults(inventoryItem)
    if (!isTradeable) {
      return setMessage('❌ This item cannot be sold')
    }

    const result = sellItem(inventoryItem)
    if (result.success && result.amount) {
      setMessage(
        `✅ Sold ${inventoryItem.item.name} for $${result.amount.toLocaleString()}!`
      )
    } else {
      setMessage('❌ Failed to sell item')
    }
  }

  // Lobby view
  if (!activeShop) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>SHOPS</h1>
          <p style={styles.subtitle}>
            Buy supplies, sell items, and gear up for your next job
          </p>

          <div style={styles.statsBar}>
            <div style={styles.statItem}>
              <span style={{ color: '#888' }}>CASH:</span>
              <span
                style={{
                  color: '#22c55e',
                  fontWeight: 'bold',
                  marginLeft: '0.5rem',
                }}
              >
                ${user.money.toLocaleString()}
              </span>
            </div>
            <div style={styles.statItem}>
              <span style={{ color: '#888' }}>PURCHASES TODAY:</span>
              <span
                style={{
                  color:
                    purchasesToday >= MAX_DAILY_PURCHASES ? '#ef4444' : '#fff',
                  fontWeight: 'bold',
                  marginLeft: '0.5rem',
                }}
              >
                {purchasesToday}/{MAX_DAILY_PURCHASES}
              </span>
            </div>
          </div>
        </div>

        <div style={styles.shopGrid}>
          {SHOPS.map((shop) => (
            <button
              key={shop.id}
              onClick={() => {
                setActiveShop(shop.id)
                setMessage(null)
                setView('buy')
              }}
              style={styles.shopCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.borderColor = '#f59e0b'
                e.currentTarget.style.boxShadow =
                  '0 8px 24px rgba(245, 158, 11, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = '#333'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '1rem' }}>
                {shop.icon}
              </div>
              <h3 style={styles.shopName}>{shop.name}</h3>
              <p style={styles.shopDesc}>{shop.description}</p>
              <div style={styles.shopStats}>
                {shop.items.length} items available
              </div>
            </button>
          ))}
        </div>

        {message && <div style={styles.message}>{message}</div>}
      </div>
    )
  }

  // Shop view
  const currentShop = SHOPS.find((s) => s.id === activeShop)
  if (!currentShop) return null

  const currentStock = shopStocks[activeShop] || []

  return (
    <div style={styles.container}>
      <button
        style={styles.backBtn}
        onClick={() => {
          setActiveShop(null)
          setMessage(null)
        }}
      >
        ← Back to Shops
      </button>

      <div style={styles.shopHeader}>
        <div>
          <div style={{ fontSize: '48px', marginBottom: '0.5rem' }}>
            {currentShop.icon}
          </div>
          <h1 style={styles.shopTitle}>{currentShop.name}</h1>
          <p style={styles.shopSubtitle}>{currentShop.description}</p>
        </div>

        <div style={styles.moneyDisplay}>
          <div style={{ fontSize: '14px', color: '#888' }}>YOUR CASH</div>
          <div
            style={{ fontSize: '32px', fontWeight: 'bold', color: '#22c55e' }}
          >
            ${user.money.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Buy/Sell Toggle */}
      <div style={styles.viewToggle}>
        <button
          onClick={() => setView('buy')}
          style={{
            ...styles.toggleBtn,
            background: view === 'buy' ? '#f59e0b' : '#1a1a1a',
            borderColor: view === 'buy' ? '#f59e0b' : '#333',
          }}
        >
          BUY ITEMS
        </button>
        <button
          onClick={() => setView('sell')}
          style={{
            ...styles.toggleBtn,
            background: view === 'sell' ? '#22c55e' : '#1a1a1a',
            borderColor: view === 'sell' ? '#22c55e' : '#333',
          }}
        >
          SELL ITEMS
        </button>
      </div>

      {/* Buy View */}
      {view === 'buy' && (
        <div style={styles.itemsGrid}>
          {currentStock.map((shopItem) => {
            const item = getItemById(shopItem.itemId)
            if (!item) {
              // warn in console so you can catch ID typos
              console.warn(
                `Shops: no item for id "${shopItem.itemId}" in shop "${activeShop}"`
              )
              return null
            }

            return (
              <div key={shopItem.itemId} style={styles.itemCard}>
                <div style={styles.itemHeader}>
                  <div>
                    <div style={styles.itemName}>{item.name}</div>
                    <div style={styles.itemType}>{item.type.toUpperCase()}</div>
                  </div>
                  <div
                    style={{
                      ...styles.rarityBadge,
                      color: getRarityColor(item.rarity),
                      borderColor: getRarityColor(item.rarity),
                    }}
                  >
                    {item.rarity.toUpperCase()}
                  </div>
                </div>

                {/* description (always show, with fallback) */}
                <p style={styles.itemDesc}>
                  {item.description ?? 'No description available.'}
                </p>

                {/* Unified stats/effects renderer */}
                {(item.stats || item.effects) && (
                  <div style={styles.itemStats}>
                    {/** Merge stats + effects so we show whatever keys exist on the item */}
                    {Object.entries({
                      ...(item.stats ?? {}),
                      ...(item.effects ?? {}),
                    }).map(([key, val]) => {
                      // Human-friendly labels
                      const LABELS: Record<string, string> = {
                        damage: 'Damage',
                        defense: 'Defense',
                        accuracy: 'Accuracy',
                        healthRestore: 'Health',
                        energyRestore: 'Energy',
                        strengthBoost: 'Strength',
                        dexterityBoost: 'Dexterity',
                        speedBoost: 'Speed',
                        defenseBoost: 'Defense',
                        heartRateRestore: 'Heart Rate',
                        duration: 'Duration (min)',
                      }

                      const label =
                        LABELS[key] ??
                        key
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, (s) => s.toUpperCase())

                      // format value (percent for accuracy, + sign for restores, otherwise raw)
                      const formatValue = (k: string, v: any) => {
                        if (k === 'accuracy') return `${v}%`
                        if (k.endsWith('Restore')) return `+${v}`
                        if (k.endsWith('Boost')) return `+${v}`
                        return v
                      }

                      return (
                        <StatRow
                          key={key}
                          label={label}
                          value={formatValue(key, val)}
                        />
                      )
                    })}
                  </div>
                )}

                <div style={styles.itemFooter}>
                  <div style={styles.stockInfo}>
                    <span style={{ color: '#888' }}>Stock:</span>
                    <span
                      style={{
                        color: shopItem.stock > 0 ? '#22c55e' : '#ef4444',
                        fontWeight: 'bold',
                        marginLeft: '0.5rem',
                      }}
                    >
                      {shopItem.stock}
                    </span>
                  </div>

                  <button
                    onClick={() => handleBuyItem(activeShop, shopItem.itemId)}
                    disabled={
                      shopItem.stock <= 0 ||
                      purchasesToday >= MAX_DAILY_PURCHASES
                    }
                    style={{
                      ...styles.buyBtn,
                      opacity:
                        shopItem.stock <= 0 ||
                        purchasesToday >= MAX_DAILY_PURCHASES
                          ? 0.5
                          : 1,
                      cursor:
                        shopItem.stock <= 0 ||
                        purchasesToday >= MAX_DAILY_PURCHASES
                          ? 'not-allowed'
                          : 'pointer',
                    }}
                  >
                    {shopItem.stock <= 0
                      ? 'OUT OF STOCK'
                      : `BUY - $${(item.value ?? 0).toLocaleString()}`}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Sell View */}
      {view === 'sell' && (
        <div style={styles.itemsGrid}>
          {user.inventory
            // treat undefined tradeable as true (only filter out when explicitly false)
            .filter(
              (invItem) => {
                const { isTradeable } = getItemDefaults(invItem)
                return isTradeable && !invItem.equipped
              }
            )
            .map((invItem) => {
              const sellPrice = Math.floor((invItem.item.value ?? 0) * 0.7)

              return (
                <div key={invItem.item.id} style={styles.itemCard}>
                  <div style={styles.itemHeader}>
                    <div>
                      <div style={styles.itemName}>
                        {invItem.item.name}
                        {invItem.quantity > 1 && (
                          <span
                            style={{
                              marginLeft: '0.5rem',
                              color: '#888',
                              fontSize: '14px',
                            }}
                          >
                            x{invItem.quantity}
                          </span>
                        )}
                      </div>
                      <div style={styles.itemType}>
                        {invItem.item.type.toUpperCase()}
                      </div>
                    </div>
                    <div
                      style={{
                        ...styles.rarityBadge,
                        color: getRarityColor(invItem.item.rarity),
                        borderColor: getRarityColor(invItem.item.rarity),
                      }}
                    >
                      {invItem.item.rarity.toUpperCase()}
                    </div>
                  </div>

                  <p style={styles.itemDesc}>{invItem.item.description}</p>

                  <div style={styles.itemFooter}>
                    <div style={styles.priceCompare}>
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        Market Value:
                      </div>
                      <div
                        style={{
                          fontSize: '14px',
                          color: '#666',
                          textDecoration: 'line-through',
                        }}
                      >
                        ${(invItem.item.value ?? 0).toLocaleString()}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#888',
                          marginTop: '0.25rem',
                        }}
                      >
                        Sell For:
                      </div>
                      <div
                        style={{
                          fontSize: '18px',
                          color: '#22c55e',
                          fontWeight: 'bold',
                        }}
                      >
                        ${sellPrice.toLocaleString()}
                      </div>
                    </div>

                    <button
                      onClick={() => handleSellItem(invItem.item.id)}
                      style={styles.sellBtn}
                    >
                      SELL
                    </button>
                  </div>
                </div>
              )
            })}

          {user.inventory.filter(
            (invItem) => {
              const { isTradeable } = getItemDefaults(invItem)
              return isTradeable && !invItem.equipped
            }
          ).length === 0 && (
            <div style={styles.emptyState}>
              <div style={{ fontSize: '48px', marginBottom: '1rem' }}>📦</div>
              <div style={{ fontSize: '18px', color: '#888' }}>
                No items available to sell
              </div>
            </div>
          )}
        </div>
      )}

      {message && <div style={styles.message}>{message}</div>}

      {purchasesToday >= MAX_DAILY_PURCHASES && view === 'buy' && (
        <div style={styles.warningBanner}>
          ⚠️ You've reached your daily purchase limit ({MAX_DAILY_PURCHASES}{' '}
          items). Come back tomorrow!
        </div>
      )}
    </div>
  )
}

// Helper Components
const StatRow = ({
  label,
  value,
  color,
}: {
  label: string
  value: string | number
  color?: string
}) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '13px',
      marginBottom: '0.25rem',
    }}
  >
    <span style={{ color: '#888' }}>{label}:</span>
    <span style={{ color: color || '#fff', fontWeight: 'bold' }}>{value}</span>
  </div>
)

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common':
      return '#9E9E9E'
    case 'uncommon':
      return '#4CAF50'
    case 'rare':
      return '#2196F3'
    case 'epic':
      return '#9C27B0'
    case 'legendary':
      return '#FF9800'
    default:
      return '#fff'
  }
}

// Styles (same as before)
const styles = {
  container: {
    minHeight: '100vh',
    color: '#fff',
    padding: '2rem',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  } as React.CSSProperties,
  header: {
    textAlign: 'center' as const,
    marginBottom: '3rem',
    paddingBottom: '2rem',
    borderBottom: '1px solid #333',
  } as React.CSSProperties,
  title: {
    fontSize: '48px',
    fontWeight: 'bold',
    margin: '0 0 0.5rem 0',
    textTransform: 'uppercase' as const,
    letterSpacing: '4px',
  } as React.CSSProperties,
  subtitle: {
    fontSize: '16px',
    color: '#888',
    margin: '0 0 2rem 0',
  } as React.CSSProperties,
  statsBar: {
    display: 'flex',
    justifyContent: 'center',
    gap: '3rem',
    fontSize: '16px',
  } as React.CSSProperties,
  statItem: { display: 'flex', alignItems: 'center' } as React.CSSProperties,
  shopGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
    maxWidth: '1400px',
    margin: '0 auto',
  } as React.CSSProperties,
  shopCard: {
    background: '#1a1a1a',
    border: '2px solid #333',
    borderRadius: '12px',
    padding: '2rem',
    textAlign: 'center' as const,
    cursor: 'pointer',
    transition: 'all 0.3s',
  } as React.CSSProperties,
  shopName: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 0.5rem 0',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  } as React.CSSProperties,
  shopDesc: {
    fontSize: '14px',
    color: '#888',
    margin: '0 0 1rem 0',
    lineHeight: '1.5',
  } as React.CSSProperties,
  shopStats: {
    fontSize: '12px',
    color: '#666',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  } as React.CSSProperties,
  backBtn: {
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '0.75rem 1.5rem',
    color: '#fff',
    fontSize: '14px',
    cursor: 'pointer',
    marginBottom: '2rem',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  shopHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    paddingBottom: '2rem',
    borderBottom: '1px solid #333',
  } as React.CSSProperties,
  shopTitle: {
    fontSize: '36px',
    fontWeight: 'bold',
    margin: '0 0 0.5rem 0',
    textTransform: 'uppercase' as const,
    letterSpacing: '2px',
  } as React.CSSProperties,
  shopSubtitle: {
    fontSize: '16px',
    color: '#888',
    margin: 0,
  } as React.CSSProperties,
  moneyDisplay: { textAlign: 'right' as const } as React.CSSProperties,
  viewToggle: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    justifyContent: 'center',
  } as React.CSSProperties,
  toggleBtn: {
    padding: '1rem 2rem',
    border: '2px solid',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  } as React.CSSProperties,
  itemsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.5rem',
    maxWidth: '1400px',
    margin: '0 auto',
  } as React.CSSProperties,
  itemCard: {
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '1.5rem',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  } as React.CSSProperties,
  itemName: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '0.25rem',
  } as React.CSSProperties,
  itemType: {
    fontSize: '12px',
    color: '#666',
    letterSpacing: '1px',
  } as React.CSSProperties,
  rarityBadge: {
    fontSize: '10px',
    padding: '0.25rem 0.5rem',
    border: '1px solid',
    borderRadius: '4px',
    fontWeight: 'bold',
    letterSpacing: '1px',
  } as React.CSSProperties,
  itemDesc: {
    fontSize: '14px',
    color: '#888',
    marginBottom: '1rem',
    lineHeight: '1.5',
  } as React.CSSProperties,
  itemStats: {
    background: '#0a0a0a',
    padding: '0.75rem',
    borderRadius: '6px',
    marginBottom: '1rem',
  } as React.CSSProperties,
  itemFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
  } as React.CSSProperties,
  stockInfo: { fontSize: '14px' } as React.CSSProperties,
  buyBtn: {
    background: '#f59e0b',
    border: 'none',
    borderRadius: '6px',
    padding: '0.75rem 1.5rem',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  } as React.CSSProperties,
  sellBtn: {
    background: '#22c55e',
    border: 'none',
    borderRadius: '6px',
    padding: '0.75rem 1.5rem',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  } as React.CSSProperties,
  priceCompare: { textAlign: 'left' as const } as React.CSSProperties,
  message: {
    marginTop: '2rem',
    padding: '1.5rem',
    background: '#1a1a1a',
    border: '2px solid #f59e0b',
    borderRadius: '8px',
    textAlign: 'center' as const,
    fontSize: '16px',
    fontWeight: 'bold',
    maxWidth: '800px',
    margin: '2rem auto 0',
  } as React.CSSProperties,
  warningBanner: {
    marginTop: '2rem',
    padding: '1rem',
    background: '#7f1d1d',
    border: '2px solid #ef4444',
    borderRadius: '8px',
    textAlign: 'center' as const,
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#fff',
  } as React.CSSProperties,
  emptyState: {
    gridColumn: '1 / -1',
    padding: '4rem',
    textAlign: 'center' as const,
  } as React.CSSProperties,
}

export default Shops
