// src/pages/StarGate.tsx
import React, { useState, useEffect } from 'react'
import { useUser } from '../hooks/useUser'

type FuelType = 'ion' | 'fusion' | 'quantum'

interface Planet {
  id: string
  name: string
  icon: string | JSX.Element
  distance: number // in light years
  baseTime: number // in minutes
  baseFuelCost: number // base fuel units needed
  description: string
  minFuelType: FuelType // minimum fuel type required
  requiresQuantumWarp?: boolean
}

const PLANETS: Planet[] = [
  {
    id: 'earth',
    name: 'Earth',
    icon: (
      <img
        src="images/planets/earth.jpg"
        alt="Earth"
        style={{ width: '100%', height: '100%', borderRadius: '50%' }}
      />
    ),
    distance: 0,
    baseTime: 0,
    baseFuelCost: 0,
    description:
      'Home world. The birthplace of humanity and your criminal empire.',
    minFuelType: 'ion',
  },
  {
    id: 'alpha-centauri',
    name: 'Alpha Centauri',
    icon: (
      <img
        src="images/planets/alphaCentauri.jpg"
        alt="Alpha Centauri"
        style={{ width: '100%', height: '100%', borderRadius: '50%' }}
      />
    ),
    distance: 4.37,
    baseTime: 32,
    baseFuelCost: 1000,
    description: 'Closest neighbor. A thriving colony with loose regulations.',
    minFuelType: 'ion',
  },
  {
    id: 'barnards-star',
    name: "Barnard's Star",
    icon: (
      <img
        src="images/planets/barnardsStar.jpg"
        alt="Barnard's Star"
        style={{ width: '100%', height: '100%', borderRadius: '50%' }}
      />
    ),
    distance: 5.96,
    baseTime: 74,
    baseFuelCost: 2500,
    description: 'Remote outpost. Perfect for underground dealings.',
    minFuelType: 'ion',
  },
  {
    id: 'sirius',
    name: 'Sirius',
    icon: (
      <img
        src="images/planets/sirius.jpeg"
        alt="Sirius"
        style={{ width: '100%', height: '100%', borderRadius: '50%' }}
      />
    ),
    distance: 8.6,
    baseTime: 139,
    baseFuelCost: 3200,
    description: 'Binary star system. Chaos and opportunity in equal measure.',
    minFuelType: 'ion',
  },
  {
    id: 'epsilon-eridani',
    name: 'Epsilon Eridani',
    icon: (
      <img
        src="images/planets/epsilonEridani.png"
        alt="Epsilon Eridani"
        style={{ width: '100%', height: '100%', borderRadius: '50%' }}
      />
    ),
    distance: 10.5,
    baseTime: 197,
    baseFuelCost: 4500,
    description: 'Dark sector station. Cold, dangerous, and highly profitable.',
    minFuelType: 'ion',
  },
  {
    id: 'tau-ceti',
    name: 'Tau Ceti',
    icon: (
      <img
        src="images/planets/Tau_Ceti_e_planet.jpg"
        alt="Tau Ceti"
        style={{ width: '100%', height: '100%', borderRadius: '50%' }}
      />
    ),
    distance: 11.9,
    baseTime: 249,
    baseFuelCost: 5000,
    description: 'Tech hub. Advanced civilization with valuable resources.',
    minFuelType: 'ion',
  },
  {
    id: 'vega',
    name: 'Vega',
    icon: (
      <img
        src="images/planets/vega.jpeg"
        alt="Vega"
        style={{ width: '100%', height: '100%', borderRadius: '50%' }}
      />
    ),
    distance: 25.1,
    baseTime: 301,
    baseFuelCost: 5500,
    description:
      'Luxury resort world. Where the wealthy play and criminals thrive.',
    minFuelType: 'fusion',
  },
  {
    id: 'betelgeuse',
    name: 'Betelgeuse',
    icon: (
      <img
        src="images/planets/betelguese.jpeg"
        alt="Betelguese"
        style={{ width: '100%', height: '100%', borderRadius: '50%' }}
      />
    ),
    distance: 548.3,
    baseTime: 395,
    baseFuelCost: 6200,
    description:
      'Red giant frontier. Lawless expanse at the edge of known space.',
    minFuelType: 'quantum',
  },
  {
    id: 'sagittarius-a',
    name: 'Sagittarius A*',
    icon: (
      <img
        src="images/planets/blackHole.jpg"
        alt="Sag A"
        style={{ width: '100%', height: '100%', borderRadius: '50%' }}
      />
    ),
    distance: 26000,
    baseTime: 500,
    baseFuelCost: 8000,
    description:
      'The galactic core. A black hole surrounded by unimaginable danger and reward.',
    minFuelType: 'quantum',
    requiresQuantumWarp: true,
  },
]

