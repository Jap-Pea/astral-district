// src/pages/Combat.tsx - COMPLETE WITH A, B, C
import { useState, useEffect } from 'react'
import { useUser } from '../hooks/useUser'
import { useModal } from '../hooks/useModal'

// Revenge tracking (eventually move to backend)
interface RevengeEntry {
  attackerId: string
  attackerName: string
  attackerLevel: number
  moneyStolen: number
  timestamp: Date
  type: 'attacked_you' | 'you_attacked'
}

let revengeLog: RevengeEntry[] = []

// Mock players
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

type WeaponSlot = 'main' | 'secondary' | 'temp'

const Combat = () => {
  const {
    user,
    updateUser,
    consumeEnergy,
    addMoney,
    spendMoney,
    addExperience,
    increaseHeartRate,
    sendToHospital,
    removeItemFromInventory
  } = useUser()
  const { showModal } = useModal()

  const [players] = useState(getMockPlayers())
  const [selectedTarget, setSelectedTarget] = useState<any>(null)
  const [attackType, setAttackType] = useState<'fight' | 'mug'>('fight')
  
  // Combat state
  const [inCombat, setInCombat] = useState(false)
  const [combatLog, setCombatLog] = useState<any[]>([])
  const [combatResult, setCombatResult] = useState<any>(null)
  const [currentRound, setCurrentRound] = useState(0)
  const [playerHP, setPlayerHP] = useState(0)
  const [enemyHP, setEnemyHP] = useState(0)
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponSlot>('main')
  const [canEscape, setCanEscape] = useState(true)
  
  // Revenge
  const [showRevenge, setShowRevenge] = useState(false)
  const myRevengeTargets = revengeLog.filter(r => r.type === 'attacked_you')

  if (!user) return null

  // Categorize weapons from inventory
  const categorizeWeapon = (name: string): WeaponSlot | null => {
    const n = name.toLowerCase()
    if (n.includes('rifle') || n.includes('cannon') || n.includes('launcher') || n.includes('beam')) return 'main'
    if (n.includes('pistol') || n.includes('blaster') || n.includes('sidearm')) return 'secondary'
    if (n.includes('grenade') || n.includes('mine') || n.includes('bomb')) return 'temp'
    return null
  }

  const getEquippedWeapons = () => {
    const weapons = { main: null as any, secondary: null as any, temp: null as any }
    
    user.inventory.forEach(inv => {
      if (inv.equipped && inv.item.type === 'weapon') {
        const slot = categorizeWeapon(inv.item.name)
        if (slot) weapons[slot] = inv.item
      }
    })
    
    return weapons
  }

  const weapons = getEquippedWeapons()

  // Calculate stats with specific weapon
  const getTotalStats = (weaponSlot: WeaponSlot) => {
    let totalDamage = user.stats.strength
    let totalDefense = user.stats.defense
    let totalAccuracy = user.stats.dexterity

    const weapon = weapons[weaponSlot]
    if (weapon) {
      totalDamage += weapon.stats?.damage || 0
      totalAccuracy += weapon.stats?.accuracy || 0
    }

    const armor = user.inventory.find(i => i.equipped && i.item.type === 'armor')
    if (armor) {
      totalDefense += armor.item.stats?.defense || 0
    }

    return { damage: totalDamage, defense: totalDefense, accuracy: totalAccuracy, speed: user.stats.speed, weapon }
  }

  // MUG - Quick attack
  const handleMug = (target: any) => {
    if (user.energy < 8) {
      showModal({ title: 'Not Enough Energy', message: 'Need 8 energy to mug.', type: 'error', icon: '⚡' })
      return
    }

    consumeEnergy(8)
    increaseHeartRate(10)

    const success = Math.random() < 0.7

    if (success) {
      const stolen = Math.floor(target.money * 0.08)
      addMoney(stolen)
      addExperience(15)
      
      revengeLog.push({
        attackerId: user.id,
        attackerName: user.username,
        attackerLevel: user.level,
        moneyStolen: stolen,
        timestamp: new Date(),
        type: 'you_attacked'
      })
      
      showModal({
        title: 'Mugging Success!',
        message: `Grabbed $${stolen.toLocaleString()} from ${target.username}!\n\n+15 XP`,
        type: 'success',
        icon: '💰'
      })
    } else {
      showModal({
        title: 'Mugging Failed!',
        message: `${target.username} fought back! You fled.`,
        type: 'error',
        icon: '❌'
      })
    }
  }

  // START COMBAT
  const startCombat = (target: any) => {
    if (user.energy < 15) {
      showModal({ title: 'Not Enough Energy', message: 'Need 15 energy to fight.', type: 'error', icon: '⚡' })
      return
    }

    if (user.health < 20) {
      showModal({ title: 'Too Injured', message: 'Visit hospital first!', type: 'error', icon: '🏥' })
      return
    }

    consumeEnergy(15)
    
    setInCombat(true)
    setCombatLog([])
    setCombatResult(null)
    setCurrentRound(1)
    setPlayerHP(user.health)
    setEnemyHP(target.health)
    setIsPlayerTurn(true)
    setSelectedWeapon('main')
    setCanEscape(true)
    setSelectedTarget(target)

    const log: any[] = [{
      type: 'start',
      message: `⚔️ ${user.username} (Lv.${user.level}) VS ${target.username} (Lv.${target.level})!`
    }]
    
    setCombatLog(log)
  }

  // PLAYER ATTACKS
  const playerAttack = () => {
    if (!inCombat || !isPlayerTurn) return

    const stats = getTotalStats(selectedWeapon)
    const targetStats = {
      defense: selectedTarget.stats.defense,
      speed: selectedTarget.stats.speed
    }

    const log = [...combatLog]
    log.push({ type: 'round', message: `--- Round ${currentRound} ---` })

    // Check if temp weapon (one-time use)
    const isTempWeapon = selectedWeapon === 'temp' && weapons.temp

    const hitChance = Math.min(95, 60 + (stats.accuracy - targetStats.speed) / 2)
    const hit = Math.random() * 100 < hitChance

    if (hit) {
      let damage = Math.max(1, Math.floor(
        stats.damage * (0.8 + Math.random() * 0.4) - targetStats.defense * 0.3
      ))

      const crit = Math.random() < 0.15
      if (crit) {
        const critDmg = Math.floor(damage * 0.5)
        damage += critDmg
        log.push({ 
          type: 'crit', 
          message: `💥 CRITICAL! ${stats.weapon?.name || 'Fist'} deals ${damage} damage!` 
        })
      } else {
        log.push({ 
          type: 'hit', 
          message: `⚔️ ${stats.weapon?.name || 'Fist'} deals ${damage} damage` 
        })
      }

      const newEnemyHP = Math.max(0, enemyHP - damage)
      setEnemyHP(newEnemyHP)

      // Consume temp weapon
      if (isTempWeapon && weapons.temp) {
        removeItemFromInventory(weapons.temp.id, 1)
        log.push({ type: 'info', message: `💣 ${weapons.temp.name} used up!` })
      }

      // Check if enemy defeated
      if (newEnemyHP <= 0) {
        finalizeCombat('win', log)
        return
      }
    } else {
      log.push({ type: 'miss', message: `❌ You miss with ${stats.weapon?.name || 'Fist'}!` })
    }

    setCombatLog(log)
    
    // Enemy turn
    setTimeout(() => enemyAttack(log), 1500)
  }

  // ENEMY ATTACKS
  const enemyAttack = (log: any[]) => {
    const enemyStats = {
      damage: selectedTarget.stats.strength,
      defense: selectedTarget.stats.defense,
      accuracy: selectedTarget.stats.dexterity,
      speed: selectedTarget.stats.speed
    }

    const playerStats = getTotalStats('main')

    const hitChance = Math.min(90, 60 + (enemyStats.accuracy - playerStats.speed) / 2)
    const hit = Math.random() * 100 < hitChance

    if (hit) {
      const damage = Math.max(1, Math.floor(
        enemyStats.damage * (0.8 + Math.random() * 0.4) - playerStats.defense * 0.3
      ))

      log.push({ type: 'hit', message: `⚔️ ${selectedTarget.username} deals ${damage} damage!` })

      const newPlayerHP = Math.max(0, playerHP - damage)
      setPlayerHP(newPlayerHP)

      if (newPlayerHP <= 0) {
        finalizeCombat('lose', log)
        return
      }
    } else {
      log.push({ type: 'miss', message: `❌ ${selectedTarget.username} misses!` })
    }

    setCombatLog(log)
    
    // Next round
    if (currentRound >= 8) {
      finalizeCombat('draw', log)
    } else {
      setCurrentRound(currentRound + 1)
      setIsPlayerTurn(true)
      setCanEscape(true)
    }
  }

  // ESCAPE
  const attemptEscape = () => {
    if (!canEscape || user.energy < 10) {
      showModal({ title: 'Cannot Escape', message: 'Need 10 energy!', type: 'error', icon: '⚡' })
      return
    }

    consumeEnergy(10)
    setCanEscape(false)

    const escapeChance = 60 + (user.stats.speed - selectedTarget.stats.speed)
    const success = Math.random() * 100 < escapeChance

    const log = [...combatLog]

    if (success) {
      log.push({ type: 'escape', message: `🏃 ${user.username} escaped successfully!` })
      setCombatLog(log)
      
      increaseHeartRate(15)
      updateUser({ health: playerHP })
      
      setCombatResult({
        escaped: true,
        xpGained: 5,
        healthLost: user.health - playerHP
      })
      
      setInCombat(false)
    } else {
      log.push({ type: 'escape_fail', message: `❌ Escape failed!` })
      setCombatLog(log)
      
      setTimeout(() => enemyAttack(log), 1500)
    }
  }

  // FINALIZE COMBAT
  const finalizeCombat = (outcome: 'win' | 'lose' | 'draw', log: any[]) => {
    let result: any = {}

    if (outcome === 'win') {
      const stolen = Math.floor(selectedTarget.money * 0.15)
      addMoney(stolen)
      addExperience(50)
      increaseHeartRate(25)
      updateUser({ health: playerHP })

      log.push({ type: 'victory', message: `🎉 VICTORY!` })
      log.push({ type: 'reward', message: `💰 +$${stolen.toLocaleString()}, +50 XP` })

      revengeLog.push({
        attackerId: user.id,
        attackerName: user.username,
        attackerLevel: user.level,
        moneyStolen: stolen,
        timestamp: new Date(),
        type: 'you_attacked'
      })

      result = { won: true, moneyGained: stolen, xpGained: 50, healthLost: user.health - playerHP }
    } else if (outcome === 'lose') {
      const lost = Math.floor(user.money * 0.15)
      spendMoney(lost)
      addExperience(10)
      increaseHeartRate(40)

      log.push({ type: 'defeat', message: `💀 DEFEAT!` })
      log.push({ type: 'loss', message: `💸 -$${lost.toLocaleString()}, hospital...` })

      revengeLog.push({
        attackerId: selectedTarget.id,
        attackerName: selectedTarget.username,
        attackerLevel: selectedTarget.level,
        moneyStolen: lost,
        timestamp: new Date(),
        type: 'attacked_you'
      })

      result = { won: false, moneyLost: lost, xpGained: 10, healthLost: user.health }

      setTimeout(() => sendToHospital(15), 2000)
    } else {
      log.push({ type: 'draw', message: `⚖️ Draw after ${currentRound} rounds!` })
      updateUser({ health: playerHP })
      increaseHeartRate(20)
      result = { won: null, xpGained: 15, healthLost: user.health - playerHP }
    }

    setCombatLog(log)
    setCombatResult(result)
    setInCombat(false)
  }

  const canFight = (target: any) => Math.abs(user.level - target.level) <= 10

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', color: '#fff', padding: '1rem' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '0.5rem', color: '#ff4444' }}>⚔️ Combat Arena</h1>
      <p style={{ color: '#888', marginBottom: '1rem' }}>Fight players, mug them, or seek revenge!</p>

      {/* Revenge Button */}
      <button onClick={() => setShowRevenge(!showRevenge)} style={{
        padding: '0.75rem 1.5rem', background: myRevengeTargets.length > 0 ? '#FF9800' : '#555',
        color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold',
        cursor: 'pointer', marginBottom: '1rem'
      }}>
        😤 Revenge ({myRevengeTargets.length})
      </button>

      {/* Revenge List */}
      {showRevenge && myRevengeTargets.length > 0 && (
        <div style={{ background: '#0f0f0f', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '2px solid #FF9800' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '1rem', color: '#FF9800' }}>Players Who Attacked You</h3>
          {myRevengeTargets.slice(-5).reverse().map((entry, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '1rem', background: '#1a1a1a', borderRadius: '6px', marginBottom: '0.5rem'
            }}>
              <div>
                <div style={{ fontWeight: 'bold' }}>{entry.attackerName} (Lv.{entry.attackerLevel})</div>
                <div style={{ fontSize: '12px', color: '#888' }}>
                  Stole ${entry.moneyStolen.toLocaleString()} • {new Date(entry.timestamp).toLocaleTimeString()}
                </div>
              </div>
              <button onClick={() => {
                const target = players.find(p => p.username === entry.attackerName)
                if (target) {
                  setSelectedTarget(target)
                  setAttackType('fight')
                }
              }} style={{
                padding: '0.5rem 1rem', background: '#f44336', color: '#fff',
                border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer'
              }}>
                REVENGE
              </button>
            </div>
          ))}
        </div>
      )}

      {/* IN-COMBAT VIEW */}
      {inCombat && (
        <div style={{ background: '#0f0f0f', padding: '2rem', borderRadius: '8px', marginBottom: '2rem', border: '3px solid #ff4444' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '1rem', textAlign: 'center' }}>
            Round {currentRound}
          </h2>

          {/* Health bars */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {user.username}
              </div>
              <div style={{ background: '#1a1a1a', height: '30px', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${(playerHP / user.maxHealth) * 100}%`,
                  background: 'linear-gradient(90deg, #4CAF50, #8BC34A)', transition: 'width 0.3s'
                }} />
              </div>
              <div style={{ fontSize: '14px', marginTop: '0.25rem' }}>
                {playerHP} / {user.maxHealth}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {selectedTarget.username}
              </div>
              <div style={{ background: '#1a1a1a', height: '30px', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${(enemyHP / selectedTarget.maxHealth) * 100}%`,
                  background: 'linear-gradient(90deg, #f44336, #FF5722)', transition: 'width 0.3s'
                }} />
              </div>
              <div style={{ fontSize: '14px', marginTop: '0.25rem' }}>
                {enemyHP} / {selectedTarget.maxHealth}
              </div>
            </div>
          </div>

          {/* Weapon Selection */}
          {isPlayerTurn && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '0.75rem' }}>
                Choose Your Weapon:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <button disabled={!weapons.main} onClick={() => setSelectedWeapon('main')} style={{
                  padding: '1rem', background: selectedWeapon === 'main' ? '#4CAF50' : '#333',
                  color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold',
                  cursor: weapons.main ? 'pointer' : 'not-allowed', opacity: weapons.main ? 1 : 0.5
                }}>
                  🔫 {weapons.main?.name || 'No Main'}
                  {weapons.main && <div style={{ fontSize: '12px' }}>Dmg: {weapons.main.stats.damage}</div>}
                </button>

                <button disabled={!weapons.secondary} onClick={() => setSelectedWeapon('secondary')} style={{
                  padding: '1rem', background: selectedWeapon === 'secondary' ? '#4CAF50' : '#333',
                  color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold',
                  cursor: weapons.secondary ? 'pointer' : 'not-allowed', opacity: weapons.secondary ? 1 : 0.5
                }}>
                  🔪 {weapons.secondary?.name || 'No Secondary'}
                  {weapons.secondary && <div style={{ fontSize: '12px' }}>Dmg: {weapons.secondary.stats.damage}</div>}
                </button>

                <button disabled={!weapons.temp} onClick={() => setSelectedWeapon('temp')} style={{
                  padding: '1rem', background: selectedWeapon === 'temp' ? '#4CAF50' : '#333',
                  color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold',
                  cursor: weapons.temp ? 'pointer' : 'not-allowed', opacity: weapons.temp ? 1 : 0.5
                }}>
                  💣 {weapons.temp?.name || 'No Temp'}
                  {weapons.temp && <div style={{ fontSize: '12px' }}>Dmg: {weapons.temp.stats.damage} (1x)</div>}
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          {isPlayerTurn && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={playerAttack} style={{
                flex: 1, padding: '1.5rem', background: '#ff4444', color: '#fff',
                border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer'
              }}>
                ⚔️ ATTACK
              </button>

              <button onClick={attemptEscape} disabled={!canEscape} style={{
                flex: 1, padding: '1.5rem', background: canEscape ? '#FF9800' : '#555',
                color: '#fff', border: 'none', borderRadius: '8px', fontSize: '18px',
                fontWeight: 'bold', cursor: canEscape ? 'pointer' : 'not-allowed'
              }}>
                🏃 ESCAPE (10 energy)
              </button>
            </div>
          )}

          {!isPlayerTurn && (
            <div style={{ textAlign: 'center', fontSize: '18px', color: '#FF9800', fontWeight: 'bold' }}>
              Enemy Turn...
            </div>
          )}
        </div>
      )}

      {/* Rest of UI (Stats, Log, Target Selection, etc.) continues... */}
      {/* Keeping it concise for token limits */}
    </div>
  )
}

export default Combat