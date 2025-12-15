// src/pages/Inventory.tsx - Updated to use real inventory
import { useState } from 'react'
import { useItem } from '../hooks/useItem'
import { useModal } from '../hooks/useModal'
import type { InventoryItem, ItemType } from '../types/item.types'
import TravelingBlocker from '../components/TravelingBlocker'

const Inventory = () => {
  const {
    user,
    useItem: consumeItem,
    equipItem,
    unequipItem,
    sellItem,
    getItemDefaults,
  } = useItem()
  const { showModal } = useModal()
  const [selectedCategory, setSelectedCategory] = useState<ItemType | 'all'>(
    'all'
  )
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

  if (!user) return null

  // Safety check for inventory
  if (!user.inventory || !Array.isArray(user.inventory)) {
    return (
      <div>
        <h1
          style={{ fontSize: '32px', marginBottom: '0.5rem', color: '#ff4444' }}
        >
          Inventory
        </h1>
        <p style={{ color: '#888' }}>Loading inventory...</p>
      </div>
    )
  }

  const categories: { id: ItemType | 'all'; label: string; icon: string }[] = [
    { id: 'all', label: 'All Items', icon: '📦' },
    { id: 'weapon', label: 'Weapons', icon: '⚔️' },
    { id: 'armor', label: 'Armor', icon: '🛡️' },
    { id: 'consumable', label: 'Consumables', icon: '💊' },
    { id: 'special', label: 'Special', icon: '⭐' },
    { id: 'material', label: 'Materials', icon: '🔧' },
    { id: 'collectible', label: 'Collectibles', icon: '💎' },
  ]

  const filteredInventory =
    selectedCategory === 'all'
      ? user.inventory
      : user.inventory.filter((item) => item.item.type === selectedCategory)

  const handleUse = (invItem: InventoryItem) => {
    const { isUsable } = getItemDefaults(invItem)

    if (!isUsable) {
      showModal({
        title: 'Cannot Use',
        message: 'This item cannot be used.',
        type: 'warning',
        icon: '❌',
      })
      return
    }

    const success = consumeItem(invItem.item.id)

    if (success) {
      const effects = invItem.item.effects
      let message = `✅ Used ${invItem.item.name}!`

      if (effects?.healthRestore) {
        message += ` +${effects.healthRestore} health.`
      }
      if (effects?.energyRestore) {
        message += ` +${effects.energyRestore} energy.`
      }
      if (effects?.heartRateRestore) {
        message += ` -${effects.heartRateRestore} heart rate.`
      }

      showModal({
        title: 'Item Used',
        message,
        type: 'success',
        icon: '💊',
      })
      setSelectedItem(null)
    } else {
      showModal({
        title: 'Failed',
        message: 'Failed to use item.',
        type: 'error',
        icon: '❌',
      })
    }
  }

  const handleEquip = (invItem: InventoryItem) => {
    const { isEquippable } = getItemDefaults(invItem)

    if (!isEquippable) {
      showModal({
        title: 'Equip Failed',
        message: 'Only weapons and armor can be equipped.',
        type: 'warning',
        icon: '⚠️',
      })
      return
    }

    if (invItem.equipped) {
      if (unequipItem(invItem.item.id)) {
        showModal({
          title: 'Unequipped',
          message: `✅ Unequipped ${invItem.item.name}!`,
          type: 'success',
          icon: '⚔️',
        })
        setSelectedItem(null)
      }
    } else {
      if (equipItem(invItem.item.id)) {
        showModal({
          title: 'Equipped',
          message: `✅ Equipped ${invItem.item.name}!`,
          type: 'success',
          icon: '⚔️',
        })
        setSelectedItem(null)
      }
    }
  }

  const handleSell = (invItem: InventoryItem) => {
    const { isTradeable } = getItemDefaults(invItem)

    if (!isTradeable) {
      showModal({
        title: 'Cannot Sell',
        message: 'This item cannot be sold.',
        type: 'warning',
        icon: '❌',
      })
      return
    }

    if (invItem.equipped) {
      showModal({
        title: 'Cannot Sell',
        message: 'Unequip the item before selling.',
        type: 'warning',
        icon: '❌',
      })
      return
    }

    const result = sellItem(invItem)

    if (result.success && result.amount) {
      showModal({
        title: 'Sold',
        message: `✅ Sold ${
          invItem.item.name
        } for $${result.amount.toLocaleString()}!`,
        type: 'success',
        icon: '💵',
      })
      setSelectedItem(null)
    } else {
      showModal({
        title: 'Failed',
        message: 'Failed to sell item.',
        type: 'error',
        icon: '❌',
      })
    }
  }

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

  return (
    <div>
      <TravelingBlocker />
      <h1
        style={{ fontSize: '32px', marginBottom: '0.5rem', color: '#ff4444' }}
      >
        Inventory
      </h1>
      <p style={{ color: '#888', marginBottom: '2rem' }}>
        Manage your items. Use consumables, equip gear, or sell for cash.
      </p>

      {/* Category Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
        }}
      >
        {categories.map((cat) => {
          const itemCount =
            cat.id === 'all'
              ? user.inventory.length
              : user.inventory.filter((i) => i.item.type === cat.id).length

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor:
                  selectedCategory === cat.id ? '#ff4444' : '#0f0f0f',
                color: '#fff',
                border:
                  selectedCategory === cat.id
                    ? '2px solid #ff4444'
                    : '1px solid #333',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== cat.id) {
                  e.currentTarget.style.backgroundColor = '#1a1a1a'
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== cat.id) {
                  e.currentTarget.style.backgroundColor = '#0f0f0f'
                }
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span
                style={{
                  backgroundColor: '#333',
                  padding: '0.1rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              >
                {itemCount}
              </span>
            </button>
          )
        })}
      </div>

      {/* Inventory Grid */}
      {filteredInventory.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '1rem',
          }}
        >
          {filteredInventory.map((invItem, idx) => (
            <div
              key={`${invItem.item.id}-${idx}`}
              onClick={() => setSelectedItem(invItem)}
              style={{
                backgroundColor: '#0f0f0f',
                padding: '1rem',
                borderRadius: '8px',
                border: `2px solid ${invItem.equipped ? '#4CAF50' : '#333'}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.borderColor = '#4a9eff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = invItem.equipped
                  ? '#4CAF50'
                  : '#333'
              }}
            >
              {/* Quantity Badge */}
              {invItem.quantity > 1 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    backgroundColor: '#ff4444',
                    color: '#fff',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  x{invItem.quantity}
                </div>
              )}

              {/* Equipped Badge */}
              {invItem.equipped && (
                <div
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    left: '0.5rem',
                    backgroundColor: '#4CAF50',
                    color: '#fff',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                  }}
                >
                  EQUIPPED
                </div>
              )}

              {/* Item Image or Icon */}
              <div
                style={{
                  textAlign: 'center',
                  marginBottom: '0.5rem',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {invItem.item.imageUrl ? (
                  <img
                    src={invItem.item.imageUrl}
                    alt={invItem.item.name}
                    style={{
                      maxWidth: '80px',
                      maxHeight: '80px',
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <div style={{ fontSize: '48px' }}>
                    {getItemIcon(invItem.item.type)}
                  </div>
                )}
              </div>

              {/* Item Name */}
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#fff',
                  textAlign: 'center',
                  marginBottom: '0.25rem',
                }}
              >
                {invItem.item.name}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem',
            color: '#666',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '1rem' }}>📦</div>
          <div style={{ fontSize: '18px' }}>No items in this category</div>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onUse={() => handleUse(selectedItem)}
          onEquip={() => handleEquip(selectedItem)}
          onSell={() => handleSell(selectedItem)}
          getRarityColor={getRarityColor}
          getItemDefaults={getItemDefaults}
        />
      )}
    </div>
  )
}

// Item Detail Modal Component
const ItemDetailModal = ({
  item,
  onClose,
  onUse,
  onEquip,
  onSell,
  getRarityColor,
  getItemDefaults,
}: {
  item: InventoryItem
  onClose: () => void
  onUse: () => void
  onEquip: () => void
  onSell: () => void
  getRarityColor: (rarity: string) => string
  getItemDefaults: (invItem: InventoryItem) => {
    marketValue: number
    isUsable: boolean
    isTradeable: boolean
    isEquippable: boolean
    sellPrice: number
  }
}) => {
  const { marketValue, sellPrice, isUsable, isTradeable, isEquippable } =
    getItemDefaults(item)

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '2rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '12px',
          border: '3px solid #333',
          padding: '2rem',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {/* Item Image or Icon */}
          <div
            style={{
              marginBottom: '1rem',
              height: '120px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {item.item.imageUrl ? (
              <img
                src={item.item.imageUrl}
                alt={item.item.name}
                style={{
                  maxWidth: '120px',
                  maxHeight: '120px',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <div style={{ fontSize: '64px' }}>
                {getItemIcon(item.item.type)}
              </div>
            )}
          </div>
          <h2
            style={{
              fontSize: '24px',
              color: '#fff',
              marginBottom: '0.5rem',
            }}
          >
            {item.item.name}
          </h2>
          <div
            style={{
              fontSize: '12px',
              color: '#888',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            {item.item.type}
          </div>
        </div>

        {/* Description */}
        <p
          style={{
            color: '#aaa',
            fontSize: '14px',
            lineHeight: '1.6',
            marginBottom: '2rem',
            textAlign: 'center',
          }}
        >
          {item.item.description}
        </p>

        {/* Stats */}
        {item.item.stats && (
          <div
            style={{
              backgroundColor: '#0f0f0f',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                color: '#888',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
              }}
            >
              Stats
            </div>
            {item.item.stats.damage && (
              <StatRow label="Damage" value={item.item.stats.damage} />
            )}
            {item.item.stats.defense && (
              <StatRow label="Defense" value={item.item.stats.defense} />
            )}
            {item.item.stats.accuracy && (
              <StatRow
                label="Accuracy"
                value={`${item.item.stats.accuracy}%`}
              />
            )}
            {item.item.stats.requiredLevel && (
              <StatRow
                label="Required Level"
                value={item.item.stats.requiredLevel}
              />
            )}
          </div>
        )}

        {/* Effects */}
        {item.item.effects && (
          <div
            style={{
              backgroundColor: '#0f0f0f',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                color: '#888',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
              }}
            >
              Effects
            </div>
            {item.item.effects.healthRestore && (
              <StatRow
                label="Health Restore"
                value={`+${item.item.effects.healthRestore}`}
              />
            )}
            {item.item.effects.energyRestore && (
              <StatRow
                label="Energy Restore"
                value={`+${item.item.effects.energyRestore}`}
              />
            )}
            {item.item.effects.heartRateRestore && (
              <StatRow
                label="Heart Rate Restore"
                value={`+${item.item.effects.heartRateRestore}`}
              />
            )}
            {item.item.effects.strengthBoost && (
              <StatRow
                label="Strength Boost"
                value={`+${item.item.effects.strengthBoost}`}
              />
            )}
            {item.item.effects.duration && (
              <StatRow
                label="Duration"
                value={`${item.item.effects.duration}s`}
              />
            )}
          </div>
        )}

        {/* Info */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <InfoBox
            label="Market Value"
            value={`$${marketValue.toLocaleString()}`}
          />
          <InfoBox
            label="Sell Price"
            value={`$${sellPrice.toLocaleString()}`}
          />
          <InfoBox label="Quantity" value={item.quantity.toString()} />
          <InfoBox label="Tradeable" value={isTradeable ? 'Yes' : 'No'} />
        </div>

        {/* Action Buttons */}
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          {isUsable && (
            <button
              onClick={onUse}
              style={{
                padding: '1rem',
                fontSize: '16px',
                fontWeight: 'bold',
                backgroundColor: '#4CAF50',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = '#66BB6A')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = '#4CAF50')
              }
            >
              Use Item
            </button>
          )}

          {isEquippable && (
            <button
              onClick={onEquip}
              style={{
                padding: '1rem',
                fontSize: '16px',
                fontWeight: 'bold',
                backgroundColor: item.equipped ? '#FF9800' : '#2196F3',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (item.equipped) {
                  e.currentTarget.style.backgroundColor = '#FFB74D'
                } else {
                  e.currentTarget.style.backgroundColor = '#42A5F5'
                }
              }}
              onMouseLeave={(e) => {
                if (item.equipped) {
                  e.currentTarget.style.backgroundColor = '#FF9800'
                } else {
                  e.currentTarget.style.backgroundColor = '#2196F3'
                }
              }}
            >
              {item.equipped ? '📤 Unequip' : '⚔️ Equip'}
            </button>
          )}

          {isTradeable && (
            <button
              onClick={onSell}
              disabled={item.equipped}
              style={{
                padding: '1rem',
                fontSize: '16px',
                fontWeight: 'bold',
                backgroundColor: item.equipped ? '#555' : '#FF9800',
                color: item.equipped ? '#888' : '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: item.equipped ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!item.equipped) {
                  e.currentTarget.style.backgroundColor = '#FFB74D'
                }
              }}
              onMouseLeave={(e) => {
                if (!item.equipped) {
                  e.currentTarget.style.backgroundColor = '#FF9800'
                }
              }}
            >
              {item.equipped
                ? '🔒 Unequip to Sell'
                : `💰 Sell for $${sellPrice.toLocaleString()}`}
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              padding: '0.75rem',
              fontSize: '14px',
              backgroundColor: 'transparent',
              color: '#888',
              border: '1px solid #333',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#666')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#333')}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// Helper Components
const StatRow = ({
  label,
  value,
}: {
  label: string
  value: string | number
}) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '13px',
      marginBottom: '0.5rem',
    }}
  >
    <span style={{ color: '#aaa' }}>{label}</span>
    <span style={{ color: '#fff', fontWeight: 'bold' }}>{value}</span>
  </div>
)

const InfoBox = ({ label, value }: { label: string; value: string }) => (
  <div
    style={{
      backgroundColor: '#0f0f0f',
      padding: '0.75rem',
      borderRadius: '6px',
      textAlign: 'center',
    }}
  >
    <div style={{ fontSize: '11px', color: '#888', marginBottom: '0.25rem' }}>
      {label}
    </div>
    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{value}</div>
  </div>
)

const getItemIcon = (type: ItemType): string => {
  switch (type) {
    case 'weapon':
      return '⚔️'
    case 'armor':
      return '🛡️'
    case 'consumable':
      return '💊'
    case 'special':
      return '⭐'
    case 'material':
      return '🔧'
    case 'collectible':
      return '💎'
    default:
      return '📦'
  }
}

export default Inventory
