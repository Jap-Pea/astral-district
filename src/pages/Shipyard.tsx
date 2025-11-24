// src/pages/Shipyard.tsx
import { useState, useEffect } from 'react'
import { useUser } from '../hooks/useUser'
import { PageContainer } from '../components/ui/PageContainer'
import { GlassCard } from '../components/ui/GlassCard'
import { GradientButton } from '../components/ui/GradientButton'
import { theme } from '../styles/theme'
import TravelingBlocker from '../components/TravelingBlocker'

type ShipTier = 'basic' | 'advanced' | 'elite' | 'legendary'
type FuelType = 'ion' | 'fusion' | 'quantum'

export interface Ship {
  id: string
  name: string
  tier: ShipTier
  modelPath: string
  price: number
  hull: number
  maxHull: number
  shields: number
  maxShields: number
  cargoCapacity: number
  fuelTypes: FuelType[]
  travelTimeReduction: number // percentage
  statModifiers?: {
    strength?: number
    defense?: number
    speed?: number
    dexterity?: number
  }
  description: string
}

type RepairSpeed = 'standard' | 'fast' | 'express' | 'instant'

interface RepairOption {
  speed: RepairSpeed
  label: string
  timeMinutes: number
  costMultiplier: number
  requiresQuantumModule: boolean
  icon: string
}

const REPAIR_OPTIONS: RepairOption[] = [
  {
    speed: 'standard',
    label: 'Standard Repair',
    timeMinutes: 120,
    costMultiplier: 1,
    requiresQuantumModule: false,
    icon: '🔧',
  },
  {
    speed: 'fast',
    label: 'Fast Repair',
    timeMinutes: 30,
    costMultiplier: 2,
    requiresQuantumModule: false,
    icon: '⚡',
  },
  {
    speed: 'express',
    label: 'Express Repair',
    timeMinutes: 5,
    costMultiplier: 5,
    requiresQuantumModule: false,
    icon: '🚀',
  },
  {
    speed: 'instant',
    label: 'Instant Repair',
    timeMinutes: 0,
    costMultiplier: 0,
    requiresQuantumModule: true,
    icon: '⚛️',
  },
]

