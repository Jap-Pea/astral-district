// src/pages/Properties.tsx
import { useState } from 'react'
import { useUser } from '../hooks/useUser'
import { useModal } from '../hooks/useModal'

interface Property {
  id: string
  name: string
  description: string
  price: number
  requiredLevel: number
  storageCapacity: number
  image: string // Emoji for now
  features: string[]
  upgrades?: PropertyUpgrade[]
}

interface PropertyUpgrade {
  id: string
  name: string
  description: string
  price: number
  benefit: string
}

const Properties = () => {
  const { user, spendMoney } = useUser()
  const { showModal } = useModal()
  const [ownedPropertyId, setOwnedPropertyId] = useState<string | null>(null) // TODO: Save to user data

  if (!user) return null

  const properties: Property[] = [
    {
      id: 'cardboard_box',
      name: 'Cardboard Box',
      description: 'A box under a bridge. Better than nothing, right?',
      price: 0,
      requiredLevel: 0,
      storageCapacity: 10,
      image: '📦',
      features: ['Basic shelter', 'Very limited storage'],
    },
    {
      id: 'studio_apartment',
      name: 'Studio Apartment',
      description: 'A small, cramped studio in the bad part of town.',
      price: 50000,
      requiredLevel: 5,
      storageCapacity: 20,
      image: '🏚️',
      features: ['1 room', 'Small storage', 'Unsafe neighborhood'],
    },
    {
      id: 'one_bedroom',
      name: 'One Bedroom Apartment',
      description: 'Decent apartment with a separate bedroom.',
      price: 150000,
      requiredLevel: 10,
      storageCapacity: 35,
      image: '🏢',
      features: ['1 bedroom', 'Moderate storage', 'Average neighborhood'],
    },
    {
      id: 'two_bedroom',
      name: 'Two Bedroom Apartment',
      description: 'Spacious apartment in a good area.',
      price: 400000,
      requiredLevel: 15,
      storageCapacity: 50,
      image: '🏙️',
      features: ['2 bedrooms', 'Good storage', 'Safe neighborhood'],
      upgrades: [
        {
          id: 'safe',
          name: 'Wall Safe',
          description: 'Extra secure storage',
          price: 50000,
          benefit: '+10 storage slots',
        },
      ],
    },
    {
      id: 'townhouse',
      name: 'Townhouse',
      description: 'Multi-level townhouse with yard.',
      price: 1000000,
      requiredLevel: 20,
      storageCapacity: 75,
      image: '🏘️',
      features: ['3 bedrooms', 'Large storage', 'Private yard', 'Garage'],
      upgrades: [
        {
          id: 'safe',
          name: 'Wall Safe',
          description: 'Extra secure storage',
          price: 50000,
          benefit: '+10 storage slots',
        },
        {
          id: 'security',
          name: 'Security System',
          description: 'Harder to raid',
          price: 100000,
          benefit: '+20% raid defense',
        },
      ],
    },
    {
      id: 'suburban_house',
      name: 'Suburban House',
      description: 'Nice house in the suburbs with a garage.',
      price: 2500000,
      requiredLevel: 25,
      storageCapacity: 100,
      image: '🏡',
      features: [
        '4 bedrooms',
        'Very large storage',
        'Double garage',
        'Big yard',
      ],
      upgrades: [
        {
          id: 'vault',
          name: 'Underground Vault',
          description: 'Maximum security storage',
          price: 200000,
          benefit: '+25 storage slots',
        },
        {
          id: 'security',
          name: 'Advanced Security',
          description: 'Top-tier raid protection',
          price: 150000,
          benefit: '+35% raid defense',
        },
      ],
    },
    {
      id: 'luxury_condo',
      name: 'Luxury Penthouse',
      description: 'High-rise penthouse with stunning views.',
      price: 6000000,
      requiredLevel: 30,
      storageCapacity: 150,
      image: '🏢',
      features: [
        'Penthouse suite',
        'Massive storage',
        'Rooftop access',
        'Concierge',
      ],
      upgrades: [
        {
          id: 'vault',
          name: 'Bank-Level Vault',
          description: 'Near-impenetrable storage',
          price: 300000,
          benefit: '+40 storage slots',
        },
        {
          id: 'security',
          name: 'Military-Grade Security',
          description: 'Elite raid protection',
          price: 250000,
          benefit: '+50% raid defense',
        },
      ],
    },
    {
      id: 'mansion',
      name: 'Mansion',
      description: 'Sprawling mansion on private estate.',
      price: 15000000,
      requiredLevel: 35,
      storageCapacity: 200,
      image: '🏰',
      features: [
        '10+ rooms',
        'Enormous storage',
        'Private estate',
        'Security staff',
      ],
      upgrades: [
        {
          id: 'bunker',
          name: 'Underground Bunker',
          description: 'Secret storage facility',
          price: 500000,
          benefit: '+50 storage slots',
        },
        {
          id: 'security',
          name: 'Armed Security Team',
          description: 'Maximum raid protection',
          price: 400000,
          benefit: '+70% raid defense',
        },
      ],
    },
    {
      id: 'compound',
      name: 'Fortified Compound',
      description: 'Military-grade compound with maximum security.',
      price: 50000000,
      requiredLevel: 40,
      storageCapacity: 300,
      image: '🏛️',
      features: [
        'Fortress-level security',
        'Unlimited storage space',
        'Private army',
        'Helipad',
      ],
      upgrades: [
        {
          id: 'armory',
          name: 'Private Armory',
          description: 'Store unlimited weapons',
          price: 1000000,
          benefit: 'Weapon storage bonus',
        },
      ],
    },
  ]

  const handlePurchase = (property: Property) => {
    if (user.level < property.requiredLevel) {
      showModal({
        title: 'Level Too Low',
        message: `You need to be level ${property.requiredLevel} to purchase this property.`,
        type: 'warning',
        icon: '⚠️',
      })
      return
    }

    if (user.money < property.price) {
      showModal({
        title: 'Insufficient Funds',
        message: `You don't have enough money! This property costs $${property.price.toLocaleString()}`,
        type: 'error',
        icon: '💰',
      })
      return
    }

    showModal({
      title: `Purchasing ${property.name}`,
      message: `Cost: $${property.price.toLocaleString()}\n\nProceeding with purchase...`,
      type: 'info',
      icon: '🏠',
    })
    if (spendMoney(property.price)) {
      setOwnedPropertyId(property.id)
      showModal({
        title: 'Purchase Complete',
        message: `✅ Congratulations! You now own: ${property.name}`,
        type: 'success',
        icon: '🏠',
      })
      // TODO: Save to user data
    }
  }

  const ownedProperty = ownedPropertyId
    ? properties.find((p) => p.id === ownedPropertyId)
    : null

  return (
    <div>
      <h1
        style={{ fontSize: '32px', marginBottom: '0.5rem', color: '#ff4444' }}
      >
        Real Estate
      </h1>
      <p style={{ color: '#888', marginBottom: '2rem' }}>
        Purchase properties to store items safely. Higher-tier properties have
        more storage and better protection against raids.
      </p>

      {/* Current Property */}
      {ownedProperty && (
        <div
          style={{
            backgroundColor: '#0f0f0f',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            border: '2px solid #4CAF50',
          }}
        >
          <h2
            style={{ fontSize: '20px', marginBottom: '1rem', color: '#4CAF50' }}
          >
            Your Current Property
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '48px' }}>{ownedProperty.image}</div>
            <div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '0.25rem',
                }}
              >
                {ownedProperty.name}
              </div>
              <div style={{ fontSize: '14px', color: '#888' }}>
                Storage: {ownedProperty.storageCapacity} items
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Properties Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {properties.map((property) => {
          const isOwned = ownedProperty?.id === property.id
          const isLocked = user.level < property.requiredLevel
          const canAfford = user.money >= property.price

          return (
            <PropertyCard
              key={property.id}
              property={property}
              isOwned={isOwned}
              isLocked={isLocked}
              canAfford={canAfford}
              onPurchase={() => handlePurchase(property)}
            />
          )
        })}
      </div>
    </div>
  )
}

