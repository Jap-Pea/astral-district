import { useModal } from '../hooks/useModal'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useUser'

// Mock user data (replace with your useUser hook)
const mockUser = {
  id: 'player1',
  username: 'SpaceOutlaw',
  level: 15,
  health: 85,
  maxHealth: 100,
  energy: 45,
  maxEnergy: 100,
  heartRate: 80,
  maxHeartRate: 200,
  money: 15000,
  stats: { strength: 25.5, defense: 18.3, speed: 22.1, dexterity: 20.8 },
  inventory: [
    {
      item: {
        id: 'laser_pistol',
        name: 'Laser Pistol',
        type: 'weapon',
        stats: { damage: 15, accuracy: 75 },
      },
      equipped: true,
    },
    {
      item: {
        id: 'combat_vest',
        name: 'Combat Vest',
        type: 'armor',
        stats: { defense: 10 },
      },
      equipped: true,
    },
  ],
}

// Mock other players
const mockPlayers = [
  {
    id: 'p2',
    username: 'GalacticThug',
    level: 12,
    health: 90,
    maxHealth: 95,
    stats: { strength: 20.2, defense: 15.5, speed: 18.7, dexterity: 16.3 },
    money: 8500,
    location: 'earth',
  },
  {
    id: 'p3',
    username: 'StarRaider',
    level: 18,
    health: 100,
    maxHealth: 110,
    stats: { strength: 30.1, defense: 22.8, speed: 25.5, dexterity: 28.2 },
    money: 25000,
    location: 'earth',
  },
  {
    id: 'p4',
    username: 'Rookie47',
    level: 8,
    health: 70,
    maxHealth: 75,
    stats: { strength: 12.5, defense: 10.2, speed: 14.8, dexterity: 11.9 },
    money: 3200,
    location: 'earth',
  },
  {
    id: 'p5',
    username: 'VoidPirate',
    level: 22,
    health: 105,
    maxHealth: 120,
    stats: { strength: 38.5, defense: 28.3, speed: 32.1, dexterity: 35.7 },
    money: 45000,
    location: 'earth',
  },
]

