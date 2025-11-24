// src/pages/Airport.tsx
import { useState, useEffect } from 'react'
import { useUser } from '../hooks/useUser'

type FlightClass = 'economy' | 'business' | 'first'

interface Country {
  id: string
  name: string
  flag: string
  baseTime: number // in minutes
  baseCost: number // economy price
  description: string
  crimes: string[] // Available crimes in this country
  jailMultiplier: number // Jail time multiplier if caught
}

const COUNTRIES: Country[] = [
  {
    id: 'usa',
    name: 'United States',
    flag: '🇺🇸',
    baseTime: 0,
    baseCost: 0,
    description: 'Home land. The land of opportunity and crime.',
    crimes: ['All crimes available'],
    jailMultiplier: 1,
  },
  {
    id: 'mexico',
    name: 'Mexico',
    flag: '🇲🇽',
    baseTime: 32, // 32 mins
    baseCost: 1000,
    description: 'Close neighbor. Cartels, tequila, and opportunity.',
    crimes: ['Drug Smuggling', 'Border Running'],
    jailMultiplier: 2,
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    flag: '🇬🇧',
    baseTime: 74, // 1 hour 14 mins
    baseCost: 2500,
    description: 'Across the pond. Tea, royalty, and underground dealings.',
    crimes: ['Art Theft', 'Diamond Heist'],
    jailMultiplier: 2.5,
  },
  {
    id: 'brazil',
    name: 'Brazil',
    flag: '🇧🇷',
    baseTime: 139, // 2 hour 19 mins
    baseCost: 3200,
    description: 'South American paradise. Carnival, favelas, and chaos.',
    crimes: ['Kidnapping', 'Jungle Smuggling'],
    jailMultiplier: 3,
  },
  {
    id: 'russia',
    name: 'Russia',
    flag: '🇷🇺',
    baseTime: 197, // 3 hours 17 mins
    baseCost: 4500,
    description: 'The motherland. Cold, dangerous, and profitable.',
    crimes: ['Arms Dealing', 'Cybercrime'],
    jailMultiplier: 3.5,
  },
  {
    id: 'japan',
    name: 'Japan',
    flag: '🇯🇵',
    baseTime: 249, // 4 hours 9 mins
    baseCost: 5000,
    description: 'Land of the rising sun. Honor, tech, and yakuza.',
    crimes: ['Tech Theft', 'Yakuza Operations'],
    jailMultiplier: 3,
  },
  {
    id: 'dubai',
    name: 'Dubai',
    flag: '🇦🇪',
    baseTime: 301, // 5 hours 1 min
    baseCost: 5500,
    description: 'City of gold. Luxury, oil money, and high stakes.',
    crimes: ['Gold Smuggling', 'Luxury Car Theft'],
    jailMultiplier: 4,
  },
  {
    id: 'australia',
    name: 'Australia',
    flag: '🇦🇺',
    baseTime: 395, // 6 hours 35 mins
    baseCost: 6200,
    description: 'Down under. Remote, wild, and lawless outback.',
    crimes: ['Wildlife Trafficking', 'Outback Heist'],
    jailMultiplier: 2.5,
  },
]