const StarGate = () => {
  const {
    user,
    updateUser,
    isTraveling,
    setIsTraveling,
    travelTimeRemaining,
    setTravelTimeRemaining,
    useFuel,
    getFuelCount,
  } = useUser()

  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null)
  const [selectedFuelType, setSelectedFuelType] = useState<FuelType>('ion')
  const [destination, setDestination] = useState<string>('')
  const [message, setMessage] = useState<string | null>(null)

  // Travel timer countdown
  useEffect(() => {
    if (!isTraveling || travelTimeRemaining <= 0) return

    const interval = setInterval(() => {
      setTravelTimeRemaining((prev) => {
        const newTime = prev - 1
        if (newTime <= 0) {
          // Arrive at destination
          setIsTraveling(false)
          if (user) {
            updateUser({ location: destination })
          }
          setMessage(
            `🚀 Arrived at ${PLANETS.find((p) => p.id === destination)?.name}!`
          )
          return 0
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [
    isTraveling,
    travelTimeRemaining,
    destination,
    user,
    updateUser,
    setIsTraveling,
    setTravelTimeRemaining,
  ])

  if (!user) return null

  const currentPlanet =
    PLANETS.find((p) => p.id === user.location) || PLANETS[0]

  const getFuelCost = (planet: Planet, fuelType: FuelType): number => {
    const baseCost = planet.baseFuelCost

    switch (fuelType) {
      case 'ion':
        return baseCost
      case 'fusion':
        return Math.floor(baseCost / 3) // Uses 1/3 the fuel
      case 'quantum':
        return Math.floor(baseCost / 6) // Uses 1/6 the fuel
      default:
        return baseCost
    }
  }

  const getTravelTime = (planet: Planet, fuelType: FuelType): number => {
    const baseTime = planet.baseTime

    switch (fuelType) {
      case 'ion':
        return baseTime
      case 'fusion':
        return Math.floor(baseTime * 0.75) // 25% faster
      case 'quantum':
        return Math.floor(baseTime * 0.5) // 50% faster
      default:
        return baseTime
    }
  }

  const canUseFuelType = (planet: Planet, fuelType: FuelType): boolean => {
    const fuelHierarchy = { ion: 1, fusion: 2, quantum: 3 }
    return fuelHierarchy[fuelType] >= fuelHierarchy[planet.minFuelType]
  }

  const hasQuantumWarp = (): boolean => {
    return user.inventory.some((inv) => inv.item.id === 'quantum_warp')
  }

  const handleInitiateTravel = (planet: Planet, fuelType: FuelType) => {
    if (planet.id === user.location) {
      return setMessage('❌ You are already at this planet!')
    }

    // Check if planet requires special item
    if (planet.requiresQuantumWarp && !hasQuantumWarp()) {
      return setMessage(
        '❌ You need a Quantum Warp device to travel to this location!'
      )
    }

    // Check if fuel type is sufficient for this planet
    if (!canUseFuelType(planet, fuelType)) {
      return setMessage(
        `❌ This planet requires at least ${planet.minFuelType.toUpperCase()} fuel!`
      )
    }

    const fuelCost = getFuelCost(planet, fuelType)
    const travelTime = getTravelTime(planet, fuelType)
    const currentFuel = getFuelCount(fuelType)

    if (currentFuel < fuelCost) {
      return setMessage(
        `❌ Not enough fuel! Need ${fuelCost} ${getFuelName(
          fuelType
        )} (you have ${currentFuel})`
      )
    }

    const confirmed = window.confirm(
      `Initiate jump to ${planet.name}?\n\n` +
        `Fuel Type: ${getFuelName(fuelType)}\n` +
        `Fuel Cost: ${fuelCost} units\n` +
        `Travel Time: ${formatTime(travelTime * 60)}\n` +
        `Distance: ${planet.distance} light years\n\n` +
        `You cannot perform actions while traveling through hyperspace.`
    )

    if (!confirmed) return

    if (!useFuel(fuelType, fuelCost)) {
      return setMessage('❌ Failed to consume fuel')
    }

    // Start traveling
    setIsTraveling(true)
    setTravelTimeRemaining(travelTime * 60) // Convert minutes to seconds
    setDestination(planet.id)
    setSelectedPlanet(null)
    setMessage(null)
  }

  const getFuelName = (fuelType: FuelType): string => {
    switch (fuelType) {
      case 'ion':
        return 'Ion Propellant'
      case 'fusion':
        return 'Fusion Core Fuel'
      case 'quantum':
        return 'Quantum Flux'
      default:
        return 'Unknown Fuel'
    }
  }

  const getFuelIcon = (fuelType: FuelType): string => {
    switch (fuelType) {
      case 'ion':
        return '⚡'
      case 'fusion':
        return '🔋'
      case 'quantum':
        return '💠'
      default:
        return '⛽'
    }
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

  // If traveling, show hyperspace screen
  if (isTraveling) {
    const destPlanet = PLANETS.find((p) => p.id === destination)

    return (
      <div style={styles.container}>
        <div style={styles.hyperspaceScreen}>
          <div style={{ fontSize: '64px', marginBottom: '2rem' }}>🚀</div>
          <h1 style={styles.hyperspaceTitle}>HYPERSPACE JUMP</h1>
          <p style={styles.hyperspaceSubtitle}>
            En route to {destPlanet?.icon} {destPlanet?.name}
          </p>

          <div style={styles.hyperspaceTimer}>
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
              {formatTime(travelTimeRemaining)}
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '1rem' }}>
              ({Math.ceil(travelTimeRemaining / 60)} minutes)
            </div>
          </div>

          <div style={styles.hyperspaceInfo}>
            <div style={{ fontSize: '16px', color: '#aaa', lineHeight: '1.8' }}>
              You are currently traveling through hyperspace.
              <br />
              All systems locked. Destination coordinates locked in.
              <br />
              Enjoy the view of compressed space-time.
            </div>
          </div>

          <div style={{ marginTop: '2rem', fontSize: '14px', color: '#666' }}>
            Distance: {destPlanet?.distance} light years
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>STARGATE TERMINAL</h1>
        <p style={styles.subtitle}>
          Travel the galaxy. See what you can do across the stars.
        </p>

        <div style={styles.currentLocation}>
          <span style={{ color: '#888' }}>CURRENT LOCATION:</span>
          <span style={{ fontSize: '24px', marginLeft: '1rem' }}>
            {currentPlanet.icon} {currentPlanet.name}
          </span>
        </div>

        <div style={styles.statsBar}>
          <div style={styles.statItem}>
            <span style={{ color: '#888' }}>CREDITS:</span>
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
            <span style={{ color: '#888' }}>⚡ ION:</span>
            <span style={{ fontWeight: 'bold', marginLeft: '0.5rem' }}>
              {getFuelCount('ion')}
            </span>
          </div>
          <div style={styles.statItem}>
            <span style={{ color: '#888' }}>🔋 FUSION:</span>
            <span style={{ fontWeight: 'bold', marginLeft: '0.5rem' }}>
              {getFuelCount('fusion')}
            </span>
          </div>
          <div style={styles.statItem}>
            <span style={{ color: '#888' }}>💠 QUANTUM:</span>
            <span style={{ fontWeight: 'bold', marginLeft: '0.5rem' }}>
              {getFuelCount('quantum')}
            </span>
          </div>
          {hasQuantumWarp() && (
            <div
              style={{
                ...styles.statItem,
                background:
                  'linear-gradient(135deg, #00d9ff22 0%, #b829ff22 100%)',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #00d9ff',
              }}
            >
              <span style={{ color: '#00d9ff' }}>🕳️ QUANTUM WARP EQUIPPED</span>
            </div>
          )}
        </div>
      </div>

      {/* Destinations Grid */}
      <div style={styles.destinationsGrid}>
        {PLANETS.filter((planet) => planet.id !== user.location).map(
          (planet) => {
            const isLocked = planet.requiresQuantumWarp && !hasQuantumWarp()

            return (
              <button
                key={planet.id}
                onClick={() => !isLocked && setSelectedPlanet(planet)}
                disabled={isLocked}
                style={{
                  ...styles.planetCard,
                  opacity: isLocked ? 0.5 : 1,
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!isLocked) {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.borderColor = '#00d9ff'
                    e.currentTarget.style.boxShadow =
                      '0 8px 24px rgba(0, 217, 255, 0.3)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLocked) {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.borderColor = '#333'
                    e.currentTarget.style.boxShadow = 'none'
                  }
                }}
              >
                {isLocked && <div style={styles.lockedBadge}>🔒 LOCKED</div>}
                <div style={{ fontSize: '64px', marginBottom: '1rem' }}>
                  {planet.icon}
                </div>
                <h3 style={styles.planetName}>{planet.name}</h3>
                <p style={styles.planetDesc}>{planet.description}</p>

                <div style={styles.planetStats}>
                  <div style={styles.planetStat}>
                    <span style={{ color: '#888' }}>Distance:</span>
                    <span style={{ color: '#00d9ff', fontWeight: 'bold' }}>
                      {planet.distance} ly
                    </span>
                  </div>
                  <div style={styles.planetStat}>
                    <span style={{ color: '#888' }}>Jump Time:</span>
                    <span style={{ color: '#fff', fontWeight: 'bold' }}>
                      {Math.floor(planet.baseTime / 60)}h {planet.baseTime % 60}
                      m
                    </span>
                  </div>
                </div>

                <div style={styles.fuelRequirement}>
                  Min Fuel: {getFuelIcon(planet.minFuelType)}{' '}
                  {getFuelName(planet.minFuelType)}
                </div>
              </button>
            )
          }
        )}
      </div>

      {/* Travel Modal */}
      {selectedPlanet && (
        <div onClick={() => setSelectedPlanet(null)} style={styles.modal}>
          <div onClick={(e) => e.stopPropagation()} style={styles.modalContent}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '64px', marginBottom: '1rem' }}>
                {selectedPlanet.icon}
              </div>
              <h2 style={styles.modalTitle}>{selectedPlanet.name}</h2>
              <p style={styles.modalSubtitle}>{selectedPlanet.description}</p>
              <div
                style={{
                  marginTop: '1rem',
                  color: '#00d9ff',
                  fontSize: '14px',
                }}
              >
                📍 Distance: {selectedPlanet.distance} light years
              </div>
            </div>

            {/* Fuel Type Selector */}
            <div style={styles.fuelSelector}>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                }}
              >
                SELECT FUEL TYPE
              </div>

              <FuelTypeCard
                type="ion"
                label="Ion Propellant"
                icon="⚡"
                available={getFuelCount('ion')}
                cost={getFuelCost(selectedPlanet, 'ion')}
                time={getTravelTime(selectedPlanet, 'ion')}
                selected={selectedFuelType === 'ion'}
                onClick={() => setSelectedFuelType('ion')}
                canUse={canUseFuelType(selectedPlanet, 'ion')}
              />

              <FuelTypeCard
                type="fusion"
                label="Fusion Core Fuel"
                icon="🔋"
                available={getFuelCount('fusion')}
                cost={getFuelCost(selectedPlanet, 'fusion')}
                time={getTravelTime(selectedPlanet, 'fusion')}
                bonus="25% faster, 66% less fuel"
                selected={selectedFuelType === 'fusion'}
                onClick={() => setSelectedFuelType('fusion')}
                canUse={canUseFuelType(selectedPlanet, 'fusion')}
              />

              <FuelTypeCard
                type="quantum"
                label="Quantum Flux"
                icon="💠"
                available={getFuelCount('quantum')}
                cost={getFuelCost(selectedPlanet, 'quantum')}
                time={getTravelTime(selectedPlanet, 'quantum')}
                bonus="50% faster, 83% less fuel"
                selected={selectedFuelType === 'quantum'}
                onClick={() => setSelectedFuelType('quantum')}
                canUse={canUseFuelType(selectedPlanet, 'quantum')}
              />
            </div>

            {/* Planet Info */}
            <div style={styles.planetInfo}>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem',
                }}
              >
                TRAVEL REQUIREMENTS:
              </div>
              <div
                style={{ color: '#aaa', fontSize: '13px', lineHeight: '1.6' }}
              >
                • Minimum Fuel: {getFuelIcon(selectedPlanet.minFuelType)}{' '}
                {getFuelName(selectedPlanet.minFuelType)}
                <br />• Base Travel Time:{' '}
                {Math.floor(selectedPlanet.baseTime / 60)}h{' '}
                {selectedPlanet.baseTime % 60}m
                <br />• Distance: {selectedPlanet.distance} light years
              </div>

              {selectedPlanet.requiresQuantumWarp && (
                <div
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    background: '#7f1d1d',
                    borderRadius: '6px',
                    border: '1px solid #ef4444',
                  }}
                >
                  <span style={{ color: '#ef4444', fontWeight: 'bold' }}>
                    ⚠️ SPECIAL REQUIREMENT:
                  </span>
                  <span
                    style={{
                      color: '#aaa',
                      fontSize: '13px',
                      marginLeft: '0.5rem',
                    }}
                  >
                    Quantum Warp device required for this destination!
                  </span>
                </div>
              )}
            </div>

            {/* Initiate Jump Button */}
            <button
              onClick={() =>
                handleInitiateTravel(selectedPlanet, selectedFuelType)
              }
              style={styles.jumpButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #00e5ff 0%, #c040ff 100%)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #00d9ff 0%, #b829ff 100%)'
              }}
            >
              INITIATE HYPERSPACE JUMP
            </button>

            <button
              onClick={() => setSelectedPlanet(null)}
              style={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {message && <div style={styles.message}>{message}</div>}
    </div>
  )
}

