// src/pages/Gym.tsx
import { useState } from 'react'
import { useUser } from '../hooks/useUser'
import { useEnergy } from '../hooks/useEnergy'
import { useModal } from '../hooks/useModal'
import { computeTrainingGain } from '../utils/decisionHelpers'
import TravelingBlocker from '../components/TravelingBlocker'

interface GymMembership {
  id: string
  name: string
  description: string
  price: number
  duration: number // days
  trainingBonus: number // percentage bonus to gains
  energyCostReduction: number // percentage reduction
  icon: string
}

interface TrainingStat {
  name: 'strength' | 'defense' | 'speed' | 'dexterity'
  label: string
  icon: string
  description: string
  energyCost: number
  baseGain: number // Base stat points gained
}

const Gym = () => {
  const { user, updateUser, spendMoney } = useUser()
  const { consumeEnergy } = useEnergy()
  const { showModal } = useModal()
  const [isTraining, setIsTraining] = useState(false)
  const [activeMembership, setActiveMembership] = useState<string | null>(null) // TODO: Save to user
  const [membershipExpiry, setMembershipExpiry] = useState<Date | null>(null) // TODO: Save to user

  if (!user) return null

  const memberships: GymMembership[] = [
    {
      id: 'basic',
      name: 'Basic Membership',
      description: 'Entry-level access to gym equipment',
      price: 10000,
      duration: 7,
      trainingBonus: 5,
      energyCostReduction: 0,
      icon: '🏋️',
    },
    {
      id: 'premium',
      name: 'Premium Membership',
      description: 'Full access with personal trainer',
      price: 50000,
      duration: 7,
      trainingBonus: 10,
      energyCostReduction: 11,
      icon: '💪',
    },
    {
      id: 'elite',
      name: 'Elite Membership',
      description: 'VIP access with advanced equipment',
      price: 200000,
      duration: 14,
      trainingBonus: 12,
      energyCostReduction: 12,
      icon: '⭐',
    },
    {
      id: 'gold',
      name: 'Gold Membership',
      description: ' maximum gains',
      price: 500000,
      duration: 14,
      trainingBonus: 20,
      energyCostReduction: 14,
      icon: '👑',
    },
    {
      id: 'platinum',
      name: 'Platinum Membership',
      description: 'Unlimited access forever with maximum gains',
      price: 800000,
      duration: 30,
      trainingBonus: 30,
      energyCostReduction: 16,
      icon: '👑',
    },
  ]

  const trainingOptions: TrainingStat[] = [
    {
      name: 'strength',
      label: 'Strength',
      icon: '💪',
      description: 'Increases damage in combat',
      energyCost: 10,
      baseGain: 1,
    },
    {
      name: 'defense',
      label: 'Defense',
      icon: '🛡️',
      description: 'Reduces damage taken',
      energyCost: 10,
      baseGain: 1,
    },
    {
      name: 'speed',
      label: 'Speed',
      icon: '⚡',
      description: 'Increases attack frequency',
      energyCost: 10,
      baseGain: 1,
    },
    {
      name: 'dexterity',
      label: 'Dexterity',
      icon: '🎯',
      description: 'Improves accuracy and critical hits',
      energyCost: 10,
      baseGain: 1,
    },
  ]
  // Find the membership
  const currentMembership = activeMembership
    ? memberships.find((m) => m.id === activeMembership)
    : null
  // Energy cost
  const getEnergyCost = (baseCost: number): number => {
    if (!currentMembership) return baseCost
    // membership.energyCostReduction is a percentage (e.g 2 = -2%)
    return Math.ceil(
      baseCost * (1 - currentMembership.energyCostReduction / 100)
    )
  }

  const getStatGain = (baseGain: number): number => {
    if (!currentMembership) return baseGain
    return Math.ceil(baseGain * (1 + currentMembership.trainingBonus / 100))
  }

  /**
   * Calculate stat gain with random decimal (0.01-0.2) and membership bonus multiplier.
   * Formula: gain = randomGain * membershipMultiplier
   * Example: randomGain = 0.053, membership bonus = 10% (1.1x) => gain = 0.0583
   */
  const calculateVariableGain = (
    membershipBonus: number = 0
  ): { gain: number; variance: number } => {
    return computeTrainingGain(membershipBonus)
  }

  const handleTrain = async (stat: TrainingStat) => {
    const energyCost = getEnergyCost(stat.energyCost)

    if (user.energy < energyCost) {
      showModal({
        title: 'Not Enough Energy',
        message: `You need ${energyCost} energy to train.\n\nCurrent: ${user.energy}/${user.maxEnergy}`,
        type: 'error',
        icon: '⚡',
      })
      return
    }

    setIsTraining(true)

    // Consume energy
    if (!consumeEnergy(energyCost)) {
      setIsTraining(false)
      return
    }

    // Training animation delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Calculate variable gain with membership bonus
    const membershipBonus = currentMembership
      ? currentMembership.trainingBonus
      : 0
    const { gain, variance } = calculateVariableGain(membershipBonus)

    // Show modal with gains FIRST
    const varianceText = variance > 0 ? `+${variance}%` : `${variance}%`
    showModal({
      title: 'Training Complete',
      message: `${stat.label} +${gain.toFixed(
        3
      )}\n\n${varianceText} membership bonus\nTraining #${
        user.trainingCount + 1
      }`,
      type: 'success',
      icon: stat.icon,
    })

    // Update stat AFTER showing modal
    const newStats = {
      ...user.stats,
      [stat.name]: user.stats[stat.name] + gain,
    }

    // Increment training count
    updateUser({
      stats: newStats,
      trainingCount: user.trainingCount + 1,
    })

    setIsTraining(false)
  }

  const handlePurchaseMembership = (membership: GymMembership) => {
    if (user.money < membership.price) {
      showModal({
        title: 'Insufficient Funds',
        message: `This membership costs $${membership.price.toLocaleString()}\n\nYou have: $${user.money.toLocaleString()}`,
        type: 'error',
        icon: '💰',
      })
      return
    }

    // Show info modal and perform purchase immediately (non-blocking)
    showModal({
      title: `Purchasing ${membership.name}`,
      message:
        `Cost: $${membership.price.toLocaleString()}\n\n` +
        `Benefits:\n` +
        `• +${membership.trainingBonus}% training gains\n` +
        `• -${membership.energyCostReduction}% energy cost\n` +
        `• Valid for ${membership.duration} day${
          membership.duration !== 1 ? 's' : ''
        }`,
      type: 'info',
      icon: membership.icon,
    })

    if (spendMoney(membership.price)) {
      setActiveMembership(membership.id)
      const expiry = new Date()
      expiry.setDate(expiry.getDate() + membership.duration)
      setMembershipExpiry(expiry)
      showModal({
        title: 'Membership Activated',
        message: `${
          membership.name
        }\n\nValid until ${expiry.toLocaleDateString()}\n\nExpires in ${
          membership.duration
        } days`,
        type: 'success',
        icon: membership.icon,
      })
      // TODO: Save to user data
    }
  }

  const isExpired = membershipExpiry ? new Date() > membershipExpiry : false
  if (isExpired && activeMembership) {
    setActiveMembership(null)
    setMembershipExpiry(null)
  }

  return (
    <div>
      <TravelingBlocker />
      <h1
        style={{ fontSize: '32px', marginBottom: '0.5rem', color: '#ff4444' }}
      >
        Gym
      </h1>
      <p style={{ color: '#888', marginBottom: '2rem' }}>
        Train your stats to become stronger. Purchase a membership for training
        bonuses!
      </p>

      {/* Current Stats */}
      <div
        style={{
          backgroundColor: '#0f0f0f',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          border: '1px solid #333',
        }}
      >
        <h2
          style={{
            fontSize: '18px',
            marginBottom: '1rem',
            color: '#888',
            textTransform: 'uppercase',
          }}
        >
          Your Stats
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
          }}
        >
          <StatDisplay icon="💪" label="Strength" value={user.stats.strength} />
          <StatDisplay icon="🛡️" label="Defense" value={user.stats.defense} />
          <StatDisplay icon="⚡" label="Speed" value={user.stats.speed} />
          <StatDisplay
            icon="🎯"
            label="Dexterity"
            value={user.stats.dexterity}
          />
        </div>
      </div>

      {/* Active Membership */}
      {currentMembership && membershipExpiry && !isExpired && (
        <div
          style={{
            backgroundColor: '#1b5e20',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            border: '2px solid #4CAF50',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '0.5rem',
            }}
          >
            <div style={{ fontSize: '36px' }}>{currentMembership.icon}</div>
            <div>
              <h3
                style={{
                  fontSize: '20px',
                  color: '#4CAF50',
                  marginBottom: '0.25rem',
                }}
              >
                Active: {currentMembership.name}
              </h3>
              <div style={{ fontSize: '14px', color: '#aaa' }}>
                Expires: {membershipExpiry.toLocaleDateString()}
              </div>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              gap: '1.5rem',
              fontSize: '14px',
              marginTop: '1rem',
            }}
          >
            <div> +{currentMembership.trainingBonus}% Training Bonus</div>
            <div> -{currentMembership.energyCostReduction}% Energy Cost</div>
          </div>
        </div>
      )}

      {/* Training Options */}
      <div style={{ marginBottom: '3rem' }}>
        <h2
          style={{ fontSize: '24px', marginBottom: '1rem', color: '#fff' }}
        ></h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {trainingOptions.map((stat) => {
            const energyCost = getEnergyCost(stat.energyCost)
            const gain = getStatGain(stat.baseGain)
            const canAfford = user.energy >= energyCost

            return (
              <div
                key={stat.name}
                style={{
                  backgroundColor: '#0f0f0f',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  border: '2px solid #333',
                }}
              >
                <div
                  style={{
                    fontSize: '48px',
                    textAlign: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  {stat.icon}
                </div>
                <h3
                  style={{
                    fontSize: '20px',
                    textAlign: 'center',
                    marginBottom: '0.5rem',
                  }}
                >
                  Train {stat.label}
                </h3>
                <p
                  style={{
                    fontSize: '13px',
                    color: '#888',
                    textAlign: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  {stat.description}
                </p>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                    padding: '0.75rem',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '6px',
                    fontSize: '14px',
                  }}
                >
                  <div>
                    <div style={{ color: '#888', fontSize: '12px' }}>
                      Energy Cost
                    </div>
                    <div style={{ fontWeight: 'bold' }}>
                      {energyCost}
                      {currentMembership && (
                        <span
                          style={{
                            color: '#4CAF50',
                            fontSize: '12px',
                            marginLeft: '0.25rem',
                          }}
                        >
                          (was {stat.energyCost})
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#888', fontSize: '12px' }}>Gain</div>
                    <div style={{ fontWeight: 'bold', color: '#4CAF50' }}>
                      +{gain}
                      {currentMembership && gain > stat.baseGain && (
                        <span
                          style={{ fontSize: '12px', marginLeft: '0.25rem' }}
                        >
                          (was +{stat.baseGain})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleTrain(stat)}
                  disabled={isTraining || !canAfford}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    backgroundColor: canAfford ? '#ff4444' : '#555',
                    color: canAfford ? '#fff' : '#888',
                    border: 'none',
                    borderRadius: '8px',
                    cursor:
                      canAfford && !isTraining ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (canAfford && !isTraining) {
                      e.currentTarget.style.backgroundColor = '#ff6666'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (canAfford && !isTraining) {
                      e.currentTarget.style.backgroundColor = '#ff4444'
                    }
                  }}
                >
                  {isTraining
                    ? 'Training...'
                    : !canAfford
                    ? 'Not Enough Energy'
                    : 'Train'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Memberships */}
      <div>
        <h2 style={{ fontSize: '24px', marginBottom: '1rem', color: '#fff' }}>
          Gym Memberships
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {memberships.map((membership) => {
            const isActive = activeMembership === membership.id
            const canAfford = user.money >= membership.price

            return (
              <div
                key={membership.id}
                style={{
                  backgroundColor: '#0f0f0f',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  border: isActive ? '2px solid #4CAF50' : '1px solid #333',
                  position: 'relative',
                }}
              >
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      backgroundColor: '#4CAF50',
                      color: '#fff',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                    }}
                  >
                    ACTIVE
                  </div>
                )}

                <div
                  style={{
                    fontSize: '48px',
                    textAlign: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  {membership.icon}
                </div>

                <h3
                  style={{
                    fontSize: '20px',
                    textAlign: 'center',
                    marginBottom: '0.5rem',
                    color: isActive ? '#4CAF50' : '#fff',
                  }}
                >
                  {membership.name}
                </h3>

                <p
                  style={{
                    fontSize: '13px',
                    color: '#888',
                    textAlign: 'center',
                    marginBottom: '1.5rem',
                  }}
                >
                  {membership.description}
                </p>

                <div
                  style={{
                    backgroundColor: '#1a1a1a',
                    padding: '1rem',
                    borderRadius: '6px',
                    marginBottom: '1rem',
                    fontSize: '14px',
                  }}
                >
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>+{membership.trainingBonus}%</strong> training gains
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>-{membership.energyCostReduction}%</strong> energy
                    cost
                  </div>
                  <div>
                    <strong>{membership.duration}</strong> days duration
                  </div>
                </div>

                <div
                  style={{
                    textAlign: 'center',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: canAfford ? '#4CAF50' : '#f44336',
                    marginBottom: '1rem',
                  }}
                >
                  ${membership.price.toLocaleString()}
                </div>

                <button
                  onClick={() => handlePurchaseMembership(membership)}
                  disabled={isActive || !canAfford}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    backgroundColor: isActive
                      ? '#4CAF50'
                      : canAfford
                      ? '#ff4444'
                      : '#555',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isActive || !canAfford ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive && canAfford) {
                      e.currentTarget.style.backgroundColor = '#ff6666'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive && canAfford) {
                      e.currentTarget.style.backgroundColor = '#ff4444'
                    }
                  }}
                >
                  {isActive
                    ? '✓ Active'
                    : !canAfford
                    ? "Can't Afford"
                    : 'Purchase'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const StatDisplay = ({
  icon,
  label,
  value,
}: {
  icon: string
  label: string
  value: number
}) => (
  <div
    style={{
      textAlign: 'center',
      padding: '1rem',
      backgroundColor: '#1a1a1a',
      borderRadius: '6px',
    }}
  >
    <div style={{ fontSize: '24px', marginBottom: '0.5rem' }}>{icon}</div>
    <div
      style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '0.25rem' }}
    >
      {value.toFixed(3)}
    </div>
    <div
      style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase' }}
    >
      {label}
    </div>
  </div>
)

export default Gym
