import React, { useState } from 'react'
import NewPlayerSetup from './NewPlayerSetup'
import type { NewPlayerResult } from './NewPlayerSetup'
import { useUser } from '../hooks/useUser'

// Welcome bonus items that new players receive
const STARTER_ITEMS = [
  {
    item: {
      id: 'starter_health_pack',
      name: 'Health Pack',
      description: 'Restores 50 HP',
      type: 'consumable' as const,
      rarity: 'common' as const,
      value: 100,
      effects: { health: 50 },
    },
    quantity: 3,
    acquiredAt: new Date(),
  },
  {
    item: {
      id: 'starter_energy_drink',
      name: 'Energy Drink',
      description: 'Restores 25 Energy',
      type: 'consumable' as const,
      rarity: 'common' as const,
      value: 50,
      effects: { energy: 25 },
    },
    quantity: 2,
    acquiredAt: new Date(),
  },
]

const calculateStartingMoney = (result: NewPlayerResult): number => {
  let baseMoney = 5000
  if (result.perks.startingMoney) {
    baseMoney += result.perks.startingMoney
  }
  return baseMoney
}

const calculateStartingStats = (result: NewPlayerResult) => {
  return {
    strength: result.perks.strength || 1,
    defense: result.perks.defense || 1,
    speed: result.perks.speed || 1,
    dexterity: result.perks.dexterity || 1,
  }
}

