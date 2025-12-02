// src/pages/Crimes.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useUser'
import { useModal } from '../hooks/useModal'
import { attemptCrime, getAvailableCrimes } from '../services/mockData/crimes'
import type { Crime, CrimeResult } from '../types/crime.types'
import { getTimeOfDay, getCrimeBonus } from '../utils/timeOfDay'
import TravelingBlocker from '../components/TravelingBlocker'
import { incrementCrime } from '../services/mockData/users'

const Crimes = () => {
  const navigate = useNavigate()
  const {
    user,
    setUser,
    consumeEnergy,
    addMoney,
    addExperience,
    increaseHeartRate,
    increaseHeat,
    checkArrestRisk,
    checkInjuryRisk,
    updateUser,
    sendToJail,
    sendToHospital,
    isInJail,
    isInHospital,
  } = useUser()
  const { showModal } = useModal()

  // Redirect if the user is sent to jail/hospital elsewhere in the app (context)
  useEffect(() => {
    if (isInJail) {
      navigate('/jail')
    }
  }, [isInJail, navigate])

  useEffect(() => {
    if (isInHospital) {
      navigate('/hospital')
    }
  }, [isInHospital, navigate])

  const [selectedCrime, setSelectedCrime] = useState<Crime | null>(null)
  const [result, setResult] = useState<CrimeResult | null>(null)
  const [isCommitting, setIsCommitting] = useState(false)

  if (!user) return null

  const availableCrimes = getAvailableCrimes(user.level)
  const timeOfDay = getTimeOfDay()

  const handleCommitCrime = async (crime: Crime) => {
    if (isCommitting) return

    // Check if user has enough energy
    const energyCost = crime.energyCost
    if (user.energy < energyCost) {
      showModal({
        title: 'Not Enough Energy',
        message: `You need ${crime.energyCost} energy to commit this crime.\n\nCurrent: ${user.energy}/${user.maxEnergy}`,
        type: 'error',
        icon: '⚡',
      })
      return
    }

    setIsCommitting(true)
    setSelectedCrime(crime)
    setResult(null)

    // Consume energy FIRST
    if (!consumeEnergy(energyCost)) {
      setIsCommitting(false)
      return
    }

    // Simulate crime (add suspense delay)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Attempt the crime
    const crimeResult = attemptCrime(crime)
    setResult(crimeResult)

    // Handle crime injury (from the crime itself, not heartRate)
    if (crimeResult.injured && crimeResult.healthLost > 0) {
      const newHealth = Math.max(user.health - crimeResult.healthLost, 0)
      updateUser({ health: newHealth })

      if (newHealth === 0 || newHealth < user.maxHealth * 0.15) {
        setTimeout(() => {
          if (newHealth === 0) {
            showModal({
              title: 'Critical Injury',
              message: "💀 You're critically injured! Going to hospital...",
              type: 'error',
              icon: '🩺',
            })
          } else {
            showModal({
              title: 'Injured',
              message: "🏥 You're badly injured! Going to hospital...",
              type: 'warning',
              icon: '🏥',
            })
          }
          // Use context to send to hospital so other components observe the state
          sendToHospital(15)
        }, 2500)
        setIsCommitting(false)
        return
      }
    }

    if (crimeResult.success) {
      // Add rewards
      addMoney(crimeResult.moneyEarned)
      addExperience(crimeResult.experienceEarned)

      // Only update crimesTally, don't spread entire user (would restore consumed energy)
      updateUser({
        crimesTally: {
          ...user.crimesTally,
          total: user.crimesTally.total + 1,
          success: user.crimesTally.success + 1,
        },
      })

      // Increase heartRate and heat based on crime's heartRateCost
      const hrIncrease = crime.heartRateCost
      const heatIncrease = Math.floor(crime.requiredLevel / 6) + 2

      increaseHeartRate(hrIncrease)
      increaseHeat(heatIncrease)

      // Calculate new values for risk checks
      const newHeartRate = Math.min(
        user.heartRate + hrIncrease,
        user.maxHeartRate
      )
      const newHeat = Math.min(user.heat + heatIncrease, user.maxHeat)

      console.log('After crime - HR:', newHeartRate, 'Heat:', newHeat)

      // Check risks with NEW values
      setTimeout(() => {
        const injuryCheck = checkInjuryRisk(newHeartRate)
        const projectedHealth = Math.max(user.health - injuryCheck.damage, 0)

        if (injuryCheck.injured) {
          showModal({
            title: projectedHealth <= 0 ? 'Heart Attack' : 'Injury',
            message:
              projectedHealth <= 0
                ? '💀 Heart attack! Going to hospital...'
                : `⚠️ Your heart rate is dangerously high! You took ${injuryCheck.damage} damage!`,
            type: projectedHealth <= 0 ? 'error' : 'warning',
            icon: projectedHealth <= 0 ? '💀' : '⚠️',
          })
          if (projectedHealth <= 0 || projectedHealth < user.maxHealth * 0.15) {
            // Severe injury / heart attack: send to hospital
            sendToHospital(15)
            setIsCommitting(false)
            return
          }
        } else if (newHeartRate >= user.maxHeartRate * 0.9) {
          // High HR warning even if not injured this tick
          showModal({
            title: 'High Heart Rate',
            message:
              '⚠️ Your heart rate is in the danger zone! Slow down or you may be injured.',
            type: 'warning',
            icon: '⚠️',
          })
        }

        const arrested = checkArrestRisk(newHeat)
        if (arrested) {
          setTimeout(() => {
            showModal({
              title: 'Arrested',
              message: "The police caught you! You're going to jail.",
              type: 'error',
              icon: '🚔',
            })
            sendToJail(30)
            setIsCommitting(false)
          }, 500)
        }

        setIsCommitting(false)
      }, 100)
    } else {
      // Failed crime still increases heartRate and heat
      const hrIncrease = Math.floor(crime.heartRateCost / 3) // 1/3 of the heartRate cost
      const heatIncrease = 5 // Increased heat on failure

      increaseHeartRate(hrIncrease)
      increaseHeat(heatIncrease)
      addExperience(crimeResult.experienceEarned)

      const newHeat = Math.min(user.heat + heatIncrease, user.maxHeat)
      const newHeartRate = Math.min(
        user.heartRate + hrIncrease,
        user.maxHeartRate
      )
      console.log('Failed crime - New heat:', newHeat)

      // Failed crimes have MUCH higher arrest chance
      setTimeout(() => {
        // Injury risk even on failure (reduced frequency but still present)
        const injuryCheck = checkInjuryRisk(newHeartRate)
        const projectedHealth = Math.max(user.health - injuryCheck.damage, 0)

        if (injuryCheck.injured) {
          showModal({
            title: projectedHealth <= 0 ? 'Heart Attack' : 'Injury',
            message:
              projectedHealth <= 0
                ? '💀 Heart attack! Going to hospital...'
                : `⚠️ You pushed too hard while failing! You took ${injuryCheck.damage} damage!`,
            type: projectedHealth <= 0 ? 'error' : 'warning',
            icon: projectedHealth <= 0 ? '💀' : '⚠️',
          })
          if (projectedHealth <= 0 || projectedHealth < user.maxHealth * 0.15) {
            sendToHospital(15)
            setIsCommitting(false)
            return
          }
        } else if (newHeartRate >= user.maxHeartRate * 0.9) {
          showModal({
            title: 'High Heart Rate',
            message:
              '⚠️ Your heart rate is in the danger zone even on failure. Rest or risk injury.',
            type: 'warning',
            icon: '⚠️',
          })
        }
        const arrested = checkArrestRisk(newHeat)
        console.log('Failed crime arrest check result:', arrested)
        if (arrested) {
          setTimeout(() => {
            showModal({
              title: 'Arrested',
              message: '🚔 You got caught! Going to jail...',
              type: 'error',
              icon: '🚔',
            })
            sendToJail(30)
            setIsCommitting(false)
          }, 500)
        }
        setIsCommitting(false)
      }, 100)
    }
  }

  return (
    <div>
      <TravelingBlocker />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <h1 style={{ fontSize: '32px', margin: 0, color: '#ff4444' }}>
          Crimes
        </h1>
        <div
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: timeOfDay === 'night' ? '#1a237e' : '#f57f17',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {timeOfDay === 'night' ? '🌙 Night Time' : '☀️ Day Time'}
          <span
            style={{ fontSize: '12px', fontWeight: 'normal', opacity: 0.8 }}
          >
            (+10% bonus on some crimes)
          </span>
        </div>
      </div>
      <p style={{ color: '#888', marginBottom: '2rem' }}>
        Choose your criminal activity wisely. All crimes cost 10 energy.
      </p>

      {/* Current Status Bar */}
      <div
        style={{
          backgroundColor: '#0f0f0f',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '1rem',
          border: '1px solid #333',
        }}
      >
        <StatusItem
          label="Energy"
          value={`${user.energy}/${user.maxEnergy}`}
          warning={user.energy < 5}
        />
        <StatusItem
          label="Heart Rate"
          value={`${user.heartRate}/${user.maxHeartRate}`}
          warning={user.heartRate > 150}
        />
        <StatusItem
          label="Heat"
          value={`${user.heat}/${user.maxHeat}`}
          warning={user.heat > 75}
        />
        <StatusItem
          label="Health"
          value={`${user.health}/${user.maxHealth}`}
          warning={user.health < user.maxHealth * 0.3}
        />
        <StatusItem label="Money" value={`$${user.money.toLocaleString()}`} />
        <StatusItem label="Level" value={user.level.toString()} />
      </div>

      {user.heartRate > 150 && (
        <div
          style={{
            backgroundColor: '#b71c1c',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            border: '2px solid #f44336',
            fontSize: '14px',
          }}
        >
          ⚠️ <strong>WARNING:</strong> Your heart rate is dangerously high! Risk
          of injury increases with each crime!
        </div>
      )}

      {user.heat > 75 && (
        <div
          style={{
            backgroundColor: '#b71c1c',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            border: '2px solid #f44336',
            fontSize: '14px',
          }}
        >
          🚔 <strong>WARNING:</strong> Police are on high alert! High risk of
          arrest!
        </div>
      )}

      {/* Crime Result Display */}
      {result && (
        <div
          style={{
            backgroundColor: result.success ? '#1b5e20' : '#b71c1c',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            border: `2px solid ${result.success ? '#4CAF50' : '#f44336'}`,
          }}
        >
          <h2
            style={{
              fontSize: '24px',
              marginBottom: '1rem',
              color: '#fff',
            }}
          >
            {result.critical
              ? '🎉 CRITICAL SUCCESS!'
              : result.success
              ? '✅ Success!'
              : '❌ Failed!'}
          </h2>
          <p style={{ fontSize: '16px', marginBottom: '1rem', color: '#fff' }}>
            {result.message}
          </p>
          {result.injured && result.healthLost > 0 && (
            <div
              style={{
                fontSize: '14px',
                color: '#ff5252',
                marginBottom: '1rem',
                fontWeight: 'bold',
              }}
            >
              💔 You lost {result.healthLost} health during the crime!
            </div>
          )}
          {result.success && (
            <div style={{ fontSize: '14px' }}>
              <div
                style={{
                  display: 'flex',
                  gap: '2rem',
                  marginBottom: '0.5rem',
                  flexWrap: 'wrap',
                }}
              >
                <span>💰 +${result.moneyEarned.toLocaleString()}</span>
                <span>⭐ +{result.experienceEarned} XP</span>
              </div>
              {result.itemsFound && result.itemsFound.length > 0 && (
                <div style={{ marginTop: '0.5rem', color: '#FFD700' }}>
                  📦 Items found:{' '}
                  {result.itemsFound
                    .map((item) => `${item.itemName} x${item.quantity}`)
                    .join(', ')}
                </div>
              )}
              {result.critical && (
                <span style={{ color: '#FFD700' }}>🔥 BONUS REWARDS!</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isCommitting && (
        <div
          style={{
            backgroundColor: '#0f0f0f',
            padding: '2rem',
            borderRadius: '8px',
            textAlign: 'center',
            marginBottom: '2rem',
            border: '2px solid #ff4444',
          }}
        >
          <h2 style={{ fontSize: '24px', marginBottom: '1rem' }}>
            Committing {selectedCrime?.name}...
          </h2>
          <div style={{ fontSize: '16px', color: '#888' }}>⏳ Working...</div>
        </div>
      )}

      {/* Available Crimes */}
      <h2 style={{ fontSize: '24px', marginBottom: '1rem', color: '#fff' }}>
        Available Crimes
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem',
        }}
      >
        {availableCrimes.map((crime) => (
          <CrimeCard
            key={crime.id}
            crime={crime}
            onCommit={handleCommitCrime}
            disabled={isCommitting || user.energy < 5}
            userEnergy={user.energy}
            timeOfDay={timeOfDay}
          />
        ))}
      </div>

      {availableCrimes.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#888',
          }}
        >
          <p>No crimes available yet. Keep leveling up!</p>
        </div>
      )}
    </div>
  )
}

