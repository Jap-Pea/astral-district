// src/pages/Combat.tsx - COMPLETE WORKING VERSION
import { useState } from 'react'
import { useUser } from '../hooks/useUser'
import { useEnergy } from '../hooks/useEnergy'
import { useHeartRate } from '../hooks/useHeartRate'
import { useModal } from '../hooks/useModal'

// This will be your real backend data eventually
const getMockPlayers = () => [
  {
    id: 'p2',
    username: 'GalacticThug',
    level: 12,
    health: 90,
    maxHealth: 95,
    stats: { strength: 20.2, defense: 15.5, speed: 18.7, dexterity: 16.3 },
    money: 8500,
    location: 'earth'
  },
  {
    id: 'p3',
    username: 'StarRaider',
    level: 18,
    health: 100,
    maxHealth: 110,
    stats: { strength: 30.1, defense: 22.8, speed: 25.5, dexterity: 28.2 },
    money: 25000,
    location: 'earth'
  },
  {
    id: 'p4',
    username: 'Rookie47',
    level: 8,
    health: 70,
    maxHealth: 75,
    stats: { strength: 12.5, defense: 10.2, speed: 14.8, dexterity: 11.9 },
    money: 3200,
    location: 'earth'
  }
]

const Combat = () => {
  const {
    user,
    updateUser,
    addMoney,
    spendMoney,
    addExperience,
    sendToHospital
  } = useUser()
  const { consumeEnergy } = useEnergy()
  const { increaseHeartRate } = useHeartRate()
  const { showModal } = useModal()

  const [players] = useState(getMockPlayers())
  const [selectedTarget, setSelectedTarget] = useState<any>(null)
  const [attackType, setAttackType] = useState<'fight' | 'mug'>('fight')
  const [combatLog, setCombatLog] = useState<any[]>([])
  const [combatResult, setCombatResult] = useState<any>(null)
  const [isFighting, setIsFighting] = useState(false)

  if (!user) return null

  // Get equipped weapons
  const getEquippedWeapons = () => {
    const main = user.inventory.find(i => 
      i.equipped && i.item.type === 'weapon' && 
      (i.item.name.toLowerCase().includes('rifle') || i.item.name.toLowerCase().includes('cannon'))
    )
    const secondary = user.inventory.find(i => 
      i.equipped && i.item.type === 'weapon' && 
      (i.item.name.toLowerCase().includes('pistol') || i.item.name.toLowerCase().includes('blaster'))
    )
    const temp = user.inventory.find(i => 
      i.equipped && i.item.type === 'weapon' && 
      (i.item.name.toLowerCase().includes('grenade') || i.item.name.toLowerCase().includes('mine'))
    )
    return { main: main?.item || null, secondary: secondary?.item || null, temp: temp?.item || null }
  }

  const weapons = getEquippedWeapons()

  // Calculate stats with weapon
  const getTotalStats = (weapon: any = null) => {
    let totalDamage = user.stats.strength
    let totalDefense = user.stats.defense
    let totalAccuracy = user.stats.dexterity

    if (weapon) {
      totalDamage += weapon.stats?.damage || 0
      totalAccuracy += weapon.stats?.accuracy || 0
    }

    const armor = user.inventory.find(i => i.equipped && i.item.type === 'armor')
    if (armor) {
      totalDefense += armor.item.stats?.defense || 0
    }

    return {
      damage: totalDamage,
      defense: totalDefense,
      accuracy: totalAccuracy,
      speed: user.stats.speed
    }
  }

  const mainStats = getTotalStats(weapons.main)

  // QUICK MUG
  const handleMug = (target: any) => {
    if (user.energy < 8) {
      showModal({
        title: 'Not Enough Energy',
        message: 'You need 8 energy to mug someone.',
        type: 'error',
        icon: '⚡'
      })
      return
    }

    consumeEnergy(8)
    increaseHeartRate(10)

    const success = Math.random() < 0.7 // 70% chance

    if (success) {
      const stolen = Math.floor(target.money * 0.08)
      addMoney(stolen)
      addExperience(15)
      
      showModal({
        title: 'Mugging Success!',
        message: `You quickly grabbed $${stolen.toLocaleString()} from ${target.username}!\n\n+15 XP`,
        type: 'success',
        icon: '💰'
      })
    } else {
      showModal({
        title: 'Mugging Failed!',
        message: `${target.username} fought back! You fled empty-handed.`,
        type: 'error',
        icon: '❌'
      })
    }
  }

  // FULL COMBAT
  const startCombat = (target: any) => {
    if (user.energy < 15) {
      showModal({
        title: 'Not Enough Energy',
        message: 'You need 15 energy to fight.',
        type: 'error',
        icon: '⚡'
      })
      return
    }

    if (user.health < 20) {
      showModal({
        title: 'Too Injured',
        message: "You're too injured! Visit the hospital first.",
        type: 'error',
        icon: '🏥'
      })
      return
    }

    setIsFighting(true)
    setCombatLog([])
    setCombatResult(null)

    consumeEnergy(15)

    const log: any[] = []
    const playerStats = getTotalStats(weapons.main)
    const enemyStats = {
      damage: target.stats.strength,
      defense: target.stats.defense,
      accuracy: target.stats.dexterity,
      speed: target.stats.speed
    }

    let playerHP = user.health
    let enemyHP = target.health
    let round = 1

    log.push({
      type: 'start',
      message: `⚔️ ${user.username} (Lv.${user.level}) VS ${target.username} (Lv.${target.level})!`
    })

    // Combat loop
    while (playerHP > 0 && enemyHP > 0 && round <= 8) {
      log.push({ type: 'round', message: `--- Round ${round} ---` })

      // Player attacks
      const hitChance = Math.min(90, 60 + (playerStats.accuracy - enemyStats.speed) / 2)
      if (Math.random() * 100 < hitChance) {
        const damage = Math.max(1, Math.floor(
          playerStats.damage * (0.8 + Math.random() * 0.4) - enemyStats.defense * 0.3
        ))
        enemyHP -= damage

        const crit = Math.random() < 0.15
        if (crit) {
          const critDmg = Math.floor(damage * 0.5)
          enemyHP -= critDmg
          log.push({ type: 'crit', message: `💥 CRITICAL! ${damage + critDmg} damage!` })
        } else {
          log.push({ type: 'hit', message: `⚔️ You deal ${damage} damage` })
        }
      } else {
        log.push({ type: 'miss', message: `❌ You miss!` })
      }

      // Enemy counter
      if (enemyHP > 0) {
        const enemyHit = Math.min(90, 60 + (enemyStats.accuracy - playerStats.speed) / 2)
        if (Math.random() * 100 < enemyHit) {
          const damage = Math.max(1, Math.floor(
            enemyStats.damage * (0.8 + Math.random() * 0.4) - playerStats.defense * 0.3
          ))
          playerHP -= damage
          log.push({ type: 'hit', message: `⚔️ ${target.username} deals ${damage} damage` })
        } else {
          log.push({ type: 'miss', message: `❌ ${target.username} misses` })
        }
      }

      round++
    }

    // Results
    const won = enemyHP <= 0
    let result: any = {}

    if (won) {
      const stolen = Math.floor(target.money * 0.15)
      addMoney(stolen)
      addExperience(50)
      increaseHeartRate(25)
      updateUser({ health: Math.max(1, playerHP) })

      log.push({ type: 'victory', message: `🎉 VICTORY!` })
      log.push({ type: 'reward', message: `💰 +$${stolen.toLocaleString()}, +50 XP` })

      result = { won: true, moneyGained: stolen, xpGained: 50, healthLost: user.health - playerHP }
    } else if (playerHP <= 0) {
      const lost = Math.floor(user.money * 0.15)
      spendMoney(lost)
      addExperience(10)
      increaseHeartRate(40)

      log.push({ type: 'defeat', message: `💀 DEFEAT!` })
      log.push({ type: 'loss', message: `💸 -$${lost.toLocaleString()}, going to hospital...` })

      result = { won: false, moneyLost: lost, xpGained: 10, healthLost: user.health }
      
      setTimeout(() => {
        sendToHospital(15)
      }, 3000)
    } else {
      log.push({ type: 'draw', message: `⚖️ Draw!` })
      updateUser({ health: Math.max(1, playerHP) })
      increaseHeartRate(20)
      result = { won: null, xpGained: 15, healthLost: user.health - playerHP }
    }

    setCombatLog(log)
    setCombatResult(result)
    setIsFighting(false)
  }

  const canFight = (target: any) => Math.abs(user.level - target.level) <= 10

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', color: '#fff', padding: '1rem' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '0.5rem', color: '#ff4444' }}>⚔️ Combat Arena</h1>
      <p style={{ color: '#888', marginBottom: '2rem' }}>Fight players to steal their money. Choose your approach!</p>

      {/* Your Stats */}
      <div style={{ background: '#0f0f0f', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '2px solid #4CAF50' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '1rem', color: '#4CAF50' }}>Your Combat Stats</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
          <StatBox label="Health" value={`${user.health}/${user.maxHealth}`} />
          <StatBox label="Energy" value={`${user.energy}/${user.maxEnergy}`} />
          <StatBox label="Attack" value={mainStats.damage.toFixed(1)} color="#ff4444" />
          <StatBox label="Defense" value={mainStats.defense.toFixed(1)} color="#2196F3" />
          <StatBox label="Speed" value={mainStats.speed.toFixed(1)} color="#9C27B0" />
        </div>

        {/* Equipped Weapons */}
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#1a1a1a', borderRadius: '6px' }}>
          <div style={{ fontSize: '14px', color: '#888', marginBottom: '0.5rem' }}>EQUIPPED WEAPONS</div>
          <div style={{ fontSize: '13px' }}>
            <div>🔫 Main: {weapons.main?.name || 'None'}</div>
            <div>🔪 Secondary: {weapons.secondary?.name || 'None'}</div>
            <div>💣 Temp: {weapons.temp?.name || 'None'}</div>
          </div>
        </div>
      </div>

      {/* Combat Result */}
      {combatResult && (
        <div style={{
          background: combatResult.won ? '#1b5e20' : combatResult.won === false ? '#b71c1c' : '#424242',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          border: `2px solid ${combatResult.won ? '#4CAF50' : combatResult.won === false ? '#f44336' : '#666'}`
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '1rem' }}>
            {combatResult.won ? '🎉 VICTORY!' : combatResult.won === false ? '💀 DEFEAT!' : '⚖️ DRAW!'}
          </h2>
          <div style={{ fontSize: '14px' }}>
            {combatResult.won && <div>💰 Money: +${combatResult.moneyGained?.toLocaleString()}</div>}
            {combatResult.won === false && <div>💸 Money: -${combatResult.moneyLost?.toLocaleString()}</div>}
            <div>⭐ XP: +{combatResult.xpGained}</div>
            <div>💔 Health Lost: -{combatResult.healthLost}</div>
          </div>
        </div>
      )}

      {/* Combat Log */}
      {combatLog.length > 0 && (
        <div style={{ background: '#0f0f0f', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', maxHeight: '400px', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '1rem' }}>Combat Log</h3>
          {combatLog.map((entry, i) => (
            <div key={i} style={{
              padding: '0.5rem',
              fontSize: '13px',
              fontFamily: 'monospace',
              color: entry.type === 'victory' || entry.type === 'reward' ? '#4CAF50' :
                     entry.type === 'defeat' || entry.type === 'loss' ? '#f44336' :
                     entry.type === 'crit' ? '#FFD700' : '#aaa'
            }}>
              {entry.message}
            </div>
          ))}
        </div>
      )}

      {/* Target Modal */}
      {selectedTarget && (
        <div onClick={() => setSelectedTarget(null)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#1a1a1a', borderRadius: '12px', border: '2px solid #ff4444',
            padding: '2rem', maxWidth: '500px', width: '100%', margin: '1rem'
          }}>
            <h2 style={{ fontSize: '24px', marginBottom: '1rem', color: '#ff4444' }}>
              Attack {selectedTarget.username}?
            </h2>

            <div style={{ background: '#0f0f0f', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#888' }}>Level:</span>
                <span>{selectedTarget.level}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#888' }}>Health:</span>
                <span style={{ color: '#4CAF50' }}>{selectedTarget.health}/{selectedTarget.maxHealth}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Money:</span>
                <span style={{ color: '#FFD700' }}>${selectedTarget.money.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <button onClick={() => setAttackType('fight')} style={{
                flex: 1, padding: '0.75rem', background: attackType === 'fight' ? '#ff4444' : '#333',
                color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer'
              }}>
                ⚔️ Fight (15 energy)
              </button>
              <button onClick={() => setAttackType('mug')} style={{
                flex: 1, padding: '0.75rem', background: attackType === 'mug' ? '#ff4444' : '#333',
                color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer'
              }}>
                💰 Mug (8 energy)
              </button>
            </div>

            {attackType === 'fight' && (
              <div style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '13px' }}>
                <div style={{ color: '#4CAF50', marginBottom: '0.5rem' }}>✅ FIGHT</div>
                <div style={{ color: '#aaa' }}>
                  • Steal 15% of money<br/>
                  • +50 XP on win<br/>
                  • 15 energy cost<br/>
                  • Can escape mid-fight
                </div>
              </div>
            )}

            {attackType === 'mug' && (
              <div style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '13px' }}>
                <div style={{ color: '#FF9800', marginBottom: '0.5rem' }}>⚡ MUG</div>
                <div style={{ color: '#aaa' }}>
                  • Quick attack<br/>
                  • Steal 8% of money<br/>
                  • 70% success rate<br/>
                  • Only 8 energy
                </div>
              </div>
            )}

            <button disabled={isFighting} onClick={() => {
              if (attackType === 'mug') {
                handleMug(selectedTarget)
              } else {
                startCombat(selectedTarget)
              }
              setSelectedTarget(null)
            }} style={{
              width: '100%', padding: '1rem', fontSize: '16px', fontWeight: 'bold',
              background: isFighting ? '#555' : '#ff4444', color: '#fff',
              border: 'none', borderRadius: '8px', cursor: isFighting ? 'not-allowed' : 'pointer', marginBottom: '0.5rem'
            }}>
              {isFighting ? 'Fighting...' : attackType === 'fight' ? '⚔️ ATTACK!' : '💰 MUG!'}
            </button>

            <button onClick={() => setSelectedTarget(null)} style={{
              width: '100%', padding: '0.75rem', background: 'transparent',
              color: '#888', border: '1px solid #333', borderRadius: '8px', cursor: 'pointer'
            }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Available Targets */}
      <h2 style={{ fontSize: '24px', marginBottom: '1rem' }}>Available Targets</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {players.map(player => {
          const canAttack = canFight(player)
          return (
            <div key={player.id} onClick={() => canAttack && setSelectedTarget(player)} style={{
              background: '#0f0f0f', padding: '1.5rem', borderRadius: '8px',
              border: canAttack ? '2px solid #333' : '2px solid #555',
              cursor: canAttack ? 'pointer' : 'not-allowed', opacity: canAttack ? 1 : 0.5,
              transition: 'all 0.2s'
            }}>
              <h3 style={{ fontSize: '18px', marginBottom: '0.5rem' }}>{player.username}</h3>
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '1rem' }}>Level {player.level}</div>
              <div style={{ fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#888' }}>Health:</span>
                  <span style={{ color: '#4CAF50' }}>{player.health}/{player.maxHealth}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#888' }}>Money:</span>
                  <span style={{ color: '#FFD700' }}>${player.money.toLocaleString()}</span>
                </div>
              </div>
              {!canAttack && (
                <div style={{ fontSize: '12px', color: '#ff5252', marginTop: '0.5rem' }}>
                  ⚠️ Level too different (max ±10)
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const StatBox = ({ label, value, color = '#fff' }: any) => (
  <div style={{ textAlign: 'center', padding: '1rem', background: '#1a1a1a', borderRadius: '6px' }}>
    <div style={{ fontSize: '12px', color: '#888', marginBottom: '0.5rem' }}>{label}</div>
    <div style={{ fontSize: '20px', fontWeight: 'bold', color }}>{value}</div>
  </div>
)

export default Combat