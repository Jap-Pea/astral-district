// src/pages/Jail.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useUser'
import { useEnergy } from '../hooks/useEnergy'
import { useHeartRate } from '../hooks/useHeartRate'
import TravelingBlocker from '../components/TravelingBlocker'

interface JailedPlayer {
  id: string
  name: string
  level: number
  timeRemaining: number // in seconds
  crime: string
}

// Placeholder jailed players
const PLACEHOLDER_PLAYERS: JailedPlayer[] = [
  {
    id: '1',
    name: 'ShadowThief',
    level: 12,
    timeRemaining: 420,
    crime: 'Grand Theft Auto',
  },
  {
    id: '2',
    name: 'QuickHands',
    level: 8,
    timeRemaining: 180,
    crime: 'Pickpocketing',
  },
  {
    id: '3',
    name: 'TheBoss',
    level: 25,
    timeRemaining: 900,
    crime: 'Bank Robbery',
  },
  {
    id: '4',
    name: 'Rookie',
    level: 3,
    timeRemaining: 120,
    crime: 'Shoplifting',
  },
  {
    id: '5',
    name: 'Mastermind',
    level: 18,
    timeRemaining: 600,
    crime: 'Heist',
  },
]

const Jail = () => {
  const navigate = useNavigate()
  const {
    user,
    isInJail,
    jailTimeRemaining,
    attemptJailEscape,
    payBail,
    sendToJail,
    increaseHeat,
    spendMoney,
  } = useUser()
  const { consumeEnergy } = useEnergy()
  const { increaseHeartRate } = useHeartRate()

  const [escapeResult, setEscapeResult] = useState<string | null>(null)
  const [isAttempting, setIsAttempting] = useState(false)
  const [jailedPlayers, setJailedPlayers] =
    useState<JailedPlayer[]>(PLACEHOLDER_PLAYERS)
  const [helpingPlayerId, setHelpingPlayerId] = useState<string | null>(null)

  // Update jailed players' timers
  useEffect(() => {
    const interval = setInterval(() => {
      setJailedPlayers((prev) =>
        prev
          .map((p) => ({
            ...p,
            timeRemaining: Math.max(0, p.timeRemaining - 1),
          }))
          .filter((p) => p.timeRemaining > 0)
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  if (!user) return null

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const calculateSuccessRate = (timeRemaining: number): number => {
    // Base success rate: 70% for 2 min sentence, decreases as time increases
    // Formula: 70% - (minutes * 3%)
    const minutes = Math.ceil(timeRemaining / 60)
    const rate = Math.max(10, 70 - minutes * 3)
    return rate
  }

  // ========== SELF ESCAPE (when YOU'RE in jail) ==========
  const handleSelfEscape = () => {
    if (user.heartRate < 30) {
      alert('Not enough Heart Rate! You need 30 BPM to attempt an escape.')
      return
    }

    setIsAttempting(true)
    setEscapeResult(null)

    setTimeout(() => {
      const success = attemptJailEscape()

      if (success) {
        setEscapeResult('🎉 SUCCESS! You escaped from jail!')
        setTimeout(() => {
          navigate('/')
        }, 2000)
      } else {
        setEscapeResult(
          '❌ FAILED! Guards caught you. +10 minutes added to your sentence.'
        )
      }
      setIsAttempting(false)
    }, 1500)
  }

  const handleSelfBail = () => {
    const bailAmount = Math.floor(50000 + user.heat * 1000)

    if (user.money < bailAmount) {
      alert(
        `You don't have enough money! Bail costs $${bailAmount.toLocaleString()}`
      )
      return
    }

    const confirmed = window.confirm(
      `Pay $${bailAmount.toLocaleString()} for bail?`
    )
    if (confirmed) {
      if (payBail(bailAmount)) {
        alert("✅ Bail paid! You're free to go.")
        navigate('/')
      }
    }
  }

  // ========== HELP OTHER PLAYERS ESCAPE ==========
  const handleHelpEscape = (player: JailedPlayer) => {
    if (user.energy < 12) {
      alert('Not enough energy! You need 12 energy to help someone escape.')
      return
    }

    const successRate = calculateSuccessRate(player.timeRemaining)
    const confirmed = window.confirm(
      `Help ${player.name} escape?\n\n` +
        `• Costs: 12 Energy\n` +
        `• Success Rate: ${successRate}%\n` +
        `• On success: +25 Heat (both)\n` +
        `• On failure: You go to jail too!\n\n` +
        `Are you sure?`
    )

    if (!confirmed) return

    // Deduct energy
    if (!consumeEnergy(12)) {
      alert('Failed to consume energy!')
      return
    }

    setHelpingPlayerId(player.id)
    setEscapeResult(null)

    setTimeout(() => {
      const roll = Math.random() * 100
      const success = roll < successRate

      if (success) {
        // SUCCESS: Remove player from jail, add heat to both
        setJailedPlayers((prev) => prev.filter((p) => p.id !== player.id))
        increaseHeat(25)
        increaseHeartRate(15) // Helper gets adrenaline rush
        setEscapeResult(
          `🎉 SUCCESS! ${player.name} escaped! You both gained +25 Heat.`
        )
      } else {
        // FAILURE: Helper goes to jail
        const jailDuration = 5 // 5 minutes
        increaseHeat(10)
        setEscapeResult(
          `❌ FAILED! You got caught helping ${player.name}. You're going to jail for ${jailDuration} minutes!`
        )
        // Wait for the message to show, then send to jail
        setTimeout(() => {
          sendToJail(jailDuration)
        }, 2500)
      }

      setHelpingPlayerId(null)
    }, 1500)
  }

  // ========== BAIL OUT OTHER PLAYERS ==========
  const handleBailOut = (player: JailedPlayer) => {
    const minutes = Math.ceil(player.timeRemaining / 60)
    const bailCost = minutes * 1000

    if (user.money < bailCost) {
      alert(
        `You don't have enough money! Bail costs $${bailCost.toLocaleString()}`
      )
      return
    }

    const confirmed = window.confirm(
      `Bail out ${player.name}?\n\n` +
        `• Time remaining: ${minutes} min\n` +
        `• Bail cost: $${bailCost.toLocaleString()}\n\n` +
        `Are you sure?`
    )

    if (!confirmed) return

    if (spendMoney(bailCost)) {
      setJailedPlayers((prev) => prev.filter((p) => p.id !== player.id))
      alert(`✅ ${player.name} has been bailed out!`)
    }
  }

  // ========== VIEW WHEN YOU'RE IN JAIL ==========
  if (isInJail) {
    const bailAmount = Math.floor(50000 + user.heat * 1000)

    return (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div
          style={{
            backgroundColor: '#1a1a1a',
            border: '3px solid #666',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '64px', marginBottom: '1rem' }}>🚔</div>
          <h1
            style={{
              fontSize: '36px',
              color: '#ff4444',
              marginBottom: '0.5rem',
            }}
          >
            YOU'RE IN JAIL
          </h1>
          <p style={{ color: '#888', marginBottom: '2rem' }}>
            You got caught. Time to think about your choices.
          </p>

          {/* Timer */}
          <div
            style={{
              backgroundColor: '#0f0f0f',
              padding: '2rem',
              borderRadius: '8px',
              marginBottom: '2rem',
              border: '2px solid #333',
            }}
          >
            <div
              style={{
                color: '#888',
                fontSize: '14px',
                marginBottom: '0.5rem',
              }}
            >
              TIME REMAINING
            </div>
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#ff4444',
                fontFamily: 'monospace',
              }}
            >
              {formatTime(jailTimeRemaining)}
            </div>
            <div
              style={{ color: '#666', fontSize: '12px', marginTop: '0.5rem' }}
            >
              ({Math.ceil(jailTimeRemaining / 60)} minutes)
            </div>
          </div>

          {/* Escape Result */}
          {escapeResult && (
            <div
              style={{
                backgroundColor: escapeResult.includes('SUCCESS')
                  ? '#1b5e20'
                  : '#b71c1c',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '2rem',
                border: `2px solid ${
                  escapeResult.includes('SUCCESS') ? '#4CAF50' : '#f44336'
                }`,
              }}
            >
              {escapeResult}
            </div>
          )}

          {/* Loading */}
          {isAttempting && (
            <div
              style={{
                backgroundColor: '#0f0f0f',
                padding: '1.5rem',
                borderRadius: '8px',
                marginBottom: '2rem',
                border: '2px solid #ff4444',
              }}
            >
              <div style={{ fontSize: '18px', marginBottom: '0.5rem' }}>
                Attempting escape...
              </div>
              <div style={{ color: '#888' }}>⏳ This is risky...</div>
            </div>
          )}

          {/* Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '1rem',
              marginBottom: '2rem',
              padding: '1rem',
              backgroundColor: '#0f0f0f',
              borderRadius: '8px',
            }}
          >
            <div>
              <div style={{ fontSize: '12px', color: '#888' }}>Heart Rate</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                {user.heartRate}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#888' }}>Heat</div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#ff4444',
                }}
              >
                {user.heat}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#888' }}>Money</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                ${user.money.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Options */}
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <button
              onClick={handleSelfEscape}
              disabled={isAttempting || user.heartRate < 30}
              style={{
                padding: '1rem',
                fontSize: '16px',
                fontWeight: 'bold',
                backgroundColor: user.heartRate >= 30 ? '#FF9800' : '#555',
                color: user.heartRate >= 30 ? '#fff' : '#888',
                border: 'none',
                borderRadius: '8px',
                cursor:
                  user.heartRate >= 30 && !isAttempting
                    ? 'pointer'
                    : 'not-allowed',
                transition: 'all 0.2s',
              }}
            >
              {user.heartRate < 30
                ? '🔒 Need 30 HR to Escape'
                : '🏃 Attempt Escape (40% chance, costs 30 HR, +25 Heat)'}
            </button>

            <button
              onClick={handleSelfBail}
              disabled={user.money < bailAmount}
              style={{
                padding: '1rem',
                fontSize: '16px',
                fontWeight: 'bold',
                backgroundColor: user.money >= bailAmount ? '#4CAF50' : '#555',
                color: user.money >= bailAmount ? '#fff' : '#888',
                border: 'none',
                borderRadius: '8px',
                cursor: user.money >= bailAmount ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
              }}
            >
              {user.money < bailAmount
                ? `🔒 Can't Afford Bail ($${bailAmount.toLocaleString()})`
                : `💰 Pay Bail ($${bailAmount.toLocaleString()})`}
            </button>

            <div
              style={{
                padding: '1rem',
                backgroundColor: '#0f0f0f',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#888',
              }}
            >
              ⏰ Or just wait it out... You'll be released automatically.
            </div>
          </div>

          {/* Info */}
          <div
            style={{
              marginTop: '2rem',
              padding: '1rem',
              backgroundColor: 'rgba(255, 68, 68, 0.1)',
              borderRadius: '8px',
              border: '1px solid #ff4444',
            }}
          >
            <div style={{ fontSize: '14px', color: '#aaa', lineHeight: '1.6' }}>
              <strong style={{ color: '#ff4444' }}>While in jail:</strong>
              <br />
              • Your Heat is reset to 0<br />
              • Heart Rate slowly recovers
              <br />
              • Failed escape adds 10 minutes
              <br />• Friends can bail you out
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ========== VIEW WHEN VISITING JAIL ==========
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <TravelingBlocker />
      <div
        style={{
          backgroundColor: '#1a1a1a',
          border: '3px solid #666',
          borderRadius: '12px',
          padding: '2rem',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '64px', marginBottom: '1rem' }}>🚔</div>
          <h1
            style={{
              fontSize: '36px',
              color: '#ff8800',
              marginBottom: '0.5rem',
            }}
          >
            CITY JAIL
          </h1>
          <p style={{ color: '#888' }}>
            Help your fellow criminals escape... or leave them to rot.
          </p>
        </div>

        {/* Your Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1rem',
            marginBottom: '2rem',
            padding: '1rem',
            backgroundColor: '#0f0f0f',
            borderRadius: '8px',
            border: '2px solid #333',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', color: '#888' }}>Energy</div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: user.energy >= 12 ? '#4CAF50' : '#888',
              }}
            >
              {user.energy}/{user.maxEnergy}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#888' }}>Money</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
              ${user.money.toLocaleString()}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#888' }}>Heat</div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#ff4444',
              }}
            >
              {user.heat}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#888' }}>Heart Rate</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {user.heartRate}
            </div>
          </div>
        </div>

        {/* Result Message */}
        {escapeResult && (
          <div
            style={{
              backgroundColor: escapeResult.includes('SUCCESS')
                ? '#1b5e20'
                : '#b71c1c',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '2rem',
              border: `2px solid ${
                escapeResult.includes('SUCCESS') ? '#4CAF50' : '#f44336'
              }`,
              textAlign: 'center',
            }}
          >
            {escapeResult}
          </div>
        )}

        {/* Jailed Players List */}
        <div>
          <h2
            style={{
              fontSize: '24px',
              marginBottom: '1rem',
              color: '#fff',
            }}
          >
            Inmates ({jailedPlayers.length})
          </h2>

          {jailedPlayers.length === 0 ? (
            <div
              style={{
                padding: '2rem',
                textAlign: 'center',
                backgroundColor: '#0f0f0f',
                borderRadius: '8px',
                color: '#888',
              }}
            >
              🎉 No one in jail right now! Everyone's free!
            </div>
          ) : (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              {jailedPlayers.map((player) => {
                const minutes = Math.ceil(player.timeRemaining / 60)
                const bailCost = minutes * 1000
                const successRate = calculateSuccessRate(player.timeRemaining)
                const isHelping = helpingPlayerId === player.id

                return (
                  <div
                    key={player.id}
                    style={{
                      backgroundColor: '#0f0f0f',
                      border: '2px solid #333',
                      borderRadius: '8px',
                      padding: '1.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      opacity: isHelping ? 0.6 : 1,
                    }}
                  >
                    {/* Player Info */}
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '20px',
                          fontWeight: 'bold',
                          marginBottom: '0.5rem',
                        }}
                      >
                        {player.name}
                        <span
                          style={{
                            marginLeft: '0.5rem',
                            fontSize: '14px',
                            color: '#888',
                          }}
                        >
                          Lv.{player.level}
                        </span>
                      </div>
                      <div style={{ fontSize: '14px', color: '#888' }}>
                        Crime: {player.crime}
                      </div>
                      <div
                        style={{
                          fontSize: '18px',
                          color: '#ff4444',
                          marginTop: '0.5rem',
                          fontFamily: 'monospace',
                        }}
                      >
                        ⏱ {formatTime(player.timeRemaining)} remaining
                      </div>
                    </div>

                    {/* Actions */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        minWidth: '200px',
                      }}
                    >
                      {/* Help Escape Button */}
                      <button
                        onClick={() => handleHelpEscape(player)}
                        disabled={user.energy < 12 || isHelping}
                        style={{
                          padding: '0.75rem',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          backgroundColor:
                            user.energy >= 12 ? '#FF9800' : '#555',
                          color: user.energy >= 12 ? '#fff' : '#888',
                          border: 'none',
                          borderRadius: '6px',
                          cursor:
                            user.energy >= 12 && !isHelping
                              ? 'pointer'
                              : 'not-allowed',
                          transition: 'all 0.2s',
                        }}
                      >
                        {user.energy < 12
                          ? '🔒 Need 12 Energy'
                          : `🏃 Help Escape (${successRate}% chance)`}
                      </button>

                      {/* Bail Out Button */}
                      <button
                        onClick={() => handleBailOut(player)}
                        disabled={user.money < bailCost || isHelping}
                        style={{
                          padding: '0.75rem',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          backgroundColor:
                            user.money >= bailCost ? '#4CAF50' : '#555',
                          color: user.money >= bailCost ? '#fff' : '#888',
                          border: 'none',
                          borderRadius: '6px',
                          cursor:
                            user.money >= bailCost && !isHelping
                              ? 'pointer'
                              : 'not-allowed',
                          transition: 'all 0.2s',
                        }}
                      >
                        {user.money < bailCost
                          ? `🔒 $${bailCost.toLocaleString()}`
                          : `💰 Bail Out ($${bailCost.toLocaleString()})`}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: 'rgba(255, 136, 0, 0.1)',
            borderRadius: '8px',
            border: '1px solid #ff8800',
          }}
        >
          <div style={{ fontSize: '14px', color: '#aaa', lineHeight: '1.6' }}>
            <strong style={{ color: '#ff8800' }}>How it works:</strong>
            <br />
            <strong>Help Escape:</strong> Costs 12 Energy. Success rate depends
            on sentence length. On success: target escapes, both gain +25 Heat.
            On failure: YOU go to jail!
            <br />
            <strong>Bail Out:</strong> Costs $1,000 per minute remaining.
            Guaranteed success, no risk.
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          style={{
            marginTop: '2rem',
            padding: '1rem',
            width: '100%',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: '#555',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          ← Back to City
        </button>
      </div>
    </div>
  )
}

export default Jail