const SHIPS: Ship[] = [
  // BASIC TIER
  {
    id: 'ship_basic_starter',
    name: 'Nebula Scout',
    tier: 'basic',
    modelPath: '/models/spaceship(2).glb',
    price: 0, // Free starter ship
    hull: 100,
    maxHull: 100,
    shields: 50,
    maxShields: 50,
    cargoCapacity: 12,
    fuelTypes: ['ion'],
    travelTimeReduction: 0,
    description: 'A reliable starter vessel. Gets the job done.',
  },
  {
    id: 'ship_basic_hauler',
    name: 'Cargo Mule',
    tier: 'basic',
    modelPath: '/models/spaceship(2).glb',
    price: 25000,
    hull: 120,
    maxHull: 120,
    shields: 40,
    maxShields: 40,
    cargoCapacity: 20,
    fuelTypes: ['ion'],
    travelTimeReduction: 0,
    statModifiers: { defense: 2, speed: -1 },
    description: 'Extra cargo space for the ambitious smuggler.',
  },
  {
    id: 'ship_basic_interceptor',
    name: 'Stingray',
    tier: 'basic',
    modelPath: '/models/spaceship(2).glb',
    price: 30000,
    hull: 90,
    maxHull: 90,
    shields: 60,
    maxShields: 60,
    cargoCapacity: 10,
    fuelTypes: ['ion'],
    travelTimeReduction: 0,
    statModifiers: { speed: 3, defense: -1 },
    description: 'Fast and nimble. Perfect for quick getaways.',
  },

  // ADVANCED TIER
  {
    id: 'ship_advanced_corsair',
    name: 'Corsair MK-II',
    tier: 'advanced',
    modelPath: '/models/spaceship(2).glb',
    price: 150000,
    hull: 250,
    maxHull: 250,
    shields: 150,
    maxShields: 150,
    cargoCapacity: 18,
    fuelTypes: ['ion', 'fusion'],
    travelTimeReduction: 2,
    statModifiers: { strength: 3, defense: 2 },
    description: 'A combat-ready vessel for serious criminals.',
  },
  {
    id: 'ship_advanced_phantom',
    name: 'Shadow Phantom',
    tier: 'advanced',
    modelPath: '/models/spaceship(2).glb',
    price: 175000,
    hull: 200,
    maxHull: 200,
    shields: 180,
    maxShields: 180,
    cargoCapacity: 15,
    fuelTypes: ['ion', 'fusion'],
    travelTimeReduction: 2,
    statModifiers: { speed: 4, dexterity: 2, defense: -1 },
    description: 'Stealth capabilities and speed. Evade authorities with ease.',
  },
  {
    id: 'ship_advanced_bulwark',
    name: 'Iron Bulwark',
    tier: 'advanced',
    modelPath: '/models/spaceship(2).glb',
    price: 160000,
    hull: 300,
    maxHull: 300,
    shields: 120,
    maxShields: 120,
    cargoCapacity: 25,
    fuelTypes: ['ion', 'fusion'],
    travelTimeReduction: 2,
    statModifiers: { defense: 5, speed: -2 },
    description: 'Heavy armor. Built to take a beating.',
  },

  // ELITE TIER
  {
    id: 'ship_elite_predator',
    name: 'Apex Predator',
    tier: 'elite',
    modelPath: '/models/spaceship(2).glb',
    price: 500000,
    hull: 450,
    maxHull: 450,
    shields: 300,
    maxShields: 300,
    cargoCapacity: 22,
    fuelTypes: ['fusion', 'quantum'],
    travelTimeReduction: 3,
    statModifiers: { strength: 5, speed: 3, dexterity: 2 },
    description: 'Dominate the galaxy with this powerhouse.',
  },
  {
    id: 'ship_elite_wraith',
    name: 'Void Wraith',
    tier: 'elite',
    modelPath: '/models/spaceship(2).glb',
    price: 550000,
    hull: 380,
    maxHull: 380,
    shields: 350,
    maxShields: 350,
    cargoCapacity: 20,
    fuelTypes: ['fusion', 'quantum'],
    travelTimeReduction: 3,
    statModifiers: { speed: 6, dexterity: 4, strength: -1 },
    description: 'Disappear into the void. Maximum evasion.',
  },

  // LEGENDARY TIER
  {
    id: 'ship_legendary_titan',
    name: 'Galactic Titan',
    tier: 'legendary',
    modelPath: '/models/spaceship(2).glb',
    price: 2000000,
    hull: 800,
    maxHull: 800,
    shields: 600,
    maxShields: 600,
    cargoCapacity: 35,
    fuelTypes: ['quantum'],
    travelTimeReduction: 5,
    statModifiers: { strength: 8, defense: 6, speed: 2 },
    description: 'The ultimate criminal vessel. Legends are made in this ship.',
  },
  {
    id: 'ship_legendary_phoenix',
    name: 'Eternal Phoenix',
    tier: 'legendary',
    modelPath: '/models/spaceship(2).glb',
    price: 2500000,
    hull: 700,
    maxHull: 700,
    shields: 700,
    maxShields: 700,
    cargoCapacity: 30,
    fuelTypes: ['quantum'],
    travelTimeReduction: 5,
    statModifiers: { speed: 7, dexterity: 6, strength: 4 },
    description: 'Rise from the ashes. Unstoppable and untouchable.',
  },
]