const generatePlayerId = (): string => {
  return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const calculateExperienceToNext = (level: number): number => {
  return 1000 + (level - 1) * 500
}

export default function NewPlayerGate({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, updateUser } = useUser()
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showFinalScreen, setShowFinalScreen] = useState(false)

  const handleResetGame = () => {
    // Clear localStorage
    localStorage.removeItem('astralUser')
    localStorage.removeItem('suss-life_v1_state')

    // Clear any other game-related storage
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes('astral') || key.includes('suss'))) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key))

    // Reload page to start fresh
    window.location.reload()
  }

  const handleSetupComplete = (result: NewPlayerResult) => {
    const startingStats = calculateStartingStats(result)
    const startingMoney = calculateStartingMoney(result)
    const playerId = generatePlayerId()

    updateUser({
      id: playerId,
      username: result.username,
      race: result.race,
      gender: result.gender,
      profilePic:
        result.profilePic ||
        (result.gender === 'male'
          ? 'https://placehold.co/240x240?text=Male'
          : 'https://placehold.co/240x240?text=Female'),
      profilePicOffset: { x: 0, y: 0 },

      level: 1,
      experience: 0,
      experienceToNext: calculateExperienceToNext(1),
      points: 5,

      stats: startingStats,

      health: result.perks.maxHealth || 100,
      maxHealth: result.perks.maxHealth || 100,
      energy: result.perks.maxEnergy || 100,
      maxEnergy: result.perks.maxEnergy || 100,
      heartRate: 50,
      maxHeartRate: 140,
      heat: 0,
      maxHeat: 100,

      money: startingMoney,
      bankMoney: 0,

      age: 18,
      rank: 'Beginner',
      location: 'earth',

      trainingCount: 0,
      crimesCount: 0,

      crimesTally: {
        total: 0,
        success: 0,
        failed: 0,
        critical: 0,
      },
      combatTally: {
        attacks: 0,
        defends: 0,
        kills: 0,
        deaths: 0,
        escapes: 0,
      },

      inventory: [...STARTER_ITEMS],
      equippedWeapon: null,
      equippedArmor: null,

      ship: {
        id: 'starter_pod',
        name: 'Starter Pod',
        tier: 'basic',
        modelPath: '/models/starter-ship.glb',
        price: 0,
        hull: 50,
        maxHull: 50,
        shields: 25,
        maxShields: 25,
        cargoCapacity: 5,
        cargo: [],
        fuelTypes: ['ion'],
        travelTimeReduction: 0,
        description: 'A basic starter vessel. Better than nothing!',
      },

      activeMissions: [],
      completedMissions: [],
      activeTravel: null,

      isInJail: false,
      jailTime: 0,
      isInHospital: false,
      hospitalTime: 0,

      lastAction: new Date(),
      lastEnergyRegen: new Date(),
      lastHealthRegen: new Date(),
      createdAt: new Date(),

      tutorialCompleted: false,

      perks: result.perks,

      friends: [],
      blockedUsers: [],
      achievements: [],

      settings: {
        notifications: true,
        sound: true,
        theme: 'dark',
      },
    })

    // Show final screen after character creation
    setShowFinalScreen(true)

    console.log(`🎉 New player created: ${result.username} (${playerId})`)
  }

  // Show loading state
  if (user === undefined) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0a2540 0%, #061829 100%)',
          color: '#6ba3bf',
          fontSize: '1.5rem',
          fontWeight: 'bold',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              animation: 'pulse 1.5s ease-in-out infinite',
              marginBottom: '1rem',
              fontSize: '3rem',
            }}
          >
            🚀
          </div>
          Loading Astral District...
        </div>
      </div>
    )
  }

  // No user - show character creation
  if (!user) {
    return <NewPlayerSetup onComplete={handleSetupComplete} />
  }

  // Final screen after character creation
  if (showFinalScreen && user) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.8s ease-out',
        }}
      >
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        <div
          style={{
            maxWidth: '700px',
            padding: '3rem',
            background:
              'linear-gradient(135deg, rgba(10, 37, 64, 0.95), rgba(6, 24, 41, 0.95))',
            border: '2px solid #1e4d7a',
            borderRadius: '1rem',
            textAlign: 'center',
            color: '#6ba3bf',
            animation: 'slideUp 0.8s ease-out',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)',
          }}
        >
          <div
            style={{
              fontSize: '5rem',
              marginBottom: '1.5rem',
              filter: 'drop-shadow(0 0 20px rgba(74, 158, 255, 0.5))',
            }}
          >
            🌌
          </div>
          <h1
            style={{
              fontSize: '3rem',
              marginBottom: '1rem',
              color: '#4a9eff',
              textShadow: '0 0 30px rgba(74, 158, 255, 0.6)',
              fontWeight: 'bold',
            }}
          >
            Welcome to the District
          </h1>
          <p
            style={{
              fontSize: '1.4rem',
              marginBottom: '2.5rem',
              lineHeight: '1.6',
              color: '#8ab4cf',
            }}
          >
            <strong style={{ color: '#4a9eff' }}>{user.username}</strong>, your
            neural interface is now online.
            <br />
            The Astral District awaits.
          </p>
          <div
            style={{
              textAlign: 'left',
              background: 'rgba(74, 158, 255, 0.08)',
              padding: '2rem',
              borderRadius: '0.75rem',
              marginBottom: '2.5rem',
              border: '1px solid rgba(74, 158, 255, 0.2)',
            }}
          >
            <h3
              style={{
                marginBottom: '1.5rem',
                color: '#4a9eff',
                fontSize: '1.3rem',
                textAlign: 'center',
              }}
            >
              ⚡ Initial Loadout
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '0.5rem',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                  💰
                </div>
                <div
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#4a9eff',
                  }}
                >
                  ${user.money?.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Credits</div>
              </div>
              <div
                style={{
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '0.5rem',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                  ❤️
                </div>
                <div
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#ef4444',
                  }}
                >
                  {user.maxHealth}
                </div>
                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                  Health Points
                </div>
              </div>
              <div
                style={{
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '0.5rem',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                  ⚡
                </div>
                <div
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#fbbf24',
                  }}
                >
                  {user.maxEnergy}
                </div>
                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Energy</div>
              </div>
              <div
                style={{
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '0.5rem',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                  🚀
                </div>
                <div
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#8b5cf6',
                  }}
                >
                  Starter Pod
                </div>
                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Ship</div>
              </div>
            </div>
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(34, 197, 94, 0.1)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(34, 197, 94, 0.3)',
              }}
            >
              <div style={{ fontSize: '0.95rem', color: '#6ba3bf' }}>
                🎒 <strong>{STARTER_ITEMS.length} Starter Items</strong> added
                to inventory
              </div>
            </div>
          </div>
          <div
            style={{
              marginBottom: '2rem',
              fontSize: '1rem',
              lineHeight: '1.6',
              color: '#6ba3bf',
              fontStyle: 'italic',
              opacity: 0.9,
            }}
          >
            "In the District, opportunity and danger walk hand in hand. Choose
            your path wisely."
          </div>
          <button
            onClick={() => setShowFinalScreen(false)}
            style={{
              padding: '1.25rem 3rem',
              fontSize: '1.3rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              border: 'none',
              borderRadius: '0.75rem',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 8px 30px rgba(34, 197, 94, 0.4)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
              e.currentTarget.style.boxShadow =
                '0 12px 40px rgba(34, 197, 94, 0.6)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow =
                '0 8px 30px rgba(34, 197, 94, 0.4)'
            }}
          >
            Enter The District →
          </button>
        </div>
      </div>
    )
  }

  // User is fully set up - show the app with reset option
  return (
    <>
      {children}

      {/* Reset Game Confirmation Modal */}
      {showResetConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
          }}
        >
          <div
            style={{
              maxWidth: '500px',
              padding: '2rem',
              background: 'rgba(10, 37, 64, 0.95)',
              border: '2px solid #ef4444',
              borderRadius: '1rem',
              textAlign: 'center',
              color: '#6ba3bf',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h2
              style={{
                fontSize: '1.8rem',
                marginBottom: '1rem',
                color: '#ef4444',
              }}
            >
              Reset Game Data?
            </h2>
            <p style={{ marginBottom: '2rem', lineHeight: '1.6' }}>
              This will <strong>permanently delete</strong> all your progress,
              including:
            </p>
            <ul
              style={{
                listStyle: 'none',
                padding: '1rem',
                marginBottom: '2rem',
                textAlign: 'left',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '0.5rem',
              }}
            >
              <li>❌ Character: {user.username}</li>
              <li>❌ Level {user.level} progress</li>
              <li>❌ ${user.money?.toLocaleString()} money</li>
              <li>❌ All inventory & items</li>
              <li>❌ All achievements</li>
            </ul>
            <div
              style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}
            >
              <button
                onClick={handleResetGame}
                style={{
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#dc2626'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#ef4444'
                }}
              >
                Yes, Reset Everything
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Reset Button (bottom right corner) - Only in development */}
      {import.meta.env.DEV && (
        <button
          onClick={() => setShowResetConfirm(true)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '0.75rem',
            background: '#ef4444',
            border: 'none',
            borderRadius: '50%',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1.5rem',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)',
            zIndex: 9999,
            transition: 'all 0.3s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.style.boxShadow =
              '0 6px 30px rgba(239, 68, 68, 0.6)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow =
              '0 4px 20px rgba(239, 68, 68, 0.4)'
          }}
          title="Reset Game Data"
        >
          🗑️
        </button>
      )}
    </>
  )
}