const Combat = () => {
  const {
    user,
    updateUser,
    consumeEnergy,
    addMoney,
    addExperience,
    increaseHeartRate,
    sendToHospital,
  } = useUser()
  const [players] = useState(mockPlayers)
  const [selectedTarget, setSelectedTarget] = useState(null)
  const [combatLog, setCombatLog] = useState([])
  const [isFighting, setIsFighting] = useState(false)
  const [combatResult, setCombatResult] = useState(null)
  const { showModal } = useModal()

  // Calculate total stats with equipment
  const getTotalStats = (player) => {
    let totalDamage = player.stats.strength
    let totalDefense = player.stats.defense
    let totalAccuracy = player.stats.dexterity

    // Add weapon stats
    const weapon = player.inventory?.find(
      (i) => i.equipped && i.item.type === 'weapon'
    )
    if (weapon) {
      totalDamage += weapon.item.stats.damage || 0
      totalAccuracy += weapon.item.stats.accuracy || 0
    }

    // Add armor stats
    const armor = player.inventory?.find(
      (i) => i.equipped && i.item.type === 'armor'
    )
    if (armor) {
      totalDefense += armor.item.stats.defense || 0
    }

    return {
      damage: totalDamage,
      defense: totalDefense,
      accuracy: totalAccuracy,
      speed: player.stats.speed,
    }
  }

  const userStats = getTotalStats(user)

  const simulateCombat = (target) => {
    if (user.energy < 15) {
      showModal({
        title: 'Not enough Energy',
        message: `You need 15 Energy`,
        type: 'error',
        icon: <img src="images/icons/energy.png" alt="Energy" />,
      })
      return
    }

    if (user.health < 20) {
      showModal({
        title: 'This is Not wise',
        message: `Go get some Meds and try again`,
        type: 'error',
        icon: <img src="images/icons/health.png" alt="Health" />,
      })
      return
    }

    setIsFighting(true)
    setCombatLog([])
    setCombatResult(null)

    const log = []
    const targetStats = {
      damage: target.stats.strength + Math.random() * 10,
      defense: target.stats.defense + Math.random() * 5,
      accuracy: target.stats.dexterity,
      speed: target.stats.speed,
    }

    let playerHP = user.health
    let enemyHP = target.health
    let round = 1

    log.push({
      type: 'start',
      message: `⚔️ Combat begins between ${user.username} (Lv.${user.level}) and ${target.username} (Lv.${target.level})!`,
    })

    // Combat loop (max 12 rounds)
    while (playerHP > 0 && enemyHP > 0 && round <= 12) {
      log.push({ type: 'round', message: `--- Round ${round} ---` })

      // Determine who goes first (based on speed)
      const playerFirst = userStats.speed >= targetStats.speed

      if (playerFirst) {
        // Player attacks
        const hitChance = Math.min(
          95,
          60 + (userStats.accuracy - targetStats.speed) / 2
        )
        const hit = Math.random() * 100 < hitChance

        if (hit) {
          const baseDamage = userStats.damage
          const damageVariance = baseDamage * (0.8 + Math.random() * 0.4) // 80-120% of base
          const finalDamage = Math.max(
            1,
            Math.floor(damageVariance - targetStats.defense * 0.3)
          )
          enemyHP -= finalDamage

          const critical = Math.random() * 100 < 15
          if (critical) {
            const critDamage = Math.floor(finalDamage * 0.5)
            enemyHP -= critDamage
            log.push({
              type: 'crit',
              message: `💥 ${user.username} lands a CRITICAL HIT for ${
                finalDamage + critDamage
              } damage!`,
            })
          } else {
            log.push({
              type: 'hit',
              message: `⚔️ ${user.username} hits for ${finalDamage} damage!`,
            })
          }
        } else {
          log.push({
            type: 'miss',
            message: `❌ ${user.username} misses!`,
          })
        }

        // Enemy attacks back (if alive)
        if (enemyHP > 0) {
          const enemyHitChance = Math.min(
            95,
            60 + (targetStats.accuracy - userStats.speed) / 2
          )
          const enemyHit = Math.random() * 100 < enemyHitChance

          if (enemyHit) {
            const enemyBaseDamage = targetStats.damage
            const enemyDamageVariance =
              enemyBaseDamage * (0.8 + Math.random() * 0.4)
            const enemyFinalDamage = Math.max(
              1,
              Math.floor(enemyDamageVariance - userStats.defense * 0.3)
            )
            playerHP -= enemyFinalDamage

            log.push({
              type: 'hit',
              message: `⚔️ ${target.username} hits for ${enemyFinalDamage} damage!`,
            })
          } else {
            log.push({
              type: 'miss',
              message: `❌ ${target.username} misses!`,
            })
          }
        }
      } else {
        // Enemy attacks first
        const enemyHitChance = Math.min(
          95,
          60 + (targetStats.accuracy - userStats.speed) / 2
        )
        const enemyHit = Math.random() * 100 < enemyHitChance

        if (enemyHit) {
          const enemyBaseDamage = targetStats.damage
          const enemyDamageVariance =
            enemyBaseDamage * (0.8 + Math.random() * 0.4)
          const enemyFinalDamage = Math.max(
            1,
            Math.floor(enemyDamageVariance - userStats.defense * 0.3)
          )
          playerHP -= enemyFinalDamage

          log.push({
            type: 'hit',
            message: `⚔️ ${target.username} hits for ${enemyFinalDamage} damage!`,
          })
        } else {
          log.push({
            type: 'miss',
            message: `❌ ${target.username} misses!`,
          })
        }

        // Player attacks back (if alive)
        if (playerHP > 0) {
          const hitChance = Math.min(
            95,
            60 + (userStats.accuracy - targetStats.speed) / 2
          )
          const hit = Math.random() * 100 < hitChance

          if (hit) {
            const baseDamage = userStats.damage
            const damageVariance = baseDamage * (0.8 + Math.random() * 0.4)
            const finalDamage = Math.max(
              1,
              Math.floor(damageVariance - targetStats.defense * 0.3)
            )
            enemyHP -= finalDamage

            const critical = Math.random() * 100 < 15
            if (critical) {
              const critDamage = Math.floor(finalDamage * 0.5)
              enemyHP -= critDamage
              log.push({
                type: 'crit',
                message: `💥 ${user.username} lands a CRITICAL HIT for ${
                  finalDamage + critDamage
                } damage!`,
              })
            } else {
              log.push({
                type: 'hit',
                message: `⚔️ ${user.username} hits for ${finalDamage} damage!`,
              })
            }
          } else {
            log.push({
              type: 'miss',
              message: `❌ ${user.username} misses!`,
            })
          }
        }
      }

      round++
    }

    // Determine winner
    const playerWon = enemyHP <= 0

    if (playerWon) {
      const moneyStolen = Math.floor(target.money * 0.15) // Steal 15% of their money
      log.push({
        type: 'victory',
        message: `🎉 VICTORY! You defeated ${target.username}!`,
      })
      log.push({
        type: 'reward',
        message: `💰 You stole $${moneyStolen.toLocaleString()} and gained 50 XP!`,
      })

      setCombatResult({
        won: true,
        moneyGained: moneyStolen,
        xpGained: 50,
        healthLost: user.health - playerHP,
        heartRateIncrease: 25,
      })
      // Update user state after victory
      updateUser({
        health: playerHP,
        energy: user.energy - 15,
        heartRate: Math.min(user.heartRate + 25, user.maxHeartRate),
        money: user.money + moneyStolen,
      })
    } else if (playerHP <= 0) {
      const moneyLost = Math.floor(user.money * 0.15)
      log.push({
        type: 'defeat',
        message: `💀 DEFEAT! ${target.username} defeated you!`,
      })
      log.push({
        type: 'loss',
        message: `💸 You lost $${moneyLost.toLocaleString()} and are going to the hospital...`,
      })

      setCombatResult({
        won: false,
        moneyLost: moneyLost,
        xpGained: 10, // Small XP for trying
        healthLost: user.health,
        heartRateIncrease: 40,
      })
      // Update user state after defeat
      updateUser({
        health: 1, // Sent to hospital, set to minimum
        energy: user.energy - 15,
        heartRate: Math.min(user.heartRate + 40, user.maxHeartRate),
        money: Math.max(user.money - moneyLost, 0),
      })
      sendToHospital()
    } else {
      log.push({
        type: 'draw',
        message: `⚖️ Fight ended in a draw after ${round - 1} rounds!`,
      })

      setCombatResult({
        won: null,
        moneyGained: 0,
        xpGained: 15,
        healthLost: user.health - playerHP,
        heartRateIncrease: 20,
      })
      // Update user state after draw
      updateUser({
        health: playerHP,
        energy: user.energy - 15,
        heartRate: Math.min(user.heartRate + 20, user.maxHeartRate),
      })
    }

    setCombatLog(log)

    setTimeout(() => {
      setIsFighting(false)
    }, 1000)
  }

  const canFight = (target) => {
    const levelDiff = Math.abs(user.level - target.level)
    return levelDiff <= 10 // Can only fight players within 10 levels
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', color: '#fff' }}>
      <h1
        style={{ fontSize: '32px', marginBottom: '0.5rem', color: '#ff4444' }}
      >
        ⚔️ Combat Arena
      </h1>
      <p style={{ color: '#888', marginBottom: '2rem' }}>
        Attack other players to steal their money. Risk vs reward!
      </p>

      {/* Your Stats */}
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
          style={{ fontSize: '18px', marginBottom: '1rem', color: '#4CAF50' }}
        >
          Your Combat Stats
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
          }}
        >
          <StatBox label="Health" value={`${user.health}/${user.maxHealth}`} />
          <StatBox label="Energy" value={`${user.energy}/${user.maxEnergy}`} />
          <StatBox
            label="Attack Power"
            value={userStats.damage.toFixed(1)}
            color="#ff4444"
          />
          <StatBox
            label="Defense"
            value={userStats.defense.toFixed(1)}
            color="#2196F3"
          />
          <StatBox
            label="Accuracy"
            value={`${userStats.accuracy.toFixed(1)}%`}
            color="#FFC107"
          />
          <StatBox
            label="Speed"
            value={userStats.speed.toFixed(1)}
            color="#9C27B0"
          />
        </div>
      </div>

      {/* Combat Result */}
      {combatResult && (
        <div
          style={{
            backgroundColor: combatResult.won
              ? '#1b5e20'
              : combatResult.won === false
              ? '#b71c1c'
              : '#424242',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            border: `2px solid ${
              combatResult.won
                ? '#4CAF50'
                : combatResult.won === false
                ? '#f44336'
                : '#666'
            }`,
          }}
        >
          <h2 style={{ fontSize: '24px', marginBottom: '1rem' }}>
            {combatResult.won
              ? '🎉 VICTORY!'
              : combatResult.won === false
              ? '💀 DEFEAT!'
              : '⚖️ DRAW!'}
          </h2>
          <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
            {combatResult.won && (
              <>
                <div>
                  💰 Money gained: +${combatResult.moneyGained.toLocaleString()}
                </div>
                <div>⭐ XP gained: +{combatResult.xpGained}</div>
              </>
            )}
            {combatResult.won === false && (
              <>
                <div>
                  💸 Money lost: -${combatResult.moneyLost.toLocaleString()}
                </div>
                <div>⭐ XP gained: +{combatResult.xpGained}</div>
                <div style={{ color: '#ff5252', marginTop: '0.5rem' }}>
                  🏥 You're going to the hospital...
                </div>
              </>
            )}
            <div style={{ marginTop: '0.5rem' }}>
              💔 Health lost: -{combatResult.healthLost}
            </div>
            <div>
              💓 Heart rate increased: +{combatResult.heartRateIncrease}
            </div>
          </div>
        </div>
      )}

      {/* Combat Log */}
      {combatLog.length > 0 && (
        <div
          style={{
            backgroundColor: '#0f0f0f',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            border: '1px solid #333',
            maxHeight: '400px',
            overflowY: 'auto',
          }}
        >
          <h3 style={{ fontSize: '18px', marginBottom: '1rem', color: '#fff' }}>
            Combat Log
          </h3>
          {combatLog.map((entry, idx) => (
            <div
              key={idx}
              style={{
                padding: '0.5rem',
                marginBottom: '0.25rem',
                fontSize: '13px',
                color:
                  entry.type === 'victory' || entry.type === 'reward'
                    ? '#4CAF50'
                    : entry.type === 'defeat' || entry.type === 'loss'
                    ? '#f44336'
                    : entry.type === 'crit'
                    ? '#FFD700'
                    : '#aaa',
                fontFamily: 'monospace',
              }}
            >
              {entry.message}
            </div>
          ))}
        </div>
      )}

      {/* Target Selection */}
      {selectedTarget && (
        <TargetModal
          target={selectedTarget}
          onClose={() => setSelectedTarget(null)}
          onAttack={simulateCombat}
          isFighting={isFighting}
          userLevel={user.level}
        />
      )}

      {/* Available Targets */}
      <h2 style={{ fontSize: '24px', marginBottom: '1rem', color: '#fff' }}>
        Available Targets
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {players.map((player) => {
          const canAttack = canFight(player)
          const levelDiff = player.level - user.level

          return (
            <div
              key={player.id}
              onClick={() => canAttack && setSelectedTarget(player)}
              style={{
                backgroundColor: '#0f0f0f',
                padding: '1.5rem',
                borderRadius: '8px',
                border: canAttack ? '2px solid #333' : '2px solid #555',
                cursor: canAttack ? 'pointer' : 'not-allowed',
                opacity: canAttack ? 1 : 0.5,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (canAttack) {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.borderColor = '#ff4444'
                }
              }}
              onMouseLeave={(e) => {
                if (canAttack) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = '#333'
                }
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: '18px',
                      color: '#fff',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {player.username}
                  </h3>
                  <div style={{ fontSize: '13px', color: '#888' }}>
                    Level {player.level}{' '}
                    {levelDiff > 0
                      ? `(+${levelDiff})`
                      : levelDiff < 0
                      ? `(${levelDiff})`
                      : ''}
                  </div>
                </div>
                <div
                  style={{
                    backgroundColor: getLevelColor(player.level),
                    color: '#fff',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  LVL {player.level}
                </div>
              </div>

              <div style={{ fontSize: '13px', marginBottom: '0.5rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.25rem',
                  }}
                >
                  <span style={{ color: '#888' }}>Health:</span>
                  <span style={{ color: '#4CAF50' }}>
                    {player.health}/{player.maxHealth}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.25rem',
                  }}
                >
                  <span style={{ color: '#888' }}>Money:</span>
                  <span style={{ color: '#FFD700' }}>
                    ${player.money.toLocaleString()}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.25rem',
                  }}
                >
                  <span style={{ color: '#888' }}>Power:</span>
                  <span>{player.stats.strength.toFixed(1)}</span>
                </div>
              </div>

              {!canAttack && (
                <div
                  style={{
                    fontSize: '12px',
                    color: '#ff5252',
                    marginTop: '0.5rem',
                  }}
                >
                  ⚠️ Level difference too high (max ±10 levels)
                </div>
              )}

              {canAttack && (
                <div
                  style={{
                    fontSize: '12px',
                    color: '#4CAF50',
                    marginTop: '0.5rem',
                  }}
                >
                  💰 Potential steal: ~$
                  {Math.floor(player.money * 0.15).toLocaleString()}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const StatBox = ({ label, value, color = '#fff' }) => (
  <div
    style={{
      textAlign: 'center',
      padding: '1rem',
      backgroundColor: '#1a1a1a',
      borderRadius: '6px',
    }}
  >
    <div style={{ fontSize: '12px', color: '#888', marginBottom: '0.5rem' }}>
      {label}
    </div>
    <div style={{ fontSize: '20px', fontWeight: 'bold', color }}>{value}</div>
  </div>
)

const TargetModal = ({ target, onClose, onAttack, isFighting, userLevel }) => {
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
          border: '2px solid #ff4444',
          padding: '2rem',
          maxWidth: '500px',
          width: '100%',
        }}
      >
        <h2
          style={{ fontSize: '24px', marginBottom: '1rem', color: '#ff4444' }}
        >
          Attack {target.username}?
        </h2>

        <div
          style={{
            backgroundColor: '#0f0f0f',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
              }}
            >
              <span style={{ color: '#888' }}>Target Level:</span>
              <span>{target.level}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
              }}
            >
              <span style={{ color: '#888' }}>Target Health:</span>
              <span style={{ color: '#4CAF50' }}>
                {target.health}/{target.maxHealth}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
              }}
            >
              <span style={{ color: '#888' }}>Target Money:</span>
              <span style={{ color: '#FFD700' }}>
                ${target.money.toLocaleString()}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
              }}
            >
              <span style={{ color: '#888' }}>Potential Steal:</span>
              <span style={{ color: '#22c55e' }}>
                ${Math.floor(target.money * 0.15).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#b71c1c',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '13px',
            lineHeight: '1.6',
          }}
        >
          <div
            style={{
              color: '#ff5252',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
            }}
          >
            ⚠️ COMBAT COSTS:
          </div>
          <div style={{ color: '#aaa' }}>
            • 15 Energy
            <br />
            • High heart rate risk
            <br />
            • Lose 15% of your money if defeated
            <br />• Go to hospital if you lose
          </div>
        </div>

        <button
          onClick={() => {
            onAttack(target)
            onClose()
          }}
          disabled={isFighting}
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: isFighting ? '#555' : '#ff4444',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: isFighting ? 'not-allowed' : 'pointer',
            marginBottom: '0.75rem',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (!isFighting) e.currentTarget.style.backgroundColor = '#ff6666'
          }}
          onMouseLeave={(e) => {
            if (!isFighting) e.currentTarget.style.backgroundColor = '#ff4444'
          }}
        >
          {isFighting ? '⚔️ Fighting...' : '⚔️ ATTACK!'}
        </button>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '14px',
            backgroundColor: 'transparent',
            color: '#888',
            border: '1px solid #333',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

const getLevelColor = (level) => {
  if (level <= 5) return '#4CAF50'
  if (level <= 10) return '#2196F3'
  if (level <= 15) return '#FFC107'
  if (level <= 20) return '#FF9800'
  return '#f44336'
}

export default Combat
