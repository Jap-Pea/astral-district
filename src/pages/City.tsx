// src/pages/City.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TravelingBlocker from '../components/TravelingBlocker'

type ViewMode = 'map' | 'list'

interface CityLocation {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  route: string
  comingSoon?: boolean
  mapPosition?: { x: number; y: number } // now in px
}

const City = () => {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<ViewMode>('map')

  const locations: CityLocation[] = [
    {
      id: 'properties',
      name: 'Real Estate',
      icon: '🏠',
      description: 'Buy and manage properties',
      route: '/properties',
      mapPosition: { x: 120, y: 220 },
    },
    {
      id: 'gym',
      name: 'Gym',
      icon: (
        <img
          src="/images/icons/gym.png"
          alt="gym"
          style={{ width: 36, height: 36 }}
        />
      ),
      description: 'Purchase memberships and train',
      route: '/gym',
      mapPosition: { x: 300, y: 125 },
    },
    {
      id: 'shops',
      name: 'Shops',
      icon: (
        <img
          src="/images/icons/shop.png"
          alt="shop"
          style={{ width: 36, height: 36 }}
        />
      ),
      description: 'Buy and sell items',
      route: '/shops',
      comingSoon: false,
      mapPosition: { x: 195, y: 290 },
    },
    {
      id: 'stargate',
      name: 'Star Gate',
      icon: (
        <img
          src="/images/icons/black-hole.png"
          alt="airport"
          style={{ width: 36, height: 36 }}
        />
      ),
      description: 'Space Travel',
      route: '/stargate',
      comingSoon: false,
      mapPosition: { x: 80, y: 150 },
    },
    {
      id: 'dealership',
      name: 'Dealership',
      icon: '🚗',
      description: 'Buy cars and vehicles',
      route: '/dealership',
      comingSoon: true,
      mapPosition: { x: 350, y: 225 },
    },
    {
      id: 'jail',
      name: 'Jail',
      icon: (
        <img
          src="/images/icons/jail.png"
          alt="jail"
          style={{ width: 36, height: 36 }}
        />
      ),
      description: 'Bail out friends',
      route: '/jail',
      mapPosition: { x: 375, y: 150 },
    },
    {
      id: 'hospital',
      name: 'Hospital',
      icon: (
        <img
          src="/images/icons/hospital.png"
          alt="hospital"
          style={{ width: 38, height: 38 }}
        />
      ),
      description: 'Medical services',
      route: '/hospital',
      mapPosition: { x: 230, y: 285 },
    },
    {
      id: 'bank',
      name: 'Bank',
      icon: (
        <img
          src="/images/icons/bank.png"
          alt="bank"
          style={{ width: 36, height: 36 }}
        />
      ),
      description: 'Deposits and investments',
      route: '/bank',
      comingSoon: true,
      mapPosition: { x: 175, y: 100 },
    },
    {
      id: 'loanshark',
      name: 'Loan Shark',
      icon: '💰',
      description: 'Quick cash with high interest',
      route: '/loanshark',
      comingSoon: true,
      mapPosition: { x: 125, y: 375 },
    },
    {
      id: 'blackmarket',
      name: 'Black Market',
      icon: '🎭',
      description: 'Illegal goods and services',
      route: '/blackmarket',
      comingSoon: true,
      mapPosition: { x: 50, y: 250 },
    },
    {
      id: 'casino',
      name: 'Casino',
      icon: (
        <img
          src="/images/icons/casino.png"
          alt="casino"
          style={{ width: 36, height: 36 }}
        />
      ),
      description: 'Test your luck',
      route: '/casino',
      comingSoon: false,
      mapPosition: { x: 342, y: 210 },
    },
    {
      id: 'nightclub',
      name: 'Nightclub',
      icon: '🍸',
      description: 'Socialize and network',
      route: '/nightclub',
      comingSoon: true,
      mapPosition: { x: 325, y: 275 },
    },
  ]

  const handleLocationClick = (location: CityLocation) => {
    if (location.comingSoon) {
      alert(`${location.name} - Coming Soon!`)
    } else {
      navigate(location.route)
    }
  }

  return (
    <div>
      <TravelingBlocker />
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '32px', margin: 0, color: '#ff4444' }}>
            Duskfall District
          </h1>
          <p style={{ color: '#888', marginTop: '0.5rem' }}>
            Explore the city and visit various locations
          </p>
        </div>

        {/* View Toggle */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            backgroundColor: '#0f0f0f',
            padding: '0.5rem',
            borderRadius: '8px',
            border: '1px solid #333',
          }}
        >
          <button
            onClick={() => setViewMode('map')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: viewMode === 'map' ? '#ff4444' : 'transparent',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'all 0.2s',
            }}
          >
            🗺️ Map View
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: viewMode === 'list' ? '#ff4444' : 'transparent',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'all 0.2s',
            }}
          >
            📋 List View
          </button>
        </div>
      </div>

      {/* Map View */}
      {viewMode === 'map' && (
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '500px',
            borderRadius: '12px',
            border: '2px solid #333',
            overflow: 'hidden',
            // Order matters: first backgrounds are painted on top.
            // We list the grid layers first so the red grid sits above the map image.
            backgroundImage: `
              linear-gradient(rgba(255, 68, 68, 0.14) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 68, 68, 0.14) 1px, transparent 1px),
              url('/images/map.png')
            `,
            backgroundSize: '50px 50px, 50px 50px, cover',
            backgroundPosition: 'center, center, center',
            backgroundRepeat: 'repeat, repeat, no-repeat',
            // Slightly dark overlay so pins and tooltips pop.
            backgroundBlendMode: 'normal, normal, multiply',
          }}
        >
          {/* Optional: keep placeholder hidden now map is present */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: '#333',
              fontSize: '24px',
              fontWeight: 'bold',
              pointerEvents: 'none',
              userSelect: 'none',
              opacity: 0,
            }}
          >
            MAP PLACEHOLDER
            <div
              style={{ fontSize: '14px', color: '#555', marginTop: '0.5rem' }}
            >
              Custom map design coming soon
            </div>
          </div>

          {/* Location Pins */}
          {locations.map(
            (location) =>
              location.mapPosition && (
                <MapPin
                  key={location.id}
                  location={location}
                  onClick={() => handleLocationClick(location)}
                />
              )
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {locations.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              onClick={() => handleLocationClick(location)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Map Pin Component
const MapPin = ({
  location,
  onClick,
}: {
  location: CityLocation
  onClick: () => void
}) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'absolute',
        left: `${location.mapPosition!.x}px`,
        top: `${location.mapPosition!.y}px`,
        transform: 'translate(-50%, -50%)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        zIndex: isHovered ? 30 : 10,
      }}
    >
      {/* Pin Icon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: isHovered ? 56 : 44,
          height: isHovered ? 56 : 44,
          borderRadius: 9999,
          background: location.comingSoon
            ? 'rgba(100,100,100,0.18)'
            : 'rgba(255,68,68,0.14)',
          fontSize: isHovered ? '36px' : '28px',
          transition: 'all 0.15s',
          filter: location.comingSoon ? 'grayscale(100%) opacity(0.6)' : 'none',
          textShadow: '0 2px 8px rgba(0,0,0,0.6)',
        }}
      >
        {location.icon}
      </div>

      {/* Tooltip on Hover */}
      {isHovered && (
        <div
          style={{
            position: 'absolute',
            top: '110%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '0.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#0f0f0f',
            border: '2px solid #ff4444',
            borderRadius: '8px',
            whiteSpace: 'nowrap',
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            zIndex: 40,
          }}
        >
          <div
            style={{
              fontWeight: 'bold',
              color: '#fff',
              marginBottom: '0.25rem',
            }}
          >
            {location.name}
          </div>
          <div style={{ fontSize: '12px', color: '#888' }}>
            {location.description}
          </div>
          {location.comingSoon && (
            <div
              style={{
                fontSize: '11px',
                color: '#FFC107',
                marginTop: '0.25rem',
                fontWeight: 'bold',
              }}
            >
              Coming Soon
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Location Card Component
const LocationCard = ({
  location,
  onClick,
}: {
  location: CityLocation
  onClick: () => void
}) => {
  return (
    <button
      onClick={onClick}
      disabled={location.comingSoon}
      style={{
        padding: '1.5rem',
        backgroundColor: '#0f0f0f',
        border: location.comingSoon ? '1px solid #333' : '2px solid #ff4444',
        borderRadius: '8px',
        cursor: location.comingSoon ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        textAlign: 'left',
        opacity: location.comingSoon ? 0.6 : 1,
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        if (!location.comingSoon) {
          e.currentTarget.style.backgroundColor = '#1a1a1a'
          e.currentTarget.style.transform = 'translateY(-4px)'
        }
      }}
      onMouseLeave={(e) => {
        if (!location.comingSoon) {
          e.currentTarget.style.backgroundColor = '#0f0f0f'
          e.currentTarget.style.transform = 'translateY(0)'
        }
      }}
    >
      {location.comingSoon && (
        <div
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            padding: '0.25rem 0.75rem',
            backgroundColor: '#FFC107',
            color: '#000',
            fontSize: '11px',
            fontWeight: 'bold',
            borderRadius: '12px',
          }}
        >
          COMING SOON
        </div>
      )}
      <div style={{ fontSize: '48px', marginBottom: '1rem' }}>
        {location.icon}
      </div>
      <div
        style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#fff',
          marginBottom: '0.5rem',
        }}
      >
        {location.name}
      </div>
      <div style={{ fontSize: '14px', color: '#888' }}>
        {location.description}
      </div>
    </button>
  )
}

export default City