const Airport = () => {
  const {
    user,
    updateUser,
    spendMoney,
    isTraveling,
    setIsTraveling,
    travelTimeRemaining,
    setTravelTimeRemaining,
  } = useUser()
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [selectedClass, setSelectedClass] = useState<FlightClass>('economy')
  const [destination, setDestination] = useState<string>('')
  const [message, setMessage] = useState<string | null>(null)

  // Check if user owns private jet
  const hasPrivateJet =
    user?.inventory.some(
      (inv) => inv.item.id === 'vehicle_jet' // Placeholder ID
    ) || false

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
            `✈️ Arrived in ${
              COUNTRIES.find((c) => c.id === destination)?.name
            }!`
          )
          return 0
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isTraveling, travelTimeRemaining, destination, user, updateUser])

  if (!user) return null

  const currentCountry =
    COUNTRIES.find((c) => c.id === user.location) || COUNTRIES[0]

  const getFlightCost = (
    country: Country,
    flightClass: FlightClass
  ): number => {
    if (hasPrivateJet) return 0

    switch (flightClass) {
      case 'economy':
        return country.baseCost
      case 'business':
        return country.baseCost * 3
      case 'first':
        return country.baseCost * 6
      default:
        return country.baseCost
    }
  }

  const getFlightTime = (
    country: Country,
    flightClass: FlightClass
  ): number => {
    const time = country.baseTime

    if (hasPrivateJet) {
      return Math.floor(time * 0.25) // 25% time with private jet
    }

    switch (flightClass) {
      case 'economy':
        return time
      case 'business':
        return Math.floor(time * 0.75)
      case 'first':
        return Math.floor(time * 0.5)
      default:
        return time
    }
  }

  const handleBookFlight = (country: Country, flightClass: FlightClass) => {
    if (country.id === user.location) {
      return setMessage('❌ You are already in this country!')
    }

    const cost = getFlightCost(country, flightClass)
    const time = getFlightTime(country, flightClass)

    if (cost > 0 && user.money < cost) {
      return setMessage(`❌ Not enough money! Need $${cost.toLocaleString()}`)
    }

    const confirmed = window.confirm(
      `Book flight to ${country.name}?\n\n` +
        `Class: ${flightClass.toUpperCase()}\n` +
        `Cost: ${
          cost > 0 ? `$${cost.toLocaleString()}` : 'FREE (Private Jet)'
        }\n` +
        `Travel Time: ${formatTime(time * 60)}\n\n` +
        `You cannot do anything while traveling.`
    )

    if (!confirmed) return

    if (cost > 0 && !spendMoney(cost)) {
      return setMessage('❌ Failed to book flight')
    }

    // Start traveling
    setIsTraveling(true)
    setTravelTimeRemaining(time * 60) // Convert minutes to seconds
    setDestination(country.id)
    setSelectedCountry(null)
    setMessage(null)
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

  // If traveling, show travel screen
  if (isTraveling) {
    const destCountry = COUNTRIES.find((c) => c.id === destination)

    return (
      <div style={styles.container}>
        <div style={styles.travelScreen}>
          <div style={{ fontSize: '64px', marginBottom: '2rem' }}>✈️</div>
          <h1 style={styles.travelTitle}>IN FLIGHT</h1>
          <p style={styles.travelSubtitle}>
            Flying to {destCountry?.flag} {destCountry?.name}
          </p>

          <div style={styles.travelTimer}>
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

          <div style={styles.travelInfo}>
            <div style={{ fontSize: '16px', color: '#aaa', lineHeight: '1.8' }}>
              🛫 You are currently in flight and cannot perform any actions.
              <br />
              ⏰ Sit back and relax. You'll arrive shortly.
              <br />
              💼 Use this time to plan your next move.
            </div>
          </div>

          <div style={{ marginTop: '2rem', fontSize: '14px', color: '#666' }}>
            Note: Purchase a laptop to browse the web during flights (feature
            coming soon)
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>✈️ INTERNATIONAL AIRPORT</h1>
        <p style={styles.subtitle}>
          Travel the world. Expand your criminal empire.
        </p>

        <div style={styles.currentLocation}>
          <span style={{ color: '#888' }}>CURRENT LOCATION:</span>
          <span style={{ fontSize: '24px', marginLeft: '1rem' }}>
            {currentCountry.flag} {currentCountry.name}
          </span>
        </div>

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
          {hasPrivateJet && (
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
              <span style={{ color: '#00d9ff' }}>🛩️ PRIVATE JET OWNED</span>
            </div>
          )}
        </div>
      </div>

      {/* Destinations Grid */}
      <div style={styles.destinationsGrid}>
        {COUNTRIES.filter((country) => country.id !== user.location).map(
          (country) => (
            <button
              key={country.id}
              onClick={() => setSelectedCountry(country)}
              style={styles.countryCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.borderColor = '#00d9ff'
                e.currentTarget.style.boxShadow =
                  '0 8px 24px rgba(0, 217, 255, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = '#333'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ fontSize: '64px', marginBottom: '1rem' }}>
                {country.flag}
              </div>
              <h3 style={styles.countryName}>{country.name}</h3>
              <p style={styles.countryDesc}>{country.description}</p>

              <div style={styles.countryStats}>
                <div style={styles.countryStat}>
                  <span style={{ color: '#888' }}>Flight Time:</span>
                  <span style={{ color: '#fff', fontWeight: 'bold' }}>
                    {Math.floor(country.baseTime / 60)}h {country.baseTime % 60}
                    m
                  </span>
                </div>
                <div style={styles.countryStat}>
                  <span style={{ color: '#888' }}>From:</span>
                  <span style={{ color: '#22c55e', fontWeight: 'bold' }}>
                    ${country.baseCost.toLocaleString()}
                  </span>
                </div>
              </div>

              <div style={styles.crimesBadge}>
                {country.crimes.length} exclusive crimes
              </div>
            </button>
          )
        )}
      </div>

      {/* Flight Booking Modal */}
      {selectedCountry && (
        <div onClick={() => setSelectedCountry(null)} style={styles.modal}>
          <div onClick={(e) => e.stopPropagation()} style={styles.modalContent}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '64px', marginBottom: '1rem' }}>
                {selectedCountry.flag}
              </div>
              <h2 style={styles.modalTitle}>{selectedCountry.name}</h2>
              <p style={styles.modalSubtitle}>{selectedCountry.description}</p>
            </div>

            {/* Flight Classes */}
            <div style={styles.classSelector}>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                }}
              >
                SELECT FLIGHT CLASS
              </div>

              <FlightClassCard
                type="economy"
                label="Economy"
                icon="💺"
                cost={getFlightCost(selectedCountry, 'economy')}
                time={getFlightTime(selectedCountry, 'economy')}
                selected={selectedClass === 'economy'}
                onClick={() => setSelectedClass('economy')}
                hasJet={hasPrivateJet}
              />

              <FlightClassCard
                type="business"
                label="Business"
                icon="🛋️"
                cost={getFlightCost(selectedCountry, 'business')}
                time={getFlightTime(selectedCountry, 'business')}
                discount="25% faster"
                selected={selectedClass === 'business'}
                onClick={() => setSelectedClass('business')}
                hasJet={hasPrivateJet}
              />

              <FlightClassCard
                type="first"
                label="First Class"
                icon="👑"
                cost={getFlightCost(selectedCountry, 'first')}
                time={getFlightTime(selectedCountry, 'first')}
                discount="50% faster"
                selected={selectedClass === 'first'}
                onClick={() => setSelectedClass('first')}
                hasJet={hasPrivateJet}
              />

              {hasPrivateJet && (
                <div
                  style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background:
                      'linear-gradient(135deg, #00d9ff22 0%, #b829ff22 100%)',
                    border: '2px solid #00d9ff',
                    borderRadius: '8px',
                    textAlign: 'center',
                    color: '#00d9ff',
                    fontWeight: 'bold',
                  }}
                >
                  🛩️ USING YOUR PRIVATE JET - FREE & 75% FASTER
                </div>
              )}
            </div>

            {/* Country Info */}
            <div style={styles.countryInfo}>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem',
                }}
              >
                AVAILABLE CRIMES:
              </div>
              <div
                style={{ color: '#aaa', fontSize: '13px', lineHeight: '1.6' }}
              >
                {selectedCountry.crimes.map((crime, idx) => (
                  <div key={idx}>• {crime}</div>
                ))}
              </div>

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
                  ⚠️ WARNING:
                </span>
                <span
                  style={{
                    color: '#aaa',
                    fontSize: '13px',
                    marginLeft: '0.5rem',
                  }}
                >
                  Jail sentences are {selectedCountry.jailMultiplier}x longer if
                  caught here!
                </span>
              </div>
            </div>

            {/* Book Button */}
            <button
              onClick={() => handleBookFlight(selectedCountry, selectedClass)}
              style={styles.bookButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #00e5ff 0%, #c040ff 100%)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #00d9ff 0%, #b829ff 100%)'
              }}
            >
              BOOK FLIGHT
            </button>

            <button
              onClick={() => setSelectedCountry(null)}
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

