// src/pages/Crimes.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useUser'
import { useCrimeActions } from '../hooks/useCrimeActions'
import { getAvailableCrimes } from '../services/mockData/crimes'
import type { Crime, CrimeResult } from '../types/crime.types'
import { getTimeOfDay, getCrimeBonus } from '../utils/timeOfDay'
import TravelingBlocker from '../components/TravelingBlocker'

const Crimes = () => {
  const navigate = useNavigate()
  const { user, isInJail, isInHospital } = useUser()
  const { commitCrime } = useCrimeActions()

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

  const allAvailableCrimes = getAvailableCrimes(user.level)

  // Filter crimes based on docking state
  const availableCrimes = allAvailableCrimes.filter((crime) => {
    if (crime.location === 'both') return true
    if (user.isDocked && crime.location === 'docked') return true
    if (!user.isDocked && crime.location === 'orbital') return true
    return false
  })

  const timeOfDay = getTimeOfDay()

  const handleCommitCrime = async (crime: Crime) => {
    if (isCommitting) return
    setSelectedCrime(crime)
    await commitCrime(crime, setIsCommitting, setResult)
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
      <p style={{ color: '#888', marginBottom: '1rem' }}>
        Choose your criminal activity wisely.
      </p>

      {/* Docking Status Info */}
      <div
        style={{
          backgroundColor: user.isDocked ? '#1e40af20' : '#05966920',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          border: user.isDocked ? '1px solid #1e40af' : '1px solid #059669',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <span style={{ fontSize: '20px' }}>{user.isDocked}</span>
        <div>
          <div
            style={{
              fontWeight: 'bold',
              color: user.isDocked ? '#60a5fa' : '#34d399',
            }}
          >
            {user.isDocked ? 'Docked at Station' : 'In Orbit'}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#888' }}>
            {user.isDocked
              ? 'Ground-based crimes available'
              : 'Space-based crimes available'}
          </div>
        </div>
      </div>

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
          <strong>WARNING:</strong> Police are on high alert! High risk of
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
            {result.success ? '✅ Success!' : '❌ Failed!'}
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
              You lost {result.healthLost} health during the crime!
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
                  Items found:{' '}
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
            userLevel={user.level}
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
  userLevel,
  timeOfDay,
}: {
  crime: Crime
  onCommit: (crime: Crime) => void
  disabled: boolean
  userEnergy: number
  userLevel: number
  timeOfDay: 'day' | 'night'
}) => {
  const canAfford = userEnergy >= 5
  const isLocked = userLevel < crime.requiredLevel
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
        backgroundColor: isLocked ? '#1a1a1a' : '#0f0f0f',
        padding: '1.5rem',
        borderRadius: '8px',
        border: isLocked
          ? '2px solid #666'
          : hasBonus
          ? `2px solid ${timeOfDay === 'night' ? '#5C6BC0' : '#FFA726'}`
          : '1px solid #333',
        opacity: disabled || isLocked ? 0.6 : 1,
        transition: 'all 0.2s',
        position: 'relative',
        filter: isLocked ? 'grayscale(0.7)' : 'none',
      }}
    >
      {isLocked && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '64px',
            opacity: 0.3,
            zIndex: 1,
          }}
        >
          🔒
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          backgroundColor: isLocked ? '#666' : getLevelColor(),
          color: '#fff',
          padding: '0.25rem 0.75rem',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold',
        }}
      >
        {isLocked && '🔒 '}LVL {crime.requiredLevel}
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
          {crime.cooldown / 60} min cooldown
        </div>
      )}

      <button
        onClick={isLocked ? undefined : () => onCommit(crime)}
        disabled={disabled || isLocked}
        style={{
          width: '100%',
          padding: '0.75rem',
          fontSize: isLocked ? '14px' : '16px',
          fontWeight: 'bold',
          backgroundColor: isLocked ? '#444' : canAfford ? '#ff4444' : '#555',
          color: isLocked ? '#aaa' : canAfford ? '#fff' : '#888',
          border: isLocked ? '2px solid #666' : 'none',
          borderRadius: '4px',
          cursor: disabled || isLocked ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          if (!disabled && !isLocked && canAfford) {
            e.currentTarget.style.backgroundColor = '#ff6666'
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !isLocked && canAfford) {
            e.currentTarget.style.backgroundColor = '#ff4444'
          }
        }}
      >
        {isLocked
          ? `🔒 LOCKED - LEVEL ${crime.requiredLevel} REQUIRED`
          : !canAfford
          ? 'Not Enough Energy'
          : 'Commit Crime'}
      </button>
    </div>
  )
}

export default Crimes