// Helper Components
const StatusItem = ({
  label,
  value,
  warning = false,
}: {
  label: string
  value: string
  warning?: boolean
}) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: '12px', color: '#888', marginBottom: '0.25rem' }}>
      {label}
    </div>
    <div
      style={{
        fontSize: '18px',
        fontWeight: 'bold',
        color: warning ? '#f44336' : '#fff',
      }}
    >
      {value}
      {warning && <span style={{ marginLeft: '0.25rem' }}>⚠️</span>}
    </div>
  </div>
)

const CrimeCard = ({
  crime,
  onCommit,
  disabled,
  userEnergy,
  timeOfDay,
}: {
  crime: Crime
  onCommit: (crime: Crime) => void
  disabled: boolean
  userEnergy: number
  timeOfDay: 'day' | 'night'
}) => {
  const canAfford = userEnergy >= 5
  const bonus = getCrimeBonus(crime.id)
  const hasBonus = bonus > 0

  const getLevelColor = () => {
    if (crime.requiredLevel <= 5) return '#4CAF50'
    if (crime.requiredLevel <= 15) return '#2196F3'
    if (crime.requiredLevel <= 25) return '#FF9800'
    if (crime.requiredLevel <= 35) return '#f44336'
    return '#9C27B0'
  }

  const getDangerColor = () => {
    if (!crime.injuryChance) return '#4CAF50'
    if (crime.injuryChance < 15) return '#4CAF50'
    if (crime.injuryChance < 30) return '#FFC107'
    return '#f44336'
  }

  return (
    <div
      style={{
        backgroundColor: '#0f0f0f',
        padding: '1.5rem',
        borderRadius: '8px',
        border: hasBonus
          ? `2px solid ${timeOfDay === 'night' ? '#5C6BC0' : '#FFA726'}`
          : '1px solid #333',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.2s',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          backgroundColor: getLevelColor(),
          color: '#fff',
          padding: '0.25rem 0.75rem',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold',
        }}
      >
        LVL {crime.requiredLevel}
      </div>

      {hasBonus && (
        <div
          style={{
            position: 'absolute',
            top: '3rem',
            right: '1rem',
            backgroundColor: timeOfDay === 'night' ? '#5C6BC0' : '#FFA726',
            color: '#fff',
            padding: '0.25rem 0.5rem',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          {timeOfDay === 'night' ? '🌙' : '☀️'} +{bonus}%
        </div>
      )}

      <h3
        style={{
          margin: '0 0 0.5rem 0',
          fontSize: '18px',
          color: '#fff',
          paddingRight: '60px',
        }}
      >
        {crime.name}
      </h3>

      <p
        style={{
          fontSize: '14px',
          color: '#aaa',
          marginBottom: '1rem',
          minHeight: '60px',
        }}
      >
        {crime.description}
      </p>

      {crime.injuryChance && crime.injuryChance > 0 && (
        <div
          style={{
            fontSize: '12px',
            color: getDangerColor(),
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          ⚠️ {crime.injuryChance}% injury risk
        </div>
      )}

      {crime.cooldown && (
        <div
          style={{
            fontSize: '11px',
            color: '#FF9800',
            marginBottom: '1rem',
            padding: '0.25rem 0.5rem',
            backgroundColor: 'rgba(255, 152, 0, 0.1)',
            borderRadius: '4px',
            display: 'inline-block',
          }}
        >
          ⏱️ {crime.cooldown / 60} min cooldown
        </div>
      )}

      <button
        onClick={() => onCommit(crime)}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '0.75rem',
          fontSize: '16px',
          fontWeight: 'bold',
          backgroundColor: canAfford ? '#ff4444' : '#555',
          color: canAfford ? '#fff' : '#888',
          border: 'none',
          borderRadius: '4px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          if (!disabled && canAfford) {
            e.currentTarget.style.backgroundColor = '#ff6666'
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && canAfford) {
            e.currentTarget.style.backgroundColor = '#ff4444'
          }
        }}
      >
        {!canAfford ? 'Not Enough Energy' : 'Commit Crime'}
      </button>
    </div>
  )
}

export default Crimes