const PropertyCard = ({
  property,
  isOwned,
  isLocked,
  canAfford,
  onPurchase,
}: {
  property: Property
  isOwned: boolean
  isLocked: boolean
  canAfford: boolean
  onPurchase: () => void
}) => {
  return (
    <div
      style={{
        backgroundColor: '#0f0f0f',
        padding: '1.5rem',
        borderRadius: '8px',
        border: isOwned
          ? '2px solid #4CAF50'
          : isLocked
          ? '1px solid #555'
          : '1px solid #333',
        opacity: isLocked ? 0.6 : 1,
        position: 'relative',
      }}
    >
      {/* Level Badge */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          backgroundColor: isLocked ? '#555' : '#2196F3',
          color: '#fff',
          padding: '0.25rem 0.75rem',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold',
        }}
      >
        LVL {property.requiredLevel}
      </div>

      {isOwned && (
        <div
          style={{
            position: 'absolute',
            top: '3rem',
            right: '1rem',
            backgroundColor: '#4CAF50',
            color: '#fff',
            padding: '0.25rem 0.75rem',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 'bold',
          }}
        >
          OWNED
        </div>
      )}

      {/* Property Image */}
      <div
        style={{
          fontSize: '64px',
          textAlign: 'center',
          marginBottom: '1rem',
          filter: isLocked ? 'grayscale(100%)' : 'none',
        }}
      >
        {property.image}
      </div>

      {/* Property Info */}
      <h3
        style={{
          fontSize: '20px',
          marginBottom: '0.5rem',
          color: isOwned ? '#4CAF50' : '#fff',
        }}
      >
        {property.name}
      </h3>

      <p
        style={{
          fontSize: '14px',
          color: '#aaa',
          marginBottom: '1rem',
          minHeight: '40px',
        }}
      >
        {property.description}
      </p>

      {/* Storage Info */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          padding: '0.75rem',
          backgroundColor: '#1a1a1a',
          borderRadius: '4px',
        }}
      >
        <div>
          <div style={{ fontSize: '12px', color: '#888' }}>
            Storage Capacity
          </div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
            {property.storageCapacity} items
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: '#888' }}>Price</div>
          <div
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: canAfford ? '#4CAF50' : '#f44336',
            }}
          >
            ${property.price.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ marginBottom: '1rem' }}>
        <div
          style={{
            fontSize: '12px',
            color: '#888',
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
          }}
        >
          Features
        </div>
        <ul
          style={{
            margin: 0,
            padding: '0 0 0 1.5rem',
            fontSize: '13px',
            color: '#aaa',
            lineHeight: '1.6',
          }}
        >
          {property.features.map((feature, idx) => (
            <li key={idx}>{feature}</li>
          ))}
        </ul>
      </div>

      {/* Upgrades Available */}
      {property.upgrades && property.upgrades.length > 0 && (
        <div
          style={{
            fontSize: '11px',
            color: '#FFC107',
            marginBottom: '1rem',
            padding: '0.5rem',
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            borderRadius: '4px',
            border: '1px solid #FFC107',
          }}
        >
          ⭐ {property.upgrades.length} upgrade
          {property.upgrades.length > 1 ? 's' : ''} available
        </div>
      )}

      {/* Purchase Button */}
      <button
        onClick={onPurchase}
        disabled={isOwned || isLocked || !canAfford}
        style={{
          width: '100%',
          padding: '0.75rem',
          fontSize: '16px',
          fontWeight: 'bold',
          backgroundColor: isOwned
            ? '#4CAF50'
            : isLocked || !canAfford
            ? '#555'
            : '#ff4444',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: isOwned || isLocked || !canAfford ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          if (!isOwned && !isLocked && canAfford) {
            e.currentTarget.style.backgroundColor = '#ff6666'
          }
        }}
        onMouseLeave={(e) => {
          if (!isOwned && !isLocked && canAfford) {
            e.currentTarget.style.backgroundColor = '#ff4444'
          }
        }}
      >
        {isOwned
          ? '✓ Owned'
          : isLocked
          ? `🔒 Requires Level ${property.requiredLevel}`
          : !canAfford
          ? `💰 Can't Afford`
          : 'Purchase'}
      </button>
    </div>
  )
}

export default Properties
