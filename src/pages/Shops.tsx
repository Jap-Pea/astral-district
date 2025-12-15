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
  shopkeeperImage?: string
  shopkeeperDialogue?: string
  items: ShopItem[]
}

const SHOPS: Shop[] = [
  {
    id: 'pharmacy',
    name: 'Pharmacy',
    description: 'Medical supplies, first aid, and health items',
    icon: <img src="/images/icons/health.png"></img>,
    shopkeeperImage: '/images/shopkeepers/pharmacist.jpg',
    shopkeeperDialogue:
      "Welcome! Need something to patch yourself up? I've got the best medical supplies in the district.",
    items: [
      { itemId: 'health_pack', stock: 10, restockDaily: 10 },
      { itemId: 'medkit', stock: 20, restockDaily: 20 },
      { itemId: 'nano_med', stock: 5, restockDaily: 5 },
      { itemId: 'bandage', stock: 30, restockDaily: 30 },
      { itemId: 'trauma_kit', stock: 3, restockDaily: 3 },
    ],
  },
  {
    id: 'blackmarket',
    name: 'The Black Market',
    description: 'Weapons, lockpicks, and illegal items',
    icon: '🔫',
    shopkeeperImage: '/images/shopkeepers/blackmarket.png',
    shopkeeperDialogue:
      "Psst... looking for something special? I've got what you need. No questions asked, no records kept.",
    items: [
      { itemId: 'plasma_rifle', stock: 5, restockDaily: 5 },
      { itemId: 'ion_cannon', stock: 3, restockDaily: 3 },
      { itemId: 'laser_pistol', stock: 1, restockDaily: 1 },
      { itemId: 'frag_grenade', stock: 15, restockDaily: 15 },
    ],
  },
  {
    id: 'clothing',
    name: 'Street Wear',
    description: 'Clothing, armor, and protective gear',
    icon: '👕',
    shopkeeperImage: '/images/shopkeepers/clothing.jpg',
    shopkeeperDialogue:
      "Hey! Looking for some fresh threads? We've got style and protection all in one. Try something on!",
    items: [
      { itemId: 'leather_jacket', stock: 8, restockDaily: 8 },
      { itemId: 'kevlar_vest', stock: 2, restockDaily: 2 },
    ],
  },
  {
    id: 'cornerstore',
    name: 'Quick Stop',
    description: 'Basic supplies and everyday items',
    icon: '🏪',
    shopkeeperImage: '/images/shopkeepers/cornerstore.png',
    shopkeeperDialogue:
      "Welcome to Quick Stop! Grab what you need and let's get you back out there. We're open 24/7!",
    items: [
      { itemId: 'energy_drink', stock: 30, restockDaily: 30 },
      { itemId: 'protein_shake', stock: 10, restockDaily: 10 },
      { itemId: 'coffee', stock: 50, restockDaily: 50 },
    ],
  },
  {
    id: 'pawnshop',
    name: "Rusty's Pawn Shop",
    description: 'Buy and sell used items, fence stolen goods',
    icon: '🗑️',
    shopkeeperImage: '/images/shopkeepers/pawnshop.png',
    shopkeeperDialogue:
      "Welcome to Rusty's! Everything here has a history. Looking to buy or sell? Either way, I'll make it worth your while.",
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
    shopkeeperImage: '/images/shopkeepers/gym.png',
    shopkeeperDialogue:
      'Yo! Ready to level up your game? These supplements will push your limits beyond what you thought possible!',
    items: [
      { itemId: 'speed_serum', stock: 5, restockDaily: 5 },
      { itemId: 'focus_pills', stock: 15, restockDaily: 15 },
      { itemId: 'neural_enhancer', stock: 3, restockDaily: 3 },
    ],
  },
]

