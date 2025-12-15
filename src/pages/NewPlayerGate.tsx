import React, { useState, useContext, useEffect } from 'react'
import NewPlayerSetup from './NewPlayerSetup'
import type { NewPlayerResult } from './NewPlayerSetup'
import { useUser } from '../hooks/useUser'
import { SelfDestructButton } from '../components/SelfDestructButton'
import { MessageContext } from '../context/messageCore'

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
  const messageContext = useContext(MessageContext)
  const [showWelcomeHelper, setShowWelcomeHelper] = useState(false)
  const [showShipyardHelper, setShowShipyardHelper] = useState(false)

  // Hide helper when all messages are read
  useEffect(() => {
    if (
      showWelcomeHelper &&
      messageContext &&
      messageContext.unreadCount === 0
    ) {
      const timer = setTimeout(() => setShowWelcomeHelper(false), 100)
      return () => clearTimeout(timer)
    }
  }, [showWelcomeHelper, messageContext])

  // Show shipyard helper after welcome message is read
  useEffect(() => {
    if (
      showWelcomeHelper &&
      messageContext &&
      messageContext.unreadCount === 0 &&
      user &&
      !user.ship
    ) {
      // Wait a moment after message is read, then show shipyard helper
      const timer = setTimeout(() => {
        setShowWelcomeHelper(false)
        setShowShipyardHelper(true)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [showWelcomeHelper, messageContext, user])

  // Toggle body class to block interactions when helper is active
  useEffect(() => {
    if (
      (showWelcomeHelper && messageContext && messageContext.unreadCount > 0) ||
      (showShipyardHelper && user && !user.ship)
    ) {
      document.body.classList.add('helper-active')
    } else {
      document.body.classList.remove('helper-active')
    }
    return () => document.body.classList.remove('helper-active')
  }, [showWelcomeHelper, showShipyardHelper, messageContext, user])

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

      ship: undefined,

      activeMissions: [],
      completedMissions: [],
      activeTravel: null,

      isInJail: false,
      jailTime: 0,
      isInHospital: false,
      hospitalTime: 0,

      // Docking state - new players start docked at Earth
      isDocked: true,
      dockingLocation: 'earth',
      isDocking: false,
      dockingTimeRemaining: 0,

      lastAction: new Date(),
      lastEnergyRegen: new Date(),
      lastHealthRegen: new Date(),
      createdAt: new Date(),

      tutorialCompleted: false,
      hasReadWelcomeMessage: false,

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

    // Add welcome message from District Commander
    setTimeout(() => {
      messageContext?.addMessage({
        from: 'District Commander',
        subject: 'Welcome to the Astral District',
        message: `Welcome, ${result.username}. Your neural interface is now online. The Astral District is a place of opportunity... and danger.\n\n💰 Starting Credits: $5,000\n❤️ Health: ${result.perks.maxHealth}\n⚡ Energy: 100\n📦 2 Starter Items added to inventory\n\nYour first task: Visit the Shipyard to claim your vessel. Every pilot needs a ship to navigate the stars.\n\n"In the District, opportunity and danger walk hand in hand. Choose your path wisely."`,
        isSystemMessage: true,
      })
      setShowWelcomeHelper(true)
    }, 500)

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

  // User is fully set up - show the app with welcome helper if needed
  return (
    <>
      {children}

      {/* Welcome Helper - small tooltip pointing to messages */}
      {showWelcomeHelper &&
        messageContext &&
        messageContext.unreadCount > 0 && (
          <>
            {/* Block all pointer events except Messages button and modal contents */}
            <style>{`
              body.helper-active * {
                pointer-events: none !important;
              }
              body.helper-active button[data-messages-button],
              body.helper-active button[data-messages-button] *,
              body.helper-active [style*="z-index: 9998"],
              body.helper-active [style*="z-index: 9998"] *,
              body.helper-active [style*="z-index: 9999"],
              body.helper-active [style*="z-index: 9999"] * {
                pointer-events: auto !important;
              }
            `}</style>

            <div
              style={{
                position: 'fixed',
                top: '300px',
                left: '320px',
                zIndex: 10001,
                animation:
                  'fadeIn 0.5s ease-out, bounce 2s ease-in-out infinite',
                pointerEvents: 'none',
              }}
            >
              <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-8px); }
            }
          `}</style>
              <div
                style={{
                  background:
                    'linear-gradient(135deg, rgba(74, 158, 255, 0.95), rgba(30, 77, 122, 0.95))',
                  border: '2px solid #4a9eff',
                  borderRadius: '12px',
                  padding: '1rem 1.5rem',
                  boxShadow: '0 8px 30px rgba(74, 158, 255, 0.5)',
                  maxWidth: '280px',
                  position: 'relative',
                }}
              >
                {/* Arrow pointing up to Messages button */}
                <div
                  style={{
                    position: 'absolute',
                    left: '30px',
                    top: '-10px',
                    width: 0,
                    height: 0,
                    borderLeft: '10px solid transparent',
                    borderRight: '10px solid transparent',
                    borderBottom: '10px solid #4a9eff',
                  }}
                />
                <div
                  style={{
                    fontSize: '1.5rem',
                    marginBottom: '0.5rem',
                    textAlign: 'center',
                  }}
                >
                  📬
                </div>
                <div
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: '#fff',
                    marginBottom: '0.5rem',
                    textAlign: 'center',
                  }}
                >
                  You Have a Message!
                </div>
                <div
                  style={{
                    fontSize: '0.9rem',
                    color: '#e0f2fe',
                    lineHeight: '1.4',
                    textAlign: 'center',
                  }}
                >
                  The District Commander has sent you an important message.
                  <br />
                  <strong>Click the Messages button to read it.</strong>
                </div>
              </div>
            </div>
          </>
        )}

      {/* Shipyard Helper - guide to claim ship */}
      {showShipyardHelper && user && !user.ship && (
        <>
          {/* Block all pointer events except Shipyard button and claim ship button */}
          <style>{`
            body.helper-active * {
              pointer-events: none !important;
            }
            body.helper-active button[data-shipyard-button],
            body.helper-active button[data-shipyard-button] *,
            body.helper-active button[data-claim-ship-button],
            body.helper-active button[data-claim-ship-button] * {
              pointer-events: auto !important;
            }
          `}</style>

          <div
            style={{
              position: 'fixed',
              top: '250px',
              right: '50%',
              transform: 'translateX(50%)',
              zIndex: 10001,
              animation: 'fadeIn 0.5s ease-out, bounce 2s ease-in-out infinite',
              pointerEvents: 'none',
            }}
          >
            <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
        `}</style>
            <div
              style={{
                background:
                  'linear-gradient(135deg, rgba(147, 51, 234, 0.95), rgba(79, 70, 229, 0.95))',
                border: '2px solid #a855f7',
                borderRadius: '12px',
                padding: '1.5rem 2rem',
                boxShadow: '0 8px 30px rgba(147, 51, 234, 0.5)',
                maxWidth: '320px',
                position: 'relative',
              }}
            >
              {/* Arrow pointing up */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '-10px',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '10px solid transparent',
                  borderRight: '10px solid transparent',
                  borderBottom: '10px solid #a855f7',
                }}
              />
              <div
                style={{
                  fontSize: '2rem',
                  marginBottom: '0.75rem',
                  textAlign: 'center',
                }}
              >
                🚀
              </div>
              <div
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: '#fff',
                  marginBottom: '0.5rem',
                  textAlign: 'center',
                }}
              >
                Claim Your Ship
              </div>
              <div
                style={{
                  fontSize: '0.95rem',
                  color: '#e9d5ff',
                  lineHeight: '1.5',
                  textAlign: 'center',
                }}
              >
                Every pilot needs a vessel. Click the <strong>Shipyard</strong>{' '}
                button above to claim your starter ship.
              </div>
            </div>
          </div>
        </>
      )}

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
    </>
  )
}