const Shipyard = () => {
  const { user, updateUser, spendMoney } = useUser()
  const [selectedShip, setSelectedShip] = useState<Ship | null>(null)
  const [viewMode, setViewMode] = useState<'browse' | 'repair'>('browse')
  const [repairInProgress, setRepairInProgress] = useState(false)
  const [repairTimeRemaining, setRepairTimeRemaining] = useState(0)
  const [message, setMessage] = useState<string | null>(null)

  // Get user's current ship (stored in user object)
  const userShip = user?.ship || SHIPS[0] // Default to starter if no ship

  // Repair timer countdown
  useEffect(() => {
    if (!repairInProgress || repairTimeRemaining <= 0) return

    const interval = setInterval(() => {
      setRepairTimeRemaining((prev) => {
        const newTime = prev - 1
        if (newTime <= 0) {
          completeRepair()
          return 0
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [repairInProgress, repairTimeRemaining])

  const completeRepair = () => {
    setRepairInProgress(false)
    if (user?.ship) {
      updateUser({
        ship: {
          ...user.ship,
          hull: user.ship.maxHull,
          shields: user.ship.maxShields,
        },
      })
    }
    setMessage('✅ Repair complete! Your ship is fully restored.')
  }

  const calculateRepairCost = (ship: Ship, option: RepairOption): number => {
    const hullDamage = ship.maxHull - ship.hull
    const shieldDamage = ship.maxShields - ship.shields
    const totalDamage = hullDamage + shieldDamage

    if (totalDamage === 0) return 0

    // Base cost depends on ship tier
    const tierMultipliers = {
      basic: 1,
      advanced: 2.5,
      elite: 5,
      legendary: 10,
    }

    const baseCost = totalDamage * 10 * tierMultipliers[ship.tier]
    return Math.floor(baseCost * option.costMultiplier)
  }

  const hasQuantumModule = (): boolean => {
    return (
      user?.inventory.some((inv) => inv.item.id === 'quantum_repair_module') ||
      false
    )
  }

  const handlePurchaseShip = (ship: Ship) => {
    if (!user) return

    if (user.money < ship.price) {
      setMessage(
        `❌ Not enough chips! Need ${ship.price.toLocaleString()} chips.`
      )
      return
    }

    if (ship.price === 0) {
      // Free starter ship
      updateUser({ ship: { ...ship } })
      setMessage(`🚀 Welcome aboard the ${ship.name}!`)
      setSelectedShip(null)
      return
    }

    const confirmed = window.confirm(
      `Purchase ${ship.name} for ${ship.price.toLocaleString()} chips?\n\n` +
        `Your current ship will be traded in.`
    )

    if (!confirmed) return

    if (spendMoney(ship.price)) {
      updateUser({ ship: { ...ship } })
      setMessage(`🚀 Purchased ${ship.name}! Enjoy your new ship.`)
      setSelectedShip(null)
    }
  }

  const handleRepair = (option: RepairOption) => {
    if (!user?.ship) return

    const cost = calculateRepairCost(user.ship, option)

    if (
      user.ship.hull === user.ship.maxHull &&
      user.ship.shields === user.ship.maxShields
    ) {
      setMessage('✅ Your ship is already at full health!')
      return
    }

    if (option.requiresQuantumModule) {
      if (!hasQuantumModule()) {
        setMessage('❌ You need a Quantum Repair Module for instant repair!')
        return
      }

      const confirmed = window.confirm(
        `Use Quantum Repair Module for instant repair?\n\n` +
          `This will consume 1 Quantum Repair Module.`
      )

      if (!confirmed) return

      // Remove quantum module from inventory
      const updatedInventory = user.inventory
        .map((inv) => {
          if (inv.item.id === 'quantum_repair_module') {
            return { ...inv, quantity: inv.quantity - 1 }
          }
          return inv
        })
        .filter((inv) => inv.quantity > 0)

      updateUser({
        inventory: updatedInventory,
        ship: {
          ...user.ship,
          hull: user.ship.maxHull,
          shields: user.ship.maxShields,
        },
      })

      setMessage('⚛️ Instant repair complete!')
      return
    }

    if (cost > 0 && user.money < cost) {
      setMessage(
        `❌ Not enough chips! Repair costs ${cost.toLocaleString()} chips.`
      )
      return
    }

    const confirmed = window.confirm(
      `Start ${option.label}?\n\n` +
        `Cost: ${cost.toLocaleString()} chips\n` +
        `Time: ${
          option.timeMinutes > 0 ? `${option.timeMinutes} minutes` : 'Instant'
        }\n\n` +
        `Hull: ${user.ship.hull}/${user.ship.maxHull}\n` +
        `Shields: ${user.ship.shields}/${user.ship.maxShields}`
    )

    if (!confirmed) return

    if (cost > 0 && !spendMoney(cost)) {
      setMessage('❌ Failed to start repair')
      return
    }

    setRepairInProgress(true)
    setRepairTimeRemaining(option.timeMinutes * 60)
    setMessage(null)
  }

  const getTierColor = (tier: ShipTier): string => {
    switch (tier) {
      case 'basic':
        return '#888'
      case 'advanced':
        return '#3b82f6'
      case 'elite':
        return '#a855f7'
      case 'legendary':
        return '#f59e0b'
      default:
        return '#888'
    }
  }

  const getTierLabel = (tier: ShipTier): string => {
    return tier.toUpperCase()
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!user) return null

  // Repair in progress screen
  if (repairInProgress) {
    return (
      <PageContainer>
        <div style={styles.repairScreen}>
          <div style={{ fontSize: '64px', marginBottom: '2rem' }}>🔧</div>
          <h1 style={styles.repairTitle}>REPAIR IN PROGRESS</h1>
          <p style={styles.repairSubtitle}>Repairing {userShip.name}</p>

          <div style={styles.repairTimer}>
            <div
              style={{ fontSize: '14px', color: '#888', marginBottom: '1rem' }}
            >
              TIME REMAINING
            </div>
            <div
              style={{
                fontSize: '72px',
                fontWeight: 'bold',
                fontFamily: 'monospace',
                color: '#00d9ff',
              }}
            >
              {formatTime(repairTimeRemaining)}
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '1rem' }}>
              ({Math.ceil(repairTimeRemaining / 60)} minutes)
            </div>
          </div>

          <div style={styles.repairInfo}>
            <div style={{ fontSize: '16px', color: '#aaa', lineHeight: '1.8' }}>
              🔧 Repair bay is working on your ship.
              <br />
              ⏰ You can continue other activities while repairs are in
              progress.
              <br />
              🛠️ Your ship will be fully restored when complete.
            </div>
          </div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <TravelingBlocker />
      <div style={styles.header}>
        <h1 style={styles.title}>🚀 SHIPYARD</h1>
        <p style={styles.subtitle}>
          Upgrade your vessel. Repair your ship. Dominate the galaxy.
        </p>

        <div style={styles.modeToggle}>
          <button
            style={{
              ...styles.modeButton,
              ...(viewMode === 'browse' ? styles.modeButtonActive : {}),
            }}
            onClick={() => setViewMode('browse')}
          >
            🛒 Browse Ships
          </button>
          <button
            style={{
              ...styles.modeButton,
              ...(viewMode === 'repair' ? styles.modeButtonActive : {}),
            }}
            onClick={() => setViewMode('repair')}
          >
            🔧 Repair Bay
          </button>
        </div>

        <div style={styles.statsBar}>
          <div style={styles.statItem}>
            <span style={{ color: '#888' }}>CHIPS:</span>
            <span
              style={{
                color: '#22c55e',
                fontWeight: 'bold',
                marginLeft: '0.5rem',
              }}
            >
              {user.money.toLocaleString()}
            </span>
          </div>
          <div style={styles.statItem}>
            <span style={{ color: '#888' }}>CURRENT SHIP:</span>
            <span style={{ fontWeight: 'bold', marginLeft: '0.5rem' }}>
              {userShip.name}
            </span>
          </div>
        </div>
      </div>

      {viewMode === 'browse' && (
        <div>
          {/* Current Ship Display */}
          <GlassCard style={{ marginBottom: '2rem' }}>
            <div style={styles.currentShipSection}>
              <h2 style={styles.sectionTitle}>Your Current Ship</h2>
              <div style={styles.currentShipDisplay}>
                <div style={styles.shipStats}>
                  <div style={styles.shipHeader}>
                    <h3 style={styles.shipName}>{userShip.name}</h3>
                    <span
                      style={{
                        ...styles.tierBadge,
                        background: getTierColor(userShip.tier),
                      }}
                    >
                      {getTierLabel(userShip.tier)}
                    </span>
                  </div>

                  <div style={styles.healthBars}>
                    <div>
                      <div style={styles.healthLabel}>
                        <span>🛡️ Hull</span>
                        <span>
                          {userShip.hull}/{userShip.maxHull}
                        </span>
                      </div>
                      <div style={styles.healthBar}>
                        <div
                          style={{
                            ...styles.healthFill,
                            width: `${
                              (userShip.hull / userShip.maxHull) * 100
                            }%`,
                            background:
                              userShip.hull < userShip.maxHull * 0.3
                                ? '#ef4444'
                                : '#22c55e',
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div style={styles.healthLabel}>
                        <span>⚡ Shields</span>
                        <span>
                          {userShip.shields}/{userShip.maxShields}
                        </span>
                      </div>
                      <div style={styles.healthBar}>
                        <div
                          style={{
                            ...styles.healthFill,
                            width: `${
                              (userShip.shields / userShip.maxShields) * 100
                            }%`,
                            background:
                              userShip.shields < userShip.maxShields * 0.3
                                ? '#ef4444'
                                : '#00d9ff',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={styles.shipInfoGrid}>
                    <div style={styles.shipInfoItem}>
                      <span style={{ color: '#888' }}>Cargo:</span>
                      <span>{userShip.cargoCapacity} items</span>
                    </div>
                    <div style={styles.shipInfoItem}>
                      <span style={{ color: '#888' }}>Fuel Types:</span>
                      <span>
                        {userShip.fuelTypes
                          .map((f) => f.toUpperCase())
                          .join(', ')}
                      </span>
                    </div>
                    {userShip.travelTimeReduction > 0 && (
                      <div style={styles.shipInfoItem}>
                        <span style={{ color: '#888' }}>Travel Bonus:</span>
                        <span style={{ color: '#22c55e' }}>
                          -{userShip.travelTimeReduction}% time
                        </span>
                      </div>
                    )}
                  </div>

                  {userShip.statModifiers &&
                    Object.keys(userShip.statModifiers).length > 0 && (
                      <div style={styles.modifiers}>
                        <div
                          style={{
                            fontSize: '14px',
                            fontWeight: 'bold',
                            marginBottom: '0.5rem',
                          }}
                        >
                          Stat Modifiers:
                        </div>
                        <div style={styles.modifiersList}>
                          {Object.entries(userShip.statModifiers).map(
                            ([stat, value]) => (
                              <span
                                key={stat}
                                style={{
                                  ...styles.modifierTag,
                                  color: value > 0 ? '#22c55e' : '#ef4444',
                                }}
                              >
                                {stat}: {value > 0 ? '+' : ''}
                                {value}%
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {(userShip.hull < userShip.maxHull ||
                userShip.shields < userShip.maxShields) && (
                <div style={styles.damageWarning}>
                  <span style={{ fontSize: '20px' }}>⚠️</span>
                  <span>
                    Your ship has sustained damage. Repair recommended before
                    your next mission.
                  </span>
                </div>
              )}

              {userShip.hull === 0 && (
                <div style={styles.criticalWarning}>
                  <span style={{ fontSize: '20px' }}>🚨</span>
                  <span>
                    CRITICAL: Hull integrity at 0%. Risk of losing all cargo!
                  </span>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Ships for Sale */}
          <h2 style={styles.sectionTitle}>Ships for Sale</h2>

          {(['basic', 'advanced', 'elite', 'legendary'] as ShipTier[]).map(
            (tier) => (
              <div key={tier} style={{ marginBottom: '3rem' }}>
                <h3
                  style={{
                    ...styles.tierHeader,
                    color: getTierColor(tier),
                  }}
                >
                  {getTierLabel(tier)} CLASS
                </h3>
                <div style={styles.shipsGrid}>
                  {SHIPS.filter(
                    (ship) => ship.tier === tier && ship.id !== userShip.id
                  ).map((ship) => (
                    <GlassCard key={ship.id} hover>
                      <div style={styles.shipCard}>
                        <div style={styles.shipCardHeader}>
                          <h4 style={styles.shipCardName}>{ship.name}</h4>
                          <span
                            style={{
                              ...styles.tierBadge,
                              background: getTierColor(ship.tier),
                            }}
                          >
                            {getTierLabel(ship.tier)}
                          </span>
                        </div>

                        <p style={styles.shipDescription}>{ship.description}</p>

                        <div style={styles.shipCardStats}>
                          <div style={styles.statRow}>
                            <span>🛡️ Hull:</span>
                            <span>{ship.maxHull}</span>
                          </div>
                          <div style={styles.statRow}>
                            <span>⚡ Shields:</span>
                            <span>{ship.maxShields}</span>
                          </div>
                          <div style={styles.statRow}>
                            <span>📦 Cargo:</span>
                            <span>{ship.cargoCapacity}</span>
                          </div>
                          <div style={styles.statRow}>
                            <span>⛽ Fuel:</span>
                            <span>
                              {ship.fuelTypes
                                .map((f) => f.toUpperCase())
                                .join(', ')}
                            </span>
                          </div>
                          {ship.travelTimeReduction > 0 && (
                            <div style={styles.statRow}>
                              <span>🚀 Speed:</span>
                              <span style={{ color: '#22c55e' }}>
                                -{ship.travelTimeReduction}%
                              </span>
                            </div>
                          )}
                        </div>

                        {ship.statModifiers &&
                          Object.keys(ship.statModifiers).length > 0 && (
                            <div style={styles.modifiers}>
                              <div
                                style={{
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  marginBottom: '0.25rem',
                                }}
                              >
                                Bonuses:
                              </div>
                              <div style={styles.modifiersList}>
                                {Object.entries(ship.statModifiers).map(
                                  ([stat, value]) => (
                                    <span
                                      key={stat}
                                      style={{
                                        ...styles.modifierTag,
                                        fontSize: '11px',
                                        color:
                                          value > 0 ? '#22c55e' : '#ef4444',
                                      }}
                                    >
                                      {stat}: {value > 0 ? '+' : ''}
                                      {value}%
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        <div style={styles.priceSection}>
                          <div style={styles.price}>
                            {ship.price === 0
                              ? 'FREE'
                              : `${ship.price.toLocaleString()} chips`}
                          </div>
                          <GradientButton
                            gradient="purple"
                            onClick={() => handlePurchaseShip(ship)}
                            disabled={user.money < ship.price && ship.price > 0}
                          >
                            {ship.price === 0 ? 'Claim' : 'Purchase'}
                          </GradientButton>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}

      {viewMode === 'repair' && (
        <div>
          <GlassCard>
            <div style={styles.repairBaySection}>
              <h2 style={styles.sectionTitle}>Repair Bay</h2>

              <div style={styles.repairShipInfo}>
                <h3 style={styles.shipName}>{userShip.name}</h3>

                <div style={styles.healthBars}>
                  <div>
                    <div style={styles.healthLabel}>
                      <span>🛡️ Hull</span>
                      <span>
                        {userShip.hull}/{userShip.maxHull}
                      </span>
                    </div>
                    <div style={styles.healthBar}>
                      <div
                        style={{
                          ...styles.healthFill,
                          width: `${(userShip.hull / userShip.maxHull) * 100}%`,
                          background:
                            userShip.hull < userShip.maxHull * 0.3
                              ? '#ef4444'
                              : '#22c55e',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div style={styles.healthLabel}>
                      <span>⚡ Shields</span>
                      <span>
                        {userShip.shields}/{userShip.maxShields}
                      </span>
                    </div>
                    <div style={styles.healthBar}>
                      <div
                        style={{
                          ...styles.healthFill,
                          width: `${
                            (userShip.shields / userShip.maxShields) * 100
                          }%`,
                          background:
                            userShip.shields < userShip.maxShields * 0.3
                              ? '#ef4444'
                              : '#00d9ff',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.repairOptions}>
                <h3 style={styles.repairOptionsTitle}>Repair Options</h3>
                <div style={styles.repairGrid}>
                  {REPAIR_OPTIONS.map((option) => {
                    const cost = calculateRepairCost(userShip, option)
                    const hasModule = hasQuantumModule()
                    const canAfford = user.money >= cost
                    const canRepair = option.requiresQuantumModule
                      ? hasModule
                      : canAfford

                    return (
                      <button
                        key={option.speed}
                        onClick={() => handleRepair(option)}
                        disabled={!canRepair}
                        style={{
                          ...styles.repairOptionCard,
                          opacity: canRepair ? 1 : 0.5,
                          cursor: canRepair ? 'pointer' : 'not-allowed',
                        }}
                      >
                        <div style={styles.repairOptionIcon}>{option.icon}</div>
                        <div style={styles.repairOptionLabel}>
                          {option.label}
                        </div>
                        <div style={styles.repairOptionTime}>
                          {option.timeMinutes > 0
                            ? `${option.timeMinutes} min`
                            : 'Instant'}
                        </div>
                        <div style={styles.repairOptionCost}>
                          {option.requiresQuantumModule ? (
                            <>
                              <div>1x Quantum Module</div>
                              {!hasModule && (
                                <div
                                  style={{ fontSize: '11px', color: '#ef4444' }}
                                >
                                  Not in inventory
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <div>{cost.toLocaleString()} chips</div>
                              {!canAfford && cost > 0 && (
                                <div
                                  style={{ fontSize: '11px', color: '#ef4444' }}
                                >
                                  Insufficient funds
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {(userShip.hull < userShip.maxHull ||
                userShip.shields < userShip.maxShields) && (
                <div style={styles.damageWarning}>
                  <span style={{ fontSize: '20px' }}>⚠️</span>
                  <span>
                    Your ship has sustained damage. Repair recommended before
                    your next mission.
                  </span>
                </div>
              )}

              {userShip.hull === 0 && (
                <div style={styles.criticalWarning}>
                  <span style={{ fontSize: '20px' }}>🚨</span>
                  <span>
                    CRITICAL: Hull integrity at 0%. Risk of losing all cargo!
                  </span>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      )}

      {message && <div style={styles.message}>{message}</div>}
    </PageContainer>
  )
}

const styles = {
  header: {
    textAlign: 'center' as const,
    marginBottom: '3rem',
    paddingBottom: '2rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  } as React.CSSProperties,

  title: {
    fontSize: '48px',
    fontWeight: 'bold',
    margin: '0 0 0.5rem 0',
    textTransform: 'uppercase' as const,
    letterSpacing: '4px',
    background: theme.colors.gradients.purple,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  } as React.CSSProperties,

  subtitle: {
    fontSize: '16px',
    color: theme.colors.text.secondary,
    margin: '0 0 2rem 0',
  } as React.CSSProperties,

  modeToggle: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginBottom: '2rem',
  } as React.CSSProperties,

  modeButton: {
    padding: '0.75rem 2rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.lg,
    color: theme.colors.text.primary,
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
  } as React.CSSProperties,

  modeButtonActive: {
    background: theme.colors.gradients.purple,
    borderColor: 'transparent',
  } as React.CSSProperties,

  statsBar: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '2rem',
    fontSize: '16px',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,

  statItem: {
    display: 'flex',
    alignItems: 'center',
  } as React.CSSProperties,

  sectionTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
  } as React.CSSProperties,

  currentShipSection: {
    padding: '2rem',
  } as React.CSSProperties,

  currentShipDisplay: {
    display: 'flex',
    gap: '2rem',
  } as React.CSSProperties,

  shipStats: {
    flex: 1,
  } as React.CSSProperties,

  shipHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  } as React.CSSProperties,

  shipName: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: 0,
  } as React.CSSProperties,

  tierBadge: {
    padding: '0.5rem 1rem',
    borderRadius: theme.borderRadius.full,
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
    color: 'white',
  } as React.CSSProperties,

  healthBars: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    marginBottom: '1.5rem',
  } as React.CSSProperties,

  healthLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    marginBottom: '0.5rem',
    fontWeight: '600',
  } as React.CSSProperties,

  healthBar: {
    height: '12px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  } as React.CSSProperties,

  healthFill: {
    height: '100%',
    transition: 'width 0.3s ease',
    borderRadius: theme.borderRadius.full,
  } as React.CSSProperties,

  shipInfoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem',
  } as React.CSSProperties,

  shipInfoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.borderRadius.md,
    fontSize: '14px',
  } as React.CSSProperties,

  modifiers: {
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.borderRadius.md,
  } as React.CSSProperties,

  modifiersList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  } as React.CSSProperties,

  modifierTag: {
    padding: '0.25rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.sm,
    fontSize: '13px',
    fontWeight: 'bold',
  } as React.CSSProperties,

  tierHeader: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '1rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '2px',
  } as React.CSSProperties,

  shipsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.5rem',
  } as React.CSSProperties,

  shipCard: {
    padding: '1.5rem',
  } as React.CSSProperties,

  shipCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  } as React.CSSProperties,

  shipCardName: {
    fontSize: '20px',
    fontWeight: 'bold',
    margin: 0,
  } as React.CSSProperties,

  shipDescription: {
    fontSize: '14px',
    color: theme.colors.text.secondary,
    marginBottom: '1rem',
    lineHeight: 1.5,
  } as React.CSSProperties,

  shipCardStats: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    marginBottom: '1rem',
  } as React.CSSProperties,

  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    padding: '0.5rem',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.borderRadius.sm,
  } as React.CSSProperties,

  priceSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  } as React.CSSProperties,

  price: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: theme.colors.accent.green,
  } as React.CSSProperties,

  repairBaySection: {
    padding: '2rem',
  } as React.CSSProperties,

  repairShipInfo: {
    marginBottom: '2rem',
  } as React.CSSProperties,

  repairOptions: {
    marginTop: '2rem',
  } as React.CSSProperties,

  repairOptionsTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '1rem',
  } as React.CSSProperties,

  repairGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  } as React.CSSProperties,

  repairOptionCard: {
    padding: '1.5rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.lg,
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  } as React.CSSProperties,

  repairOptionIcon: {
    fontSize: '32px',
  } as React.CSSProperties,

  repairOptionLabel: {
    fontSize: '16px',
    fontWeight: 'bold',
  } as React.CSSProperties,

  repairOptionTime: {
    fontSize: '14px',
    color: theme.colors.text.secondary,
  } as React.CSSProperties,

  repairOptionCost: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: theme.colors.accent.green,
  } as React.CSSProperties,

  damageWarning: {
    marginTop: '1.5rem',
    padding: '1rem',
    background: 'rgba(251, 191, 36, 0.1)',
    border: '1px solid #f59e0b',
    borderRadius: theme.borderRadius.md,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    color: '#f59e0b',
  } as React.CSSProperties,

  criticalWarning: {
    marginTop: '1rem',
    padding: '1rem',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid #ef4444',
    borderRadius: theme.borderRadius.md,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    color: '#ef4444',
    fontWeight: 'bold',
  } as React.CSSProperties,

  message: {
    marginTop: '2rem',
    padding: '1.5rem',
    background: 'rgba(0, 217, 255, 0.1)',
    border: '2px solid #00d9ff',
    borderRadius: theme.borderRadius.lg,
    textAlign: 'center' as const,
    fontSize: '16px',
    fontWeight: 'bold',
  } as React.CSSProperties,

  repairScreen: {
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center' as const,
    padding: '4rem 2rem',
  } as React.CSSProperties,

  repairTitle: {
    fontSize: '48px',
    fontWeight: 'bold',
    margin: '0 0 1rem 0',
    textTransform: 'uppercase' as const,
    letterSpacing: '4px',
    background: theme.colors.gradients.purple,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  } as React.CSSProperties,

  repairSubtitle: {
    fontSize: '20px',
    color: theme.colors.text.secondary,
    marginBottom: '3rem',
  } as React.CSSProperties,

  repairTimer: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '2px solid #00d9ff',
    borderRadius: theme.borderRadius.lg,
    padding: '3rem',
    marginBottom: '3rem',
  } as React.CSSProperties,

  repairInfo: {
    background: 'rgba(0, 217, 255, 0.1)',
    border: '1px solid #00d9ff',
    borderRadius: theme.borderRadius.md,
    padding: '2rem',
  } as React.CSSProperties,
}

export default Shipyard