// Fuel Type Card Component
const FuelTypeCard = ({
  type,
  label,
  icon,
  available,
  cost,
  time,
  bonus,
  selected,
  onClick,
  canUse,
}: {
  type: string
  label: string
  icon: string
  available: number
  cost: number
  time: number
  bonus?: string
  selected: boolean
  onClick: () => void
  canUse: boolean
}) => {
  const hasEnough = available >= cost
  const disabled = !canUse || !hasEnough

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles.fuelCard,
        borderColor: selected ? '#00d9ff' : '#333',
        background: selected ? 'rgba(0, 217, 255, 0.1)' : '#1a1a1a',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '24px' }}>{icon}</span>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{label}</div>
            {bonus && (
              <div style={{ fontSize: '12px', color: '#22c55e' }}>{bonus}</div>
            )}
            {!canUse && (
              <div style={{ fontSize: '12px', color: '#ef4444' }}>
                Not powerful enough
              </div>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: hasEnough ? '#22c55e' : '#ef4444',
            }}
          >
            {cost} units
          </div>
          <div style={{ fontSize: '12px', color: '#888' }}>
            You have: {available}
          </div>
          <div
            style={{ fontSize: '12px', color: '#888', marginTop: '0.25rem' }}
          >
            {Math.floor(time / 60)}h {time % 60}m
          </div>
        </div>
      </div>
    </button>
  )
}

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    background: 'rgba(0, 0, 0, 0.3)',
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
    background: '#ffffff71',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  } as React.CSSProperties,

  subtitle: {
    fontSize: '16px',
    color: '#888',
    margin: '0 0 2rem 0',
  } as React.CSSProperties,

  currentLocation: {
    fontSize: '18px',
    marginBottom: '1.5rem',
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

  destinationsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
    maxWidth: '1400px',
    margin: '0 auto',
  } as React.CSSProperties,

  planetCard: {
    background: 'rgba(32, 29, 182, 0.1)',
    border: '2px solid #333',
    borderRadius: '12px',
    padding: '2rem',
    textAlign: 'center' as const,
    cursor: 'pointer',
    transition: 'all 0.3s',
    position: 'relative' as const,
  } as React.CSSProperties,

  lockedBadge: {
    position: 'absolute' as const,
    top: '1rem',
    right: '1rem',
    padding: '0.5rem 1rem',
    background: 'rgba(239, 68, 68, 0.3)',
    border: '1px solid #ef4444',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#ef4444',
  } as React.CSSProperties,

  planetName: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 0.5rem 0',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    color: 'white',
  } as React.CSSProperties,

  planetDesc: {
    fontSize: '14px',
    color: '#888',
    margin: '0 0 1.5rem 0',
    lineHeight: '1.5',
    minHeight: '60px',
  } as React.CSSProperties,

  planetStats: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '1rem',
  } as React.CSSProperties,

  planetStat: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
    fontSize: '14px',
  } as React.CSSProperties,

  fuelRequirement: {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    background: 'rgba(0, 217, 255, 0.2)',
    border: '1px solid #00d9ff',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#00d9ff',
    fontWeight: 'bold',
  } as React.CSSProperties,

  modal: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '2rem',
  } as React.CSSProperties,

  modalContent: {
    background: '#1a1a1a',
    borderRadius: '12px',
    border: '2px solid #00d9ff',
    padding: '2rem',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto' as const,
  } as React.CSSProperties,

  modalTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '0 0 0.5rem 0',
  } as React.CSSProperties,

  modalSubtitle: {
    fontSize: '16px',
    color: '#888',
    margin: 0,
  } as React.CSSProperties,

  fuelSelector: {
    marginBottom: '2rem',
  } as React.CSSProperties,

  fuelCard: {
    width: '100%',
    padding: '1rem',
    marginBottom: '0.75rem',
    background: '#1a1a1a',
    border: '2px solid #333',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left' as const,
  } as React.CSSProperties,

  planetInfo: {
    background: '#0a0a0a',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    fontSize: '14px',
  } as React.CSSProperties,

  jumpButton: {
    width: '100%',
    padding: '1.5rem',
    background: 'linear-gradient(135deg, #00d9ff 0%, #b829ff 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textTransform: 'uppercase' as const,
    letterSpacing: '2px',
    marginBottom: '0.75rem',
  } as React.CSSProperties,

  cancelButton: {
    width: '100%',
    padding: '1rem',
    background: 'transparent',
    border: '1px solid #333',
    borderRadius: '8px',
    color: '#888',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  } as React.CSSProperties,

  message: {
    marginTop: '2rem',
    padding: '1.5rem',
    background: '#1a1a1a',
    border: '2px solid #00d9ff',
    borderRadius: '8px',
    textAlign: 'center' as const,
    fontSize: '16px',
    fontWeight: 'bold',
    maxWidth: '800px',
    margin: '2rem auto 0',
  } as React.CSSProperties,

  hyperspaceScreen: {
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center' as const,
    padding: '4rem 2rem',
  } as React.CSSProperties,

  hyperspaceTitle: {
    fontSize: '48px',
    fontWeight: 'bold',
    margin: '0 0 1rem 0',
    textTransform: 'uppercase' as const,
    letterSpacing: '4px',
    background: 'linear-gradient(135deg, #00d9ff 0%, #b829ff 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  } as React.CSSProperties,

  hyperspaceSubtitle: {
    fontSize: '20px',
    color: '#888',
    marginBottom: '3rem',
  } as React.CSSProperties,

  hyperspaceTimer: {
    background: '#1a1a1a',
    border: '2px solid #00d9ff',
    borderRadius: '12px',
    padding: '3rem',
    marginBottom: '3rem',
  } as React.CSSProperties,

  hyperspaceInfo: {
    background: 'rgba(0, 217, 255, 0.1)',
    border: '1px solid #00d9ff',
    borderRadius: '8px',
    padding: '2rem',
  } as React.CSSProperties,
}

export default StarGate
