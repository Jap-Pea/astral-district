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
      profilePic: result.profilePic || '/images/default-avatar.png',
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
      hasSeenWelcome: false,

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

  // User exists but hasn't seen welcome
  if (!user.hasSeenWelcome) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
      >
        <div
          style={{
            maxWidth: '600px',
            padding: '3rem',
            background: 'rgba(10, 37, 64, 0.9)',
            border: '2px solid #1e4d7a',
            borderRadius: '1rem',
            textAlign: 'center',
            color: '#6ba3bf',
          }}
        >
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌌</div>
          <h1
            style={{
              fontSize: '2.5rem',
              marginBottom: '1rem',
              color: '#4a9eff',
              textShadow: '0 0 20px rgba(74, 158, 255, 0.5)',
            }}
          >
            Welcome to Astral District!
          </h1>
          <p
            style={{
              fontSize: '1.2rem',
              marginBottom: '2rem',
              lineHeight: '1.6',
            }}
          >
            Welcome, <strong>{user.username}</strong>! Your journey begins now.
          </p>
          <div
            style={{
              textAlign: 'left',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              marginBottom: '2rem',
            }}
          >
            <h3 style={{ marginBottom: '1rem', color: '#4a9eff' }}>
              You've received:
            </h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>
                💰 ${user.money?.toLocaleString()} starting money
              </li>
              <li style={{ marginBottom: '0.5rem' }}>❤️ {user.maxHealth} HP</li>
              <li style={{ marginBottom: '0.5rem' }}>
                ⚡ {user.maxEnergy} Energy
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                🎒 {STARTER_ITEMS.length} starter items
              </li>
              <li style={{ marginBottom: '0.5rem' }}>🚀 Your first ship</li>
            </ul>
          </div>
          <button
            onClick={() => updateUser({ hasSeenWelcome: true })}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow =
                '0 6px 30px rgba(139, 92, 246, 0.6)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow =
                '0 4px 20px rgba(139, 92, 246, 0.4)'
            }}
          >
            Begin Your Journey 🚀
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
                padding: 0,
                marginBottom: '2rem',
                textAlign: 'left',
                background: 'rgba(239, 68, 68, 0.1)',
                padding: '1rem',
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
      {process.env.NODE_ENV === 'development' && (
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