const Shops = () => {
  const { user, spendMoney, addItemToInventory, removeItemFromInventory } =
    useUser()
  const { sellItem, getItemDefaults } = useItem()

  const [activeShop, setActiveShop] = useState<string | null>(null)
  const [shopStocks, setShopStocks] = useState<Record<string, ShopItem[]>>({})
  const [purchasesToday, setPurchasesToday] = useState(0)
  const [message, setMessage] = useState<string | null>(null)
  const [view, setView] = useState<'buy' | 'sell'>('buy')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Set shops background based on active shop
    const layoutContainer = document.querySelector(
      '.layout-container'
    ) as HTMLElement
    if (layoutContainer) {
      if (activeShop === 'pharmacy') {
        layoutContainer.style.background =
          "url('/images/shops/pharmacy.jpg') center/cover fixed"
      } else if (activeShop) {
        // Other shops - keep shops.jpg for now
        layoutContainer.style.background =
          "url('/images/shops/shops.jpg') center/cover fixed"
      } else {
        // Lobby view
        layoutContainer.style.background =
          "url('/images/shops/shops.jpg') center/cover fixed"
      }
    }

    // Cleanup on unmount
    return () => {
      if (layoutContainer) {
        layoutContainer.style.background =
          "url('/images/dashboard-bg.jpg') center/cover fixed"
      }
    }
  }, [activeShop])

  useEffect(() => {
    const stocks: Record<string, ShopItem[]> = {}
    SHOPS.forEach((shop) => {
      stocks[shop.id] = shop.items.map((item) => ({ ...item }))
    })
    setShopStocks(stocks)
  }, [])

  if (!user) return null

  const MAX_DAILY_PURCHASES = 50

  // Helper to get item price (supports both value and marketValue)
  const getItemPrice = (item: Item): number => {
    return item.marketValue ?? item.value ?? 0
  }

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

    const itemPrice = getItemPrice(item)

    if (user.money < itemPrice) {
      return setMessage(
        `❌ Not enough money! Need $${itemPrice.toLocaleString()}`
      )
    }

    console.log(
      `[Shops] Before purchase - Money: $${user.money}, Item cost: $${itemPrice}`
    )
    const spendSuccess = spendMoney(itemPrice)
    console.log(`[Shops] spendMoney result:`, spendSuccess)

    if (spendSuccess) {
      // Update stock
      setShopStocks((prev) => ({
        ...prev,
        [shopId]: prev[shopId].map((s) =>
          s.itemId === itemId ? { ...s, stock: s.stock - 1 } : s
        ),
      }))

      setPurchasesToday((prev) => prev + 1)

      // Add to inventory
      const addSuccess = addItemToInventory(itemId, 1)
      console.log(
        `[Shops] addItemToInventory result:`,
        addSuccess,
        `for item:`,
        itemId
      )
      console.log(`[Shops] Current inventory:`, user.inventory)
      console.log(
        `[Shops] After purchase - Money should be: $${user.money - itemPrice}`
      )

      setMessage(
        `✅ Purchased ${item.name} for $${itemPrice.toLocaleString()}!`
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
        `✅ Sold ${
          inventoryItem.item.name
        } for $${result.amount.toLocaleString()}!`
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2rem',
          }}
        >
          <div>
            <h1 style={styles.shopTitle}>{currentShop.name}</h1>
            <p style={styles.shopSubtitle}>{currentShop.description}</p>
          </div>
          {currentShop.shopkeeperImage && (
            <img
              src={currentShop.shopkeeperImage}
              alt={`${currentShop.name} shopkeeper`}
              style={{
                width: '200px',
                height: '200px',
                objectFit: 'cover' as const,
                borderRadius: '12px',
                border: '3px solid #333',
              }}
            />
          )}
          {currentShop.shopkeeperDialogue && (
            <div
              style={{
                position: 'relative' as const,
                background: '#1a1a1a',
                border: '2px solid #f59e0b',
                borderRadius: '12px',
                padding: '1.5rem',
                maxWidth: '300px',
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div
                style={{
                  position: 'absolute' as const,
                  left: '-10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 0,
                  height: 0,
                  borderTop: '10px solid transparent',
                  borderBottom: '10px solid transparent',
                  borderRight: '10px solid #f59e0b',
                }}
              />
              {currentShop.shopkeeperDialogue}
            </div>
          )}
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

      {/* Message above buy/sell buttons */}
      {message && <div style={styles.message}>{message}</div>}

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

            const isExpanded = expandedItems.has(shopItem.itemId)

            return (
              <div key={shopItem.itemId} style={styles.itemCard}>
                <div style={styles.compactItemLayout}>
                  {item.imageUrl && (
                    <div style={styles.compactImageContainer}>
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        style={styles.itemImage}
                      />
                    </div>
                  )}
                  <div style={styles.compactInfo}>
                    <div style={styles.itemName}>{item.name}</div>
                    <div style={styles.compactPriceStock}>
                      <span style={styles.priceText}>
                        ${getItemPrice(item).toLocaleString()}
                      </span>
                      <span style={styles.stockText}>
                        Stock:{' '}
                        <span
                          style={{
                            color: shopItem.stock > 0 ? '#22c55e' : '#ef4444',
                            fontWeight: 'bold',
                          }}
                        >
                          {shopItem.stock}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div style={styles.compactActions}>
                    <button
                      onClick={() =>
                        setExpandedItems((prev) => {
                          const newSet = new Set(prev)
                          if (isExpanded) {
                            newSet.delete(shopItem.itemId)
                          } else {
                            newSet.add(shopItem.itemId)
                          }
                          return newSet
                        })
                      }
                      style={styles.detailsBtn}
                    >
                      {isExpanded ? 'HIDE DETAILS' : 'DETAILS'}
                    </button>

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
                      BUY - ${getItemPrice(item).toLocaleString()}
                    </button>
                  </div>
                </div>

                {/* Expanded details section */}
                {isExpanded && (
                  <div style={styles.expandedDetails}>
                    {item.imageUrl && (
                      <div style={styles.expandedImageContainer}>
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          style={styles.expandedImage}
                        />
                      </div>
                    )}
                    <p style={styles.itemDesc}>
                      {item.description ?? 'No description available.'}
                    </p>

                    {/* Unified stats/effects renderer */}
                    {(item.stats || item.effects) && (
                      <div style={styles.itemStats}>
                        {Object.entries({
                          ...(item.stats ?? {}),
                          ...(item.effects ?? {}),
                        }).map(([key, val]) => {
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

                          const formatValue = (
                            k: string,
                            v: number | string
                          ) => {
                            if (k === 'accuracy') return `${v}%`
                            if (k.endsWith('Restore')) return `+${v}`
                            if (k.endsWith('Boost')) return `+${v}`
                            return v
                          }

                          return (
                            <StatRow
                              key={key}
                              label={label}
                              value={formatValue(key, val as number | string)}
                            />
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Sell View */}
      {view === 'sell' && (
        <div style={styles.itemsGrid}>
          {user.inventory
            .filter((invItem) => {
              const { isTradeable } = getItemDefaults(invItem)
              return isTradeable && !invItem.equipped
            })
            .map((invItem) => {
              const sellPrice = Math.floor(getItemPrice(invItem.item) * 0.7)
              const isExpanded = expandedItems.has(invItem.item.id)
              return (
                <div key={invItem.item.id} style={styles.itemCard}>
                  <div style={styles.compactItemLayout}>
                    {invItem.item.imageUrl && (
                      <div style={styles.compactImageContainer}>
                        <img
                          src={invItem.item.imageUrl}
                          alt={invItem.item.name}
                          style={styles.itemImage}
                        />
                      </div>
                    )}
                    <div style={styles.compactInfo}>
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
                      <div style={styles.compactPriceStock}>
                        <span style={styles.priceText}>
                          Sell: ${sellPrice.toLocaleString()}
                        </span>
                        <span style={styles.stockText}>
                          Owned:{' '}
                          <span
                            style={{ color: '#22c55e', fontWeight: 'bold' }}
                          >
                            {invItem.quantity}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div style={styles.compactActions}>
                      <button
                        onClick={() =>
                          setExpandedItems((prev) => {
                            const newSet = new Set(prev)
                            if (isExpanded) {
                              newSet.delete(invItem.item.id)
                            } else {
                              newSet.add(invItem.item.id)
                            }
                            return newSet
                          })
                        }
                        style={styles.detailsBtn}
                      >
                        {isExpanded ? 'HIDE DETAILS' : 'DETAILS'}
                      </button>
                      <button
                        onClick={() => handleSellItem(invItem.item.id)}
                        style={styles.sellBtn}
                      >
                        SELL - ${sellPrice.toLocaleString()}
                      </button>
                    </div>
                  </div>
                  {/* Expanded details section */}
                  {isExpanded && (
                    <div style={styles.expandedDetails}>
                      {invItem.item.imageUrl && (
                        <div style={styles.expandedImageContainer}>
                          <img
                            src={invItem.item.imageUrl}
                            alt={invItem.item.name}
                            style={styles.expandedImage}
                          />
                        </div>
                      )}
                      <p style={styles.itemDesc}>
                        {invItem.item.description ??
                          'No description available.'}
                      </p>
                      {/* Unified stats/effects renderer */}
                      {(invItem.item.stats || invItem.item.effects) && (
                        <div style={styles.itemStats}>
                          {Object.entries({
                            ...(invItem.item.stats ?? {}),
                            ...(invItem.item.effects ?? {}),
                          }).map(([key, val]) => {
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
                            const formatValue = (
                              k: string,
                              v: number | string
                            ) => {
                              if (k === 'accuracy') return `${v}%`
                              if (k.endsWith('Restore')) return `+${v}`
                              if (k.endsWith('Boost')) return `+${v}`
                              return v
                            }
                            return (
                              <StatRow
                                key={key}
                                label={label}
                                value={formatValue(key, val as number | string)}
                              />
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

          {user.inventory.filter((invItem) => {
            const { isTradeable } = getItemDefaults(invItem)
            return isTradeable && !invItem.equipped
          }).length === 0 && (
            <div style={styles.emptyState}>
              <div style={{ fontSize: '48px', marginBottom: '1rem' }}>📦</div>
              <div style={{ fontSize: '18px', color: '#888' }}>
                No items available to sell
              </div>
            </div>
          )}
        </div>
      )}

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
    padding: '1rem 1rem',
    border: '1px solid',
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
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
    maxWidth: '800px',
    margin: '0 auto',
  } as React.CSSProperties,
  itemCard: {
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  compactItemLayout: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  } as React.CSSProperties,
  compactImageContainer: {
    width: '60px',
    height: '60px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a0a0a',
    borderRadius: '6px',
    overflow: 'hidden',
  } as React.CSSProperties,
  compactInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  } as React.CSSProperties,
  compactPriceStock: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  } as React.CSSProperties,
  priceText: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#f59e0b',
  } as React.CSSProperties,
  stockText: {
    fontSize: '14px',
    color: '#888',
  } as React.CSSProperties,
  compactActions: {
    display: 'flex',
    gap: '0.5rem',
    marginLeft: 'auto',
  } as React.CSSProperties,
  detailsBtn: {
    background: '#333',
    border: '1px solid #555',
    borderRadius: '6px',
    padding: '0.75rem 1rem',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    flex: 1,
  } as React.CSSProperties,
  expandedDetails: {
    marginTop: '1rem',
    padding: '1.5rem',
    background: '#0a0a0a',
    border: '2px solid #f59e0b',
    borderRadius: '8px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
  } as React.CSSProperties,
  itemImageContainer: {
    width: '100%',
    height: '150px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
    background: '#0a0a0a',
    borderRadius: '6px',
    overflow: 'hidden',
  } as React.CSSProperties,
  itemImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain' as const,
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
    marginTop: '1rem',
    padding: '0.75rem 2rem',
    background: '#1a1a1a',
    border: '2px solid #f59e0b',
    borderRadius: '8px',
    textAlign: 'center' as const,
    fontSize: '14px',
    fontWeight: 'bold',
    maxWidth: '500px',
    margin: '1rem auto 0',
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
  expandedImageContainer: {
    width: '100%',
    height: '250px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
    background: '#0a0a0a',
    borderRadius: '6px',
    overflow: 'hidden',
  } as React.CSSProperties,
  expandedImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain' as const,
  } as React.CSSProperties,
}

export default Shops