// Flight Class Card Component
const FlightClassCard = ({
  type,
  label,
  icon,
  cost,
  time,
  discount,
  selected,
  onClick,
  hasJet,
}: {
  type: string
  label: string
  icon: string
  cost: number
  time: number
  discount?: string
  selected: boolean
  onClick: () => void
  hasJet: boolean
}) => (
  <button
    onClick={onClick}
    style={{
      ...styles.classCard,
      borderColor: selected ? '#00d9ff' : '#333',
      background: selected ? 'rgba(0, 217, 255, 0.1)' : '#1a1a1a',
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
          {discount && (
            <div style={{ fontSize: '12px', color: '#22c55e' }}>{discount}</div>
          )}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: hasJet ? '#00d9ff' : '#22c55e',
          }}
        >
          {cost > 0 ? `$${cost.toLocaleString()}` : 'FREE'}
        </div>
        <div style={{ fontSize: '12px', color: '#888' }}>
          {Math.floor(time / 60)}h {time % 60}m
        </div>
      </div>
    </div>
  </button>
)

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    background: '#0a0a0a',
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

  countryCard: {
    background: '#1a1a1a',
    border: '2px solid #333',
    borderRadius: '12px',
    padding: '2rem',
    textAlign: 'center' as const,
    cursor: 'pointer',
    transition: 'all 0.3s',
  } as React.CSSProperties,

  countryName: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 0.5rem 0',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  } as React.CSSProperties,

  countryDesc: {
    fontSize: '14px',
    color: '#888',
    margin: '0 0 1.5rem 0',
    lineHeight: '1.5',
    minHeight: '60px',
  } as React.CSSProperties,

  countryStats: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '1rem',
  } as React.CSSProperties,

  countryStat: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
    fontSize: '14px',
  } as React.CSSProperties,

  crimesBadge: {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    background: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid #ef4444',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#ef4444',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
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

  classSelector: {
    marginBottom: '2rem',
  } as React.CSSProperties,

  classCard: {
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

  countryInfo: {
    background: '#0a0a0a',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    fontSize: '14px',
  } as React.CSSProperties,

  bookButton: {
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

  travelScreen: {
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center' as const,
    padding: '4rem 2rem',
  } as React.CSSProperties,

  travelTitle: {
    fontSize: '48px',
    fontWeight: 'bold',
    margin: '0 0 1rem 0',
    textTransform: 'uppercase' as const,
    letterSpacing: '4px',
  } as React.CSSProperties,

  travelSubtitle: {
    fontSize: '20px',
    color: '#888',
    marginBottom: '3rem',
  } as React.CSSProperties,

  travelTimer: {
    background: '#1a1a1a',
    border: '2px solid #00d9ff',
    borderRadius: '12px',
    padding: '3rem',
    marginBottom: '3rem',
  } as React.CSSProperties,

  travelInfo: {
    background: 'rgba(0, 217, 255, 0.1)',
    border: '1px solid #00d9ff',
    borderRadius: '8px',
    padding: '2rem',
  } as React.CSSProperties,
}

export default Airport
