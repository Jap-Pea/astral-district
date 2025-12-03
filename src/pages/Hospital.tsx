// src/pages/Hospital.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useUser'
import { useEnergy } from '../hooks/useEnergy'
import { useModal } from '../hooks/useModal'
import { mockInventory } from '../services/mockData/items'
import TravelingBlocker from '../components/TravelingBlocker'

interface HospitalizedPlayer {
  id: string
  name: string
  level: number
  timeRemaining: number // in seconds
  injury: string
  health: number
  maxHealth: number
}

// Placeholder hospitalized players
const PLACEHOLDER_PATIENTS: HospitalizedPlayer[] = [
  {
    id: '1',
    name: 'ToughGuy',
    level: 15,
    timeRemaining: 600,
    injury: 'Gunshot Wound',
    health: 50,
    maxHealth: 650,
  },
  {
    id: '2',
    name: 'Scrapper',
    level: 7,
    timeRemaining: 240,
    injury: 'Knife Wounds',
    health: 120,
    maxHealth: 550,
  },
  {
    id: '3',
    name: 'Brawler',
    level: 20,
    timeRemaining: 900,
    injury: 'Severe Beating',
    health: 30,
    maxHealth: 700,
  },
  {
    id: '4',
    name: 'Runner',
    level: 5,
    timeRemaining: 180,
    injury: 'Broken Bones',
    health: 200,
    maxHealth: 525,
  },
  {
    id: '5',
    name: 'Kingpin',
    level: 30,
    timeRemaining: 1200,
    injury: 'Critical Condition',
    health: 10,
    maxHealth: 800,
  },
]

const Hospital = () => {
  const navigate = useNavigate()
  const {
    user,
    isInHospital,
    hospitalTimeRemaining,
    applyMedInHospital,
    updateUser,
  } = useUser()
  const { consumeEnergy } = useEnergy()
  const { showModal } = useModal()

  const [patients, setPatients] =
    useState<HospitalizedPlayer[]>(PLACEHOLDER_PATIENTS)
  const [helpingPatientId, setHelpingPatientId] = useState<string | null>(null)
  const [actionResult, setActionResult] = useState<string | null>(null)

  // Update patients' timers
  useEffect(() => {
    const interval = setInterval(() => {
      setPatients((prev) =>
        prev
          .map((p) => ({
            ...p,
            timeRemaining: Math.max(0, p.timeRemaining - 1),
            health: Math.min(p.health + 1, p.maxHealth), // Slowly heal
          }))
          .filter((p) => p.timeRemaining > 0 || p.health < p.maxHealth)
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Don't auto-redirect when visiting hospital
  useEffect(() => {
    if (!isInHospital && hospitalTimeRemaining === 0 && actionResult === null) {
      const timer = setTimeout(() => {
        // Only navigate if we're truly released, not just visiting
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isInHospital, hospitalTimeRemaining, navigate, actionResult])

  if (!user) return null

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getHealthPercent = (health: number, maxHealth: number) => {
    return (health / maxHealth) * 100
  }

  const getHealthColor = (percent: number) => {
    if (percent > 50) return '#4CAF50'
    if (percent > 25) return '#FFC107'
    return '#f44336'
  }

  // ========== SELF USE MED (when YOU'RE in hospital) ==========
  const handleSelfUseMed = () => {
    const firstAidKit = mockInventory.find(
      (i) => i.item.id === 'consumable_001'
    )

    if (!firstAidKit || firstAidKit.quantity === 0) {
      showModal({
        title: 'No Medical Items',
        message: "❌ You don't have any First Aid Kits in your inventory.",
        type: 'error',
        icon: '❌',
      })
      return
    }

    // Reduce hospital time by 5 minutes (300 seconds)
    applyMedInHospital(300)
    showModal({
      title: 'Used First Aid Kit',
      message: '✅ Used First Aid Kit! -5 minutes from recovery time.',
      type: 'success',
      icon: '💊',
    })
    // TODO: Decrease quantity in actual inventory
  }

  // ========== SEND MEDS TO PATIENT ==========
  const handleSendMeds = (patient: HospitalizedPlayer) => {
    const firstAidKit = mockInventory.find(
      (i) => i.item.id === 'consumable_001'
    )

    if (!firstAidKit || firstAidKit.quantity === 0) {
      showModal({
        title: 'No Medical Items',
        message: "❌ You don't have any First Aid Kits to send.",
        type: 'error',
        icon: '❌',
      })
      return
    }

    const confirmed = window.confirm(
      `Send First Aid Kit to ${patient.name}?\n\n` +
        `• Reduces their recovery time by 5 minutes\n` +
        `• You have ${firstAidKit.quantity} First Aid Kits\n\n` +
        `Are you sure?`
    )

    if (!confirmed) return

    setHelpingPatientId(patient.id)
    setActionResult(null)

    setTimeout(() => {
      // Reduce patient's time by 5 minutes (300 seconds)
      setPatients((prev) =>
        prev.map((p) =>
          p.id === patient.id
            ? { ...p, timeRemaining: Math.max(0, p.timeRemaining - 300) }
            : p
        )
      )

      setActionResult(
        `💊 SUCCESS! Sent First Aid Kit to ${patient.name}. -5 minutes from their recovery.`
      )
      setHelpingPatientId(null)

      // TODO: Decrease quantity in actual inventory
    }, 1500)
  }

  // ========== REVIVE PATIENT ==========
  const handleRevive = (patient: HospitalizedPlayer) => {
    // Check if user has medic education (placeholder - doesn't exist yet)
    const hasMedicEducation = false // TODO: user.education?.medic >= 1

    if (!hasMedicEducation) {
      showModal({
        title: 'Education Required',
        message:
          '❌ You need Medic education (level 1+) to revive patients.\n\nComplete medical courses to unlock this ability.',
        type: 'error',
        icon: '🎓',
      })
      return
    }

    if (user.energy < 55) {
      showModal({
        title: 'Not Enough Energy',
        message: '❌ You need 55 energy to revive a patient.',
        type: 'error',
        icon: '⚡',
      })
      return
    }

    const confirmed = window.confirm(
      `Revive ${patient.name}?\n\n` +
        `• Costs: 55 Energy\n` +
        `• Instantly heals them to 50% health\n` +
        `• Releases them from hospital\n\n` +
        `Are you sure?`
    )

    if (!confirmed) return

    // Consume energy
    if (!consumeEnergy(55)) {
      showModal({
        title: 'Failed',
        message: '❌ Failed to consume energy.',
        type: 'error',
        icon: '❌',
      })
      return
    }

    setHelpingPatientId(patient.id)
    setActionResult(null)

    setTimeout(() => {
      // Remove patient from hospital (they're healed!)
      setPatients((prev) => prev.filter((p) => p.id !== patient.id))

      setActionResult(
        `💉 SUCCESS! Revived ${patient.name}! They've been released from the hospital.`
      )
      setHelpingPatientId(null)
    }, 1500)
  }

  // ========== VIEW WHEN YOU'RE IN HOSPITAL ==========
  if (isInHospital) {
    const healthPercent = (user.health / user.maxHealth) * 100
    const healthColor = getHealthColor(healthPercent)

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
          <div style={{ fontSize: '64px', marginBottom: '1rem' }}>🏥</div>
          <h1
            style={{
              fontSize: '36px',
              color: '#ff4444',
              marginBottom: '0.5rem',
            }}
          >
            HOSPITALIZED
          </h1>
          <p style={{ color: '#888', marginBottom: '2rem' }}>
            You're injured and recovering. Rest up.
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
              RECOVERY TIME REMAINING
            </div>
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#ff4444',
                fontFamily: 'monospace',
              }}
            >
              {formatTime(hospitalTimeRemaining)}
            </div>
            <div
              style={{ color: '#666', fontSize: '12px', marginTop: '0.5rem' }}
            >
              ({Math.ceil(hospitalTimeRemaining / 60)} minutes)
            </div>
          </div>

          {/* Health Status */}
          <div
            style={{
              backgroundColor: '#0f0f0f',
              padding: '1.5rem',
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
              CURRENT HEALTH
            </div>
            <div
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: healthColor,
                marginBottom: '1rem',
              }}
            >
              {user.health} / {user.maxHealth}
              <span style={{ fontSize: '16px', marginLeft: '0.5rem' }}>
                ({healthPercent.toFixed(0)}%)
              </span>
            </div>

            {/* Health Bar */}
            <div
              style={{
                width: '100%',
                height: '20px',
                backgroundColor: '#333',
                borderRadius: '10px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${healthPercent}%`,
                  height: '100%',
                  backgroundColor: healthColor,
                  transition: 'width 0.3s',
                }}
              />
            </div>
          </div>

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
              <div style={{ fontSize: '11px', color: '#4CAF50' }}>
                Recovering
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#888' }}>Energy</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                {user.energy}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#888' }}>Heat</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                {user.heat}
              </div>
            </div>
          </div>

          {/* Options */}
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <button
              onClick={handleSelfUseMed}
              style={{
                padding: '1rem',
                fontSize: '16px',
                fontWeight: 'bold',
                backgroundColor: '#4CAF50',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = '#66BB6A')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = '#4CAF50')
              }
            >
              💊 Use First Aid Kit (-5 minutes)
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
              😴 Rest and recover... You'll be released automatically when
              healed.
            </div>
          </div>

          {/* Info */}
          <div
            style={{
              marginTop: '2rem',
              padding: '1rem',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              borderRadius: '8px',
              border: '1px solid #4CAF50',
            }}
          >
            <div style={{ fontSize: '14px', color: '#aaa', lineHeight: '1.6' }}>
              <strong style={{ color: '#4CAF50' }}>While in hospital:</strong>
              <br />
              • Your Heart Rate is reset to 50 BPM
              <br />
              • Health slowly recovers (5 HP/min)
              <br />
              • Energy regenerates normally
              <br />
              • Use medical items to speed recovery
              <br />• Friends can send you meds or revive you
            </div>
          </div>

          {user.health === 0 && (
            <div
              style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: 'rgba(244, 67, 54, 0.2)',
                borderRadius: '8px',
                border: '2px solid #f44336',
                color: '#f44336',
                fontWeight: 'bold',
              }}
            >
              ⚠️ CRITICAL CONDITION - You were knocked out!
            </div>
          )}
        </div>
      </div>
    )
  }

  // ========== VIEW WHEN VISITING HOSPITAL ==========
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
          <div style={{ fontSize: '64px', marginBottom: '1rem' }}>🏥</div>
          <h1
            style={{
              fontSize: '36px',
              color: '#4CAF50',
              marginBottom: '0.5rem',
            }}
          >
            CITY HOSPITAL
          </h1>
          <p style={{ color: '#888' }}>
            Help injured players recover faster... or revive them.
          </p>
        </div>

        {/* Your Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
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
                color: user.energy >= 55 ? '#4CAF50' : '#888',
              }}
            >
              {user.energy}/{user.maxEnergy}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#888' }}>
              First Aid Kits
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {mockInventory.find((i) => i.item.id === 'consumable_001')
                ?.quantity || 0}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#888' }}>
              Medic Education
            </div>
            <div
              style={{ fontSize: '20px', fontWeight: 'bold', color: '#888' }}
            >
              Not Available
            </div>
          </div>
        </div>

        {/* Result Message */}
        {actionResult && (
          <div
            style={{
              backgroundColor: actionResult.includes('SUCCESS')
                ? '#1b5e20'
                : '#b71c1c',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '2rem',
              border: `2px solid ${
                actionResult.includes('SUCCESS') ? '#4CAF50' : '#f44336'
              }`,
              textAlign: 'center',
            }}
          >
            {actionResult}
          </div>
        )}

        {/* Patients List */}
        <div>
          <h2
            style={{
              fontSize: '24px',
              marginBottom: '1rem',
              color: '#fff',
            }}
          >
            Patients ({patients.length})
          </h2>

          {patients.length === 0 ? (
            <div
              style={{
                padding: '2rem',
                textAlign: 'center',
                backgroundColor: '#0f0f0f',
                borderRadius: '8px',
                color: '#888',
              }}
            >
              🎉 No patients in the hospital right now! Everyone's healthy!
            </div>
          ) : (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              {patients.map((patient) => {
                const minutes = Math.ceil(patient.timeRemaining / 60)
                const healthPercent = getHealthPercent(
                  patient.health,
                  patient.maxHealth
                )
                const healthColor = getHealthColor(healthPercent)
                const isHelping = helpingPatientId === patient.id

                return (
                  <div
                    key={patient.id}
                    style={{
                      backgroundColor: '#0f0f0f',
                      border: '2px solid #333',
                      borderRadius: '8px',
                      padding: '1.5rem',
                      opacity: isHelping ? 0.6 : 1,
                    }}
                  >
                    {/* Patient Info Row */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '1rem',
                      }}
                    >
                      {/* Left: Name & Injury */}
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: '20px',
                            fontWeight: 'bold',
                            marginBottom: '0.5rem',
                          }}
                        >
                          {patient.name}
                          <span
                            style={{
                              marginLeft: '0.5rem',
                              fontSize: '14px',
                              color: '#888',
                            }}
                          >
                            Lv.{patient.level}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: '14px',
                            color: '#f44336',
                            marginBottom: '0.5rem',
                          }}
                        >
                          Injury: {patient.injury}
                        </div>
                        <div
                          style={{
                            fontSize: '18px',
                            color: '#ff4444',
                            fontFamily: 'monospace',
                          }}
                        >
                          ⏱ {formatTime(patient.timeRemaining)} remaining
                        </div>
                      </div>

                      {/* Right: Health Status */}
                      <div
                        style={{
                          minWidth: '200px',
                          backgroundColor: '#1a1a1a',
                          padding: '1rem',
                          borderRadius: '8px',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#888',
                            marginBottom: '0.5rem',
                          }}
                        >
                          HEALTH
                        </div>
                        <div
                          style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: healthColor,
                            marginBottom: '0.5rem',
                          }}
                        >
                          {patient.health} / {patient.maxHealth} (
                          {healthPercent.toFixed(0)}%)
                        </div>
                        <div
                          style={{
                            width: '100%',
                            height: '10px',
                            backgroundColor: '#333',
                            borderRadius: '5px',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${healthPercent}%`,
                              height: '100%',
                              backgroundColor: healthColor,
                              transition: 'width 0.3s',
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                      }}
                    >
                      {/* Send Meds Button */}
                      <button
                        onClick={() => handleSendMeds(patient)}
                        disabled={
                          !mockInventory.find(
                            (i) => i.item.id === 'consumable_001'
                          )?.quantity || isHelping
                        }
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          backgroundColor: mockInventory.find(
                            (i) => i.item.id === 'consumable_001'
                          )?.quantity
                            ? '#4CAF50'
                            : '#555',
                          color: mockInventory.find(
                            (i) => i.item.id === 'consumable_001'
                          )?.quantity
                            ? '#fff'
                            : '#888',
                          border: 'none',
                          borderRadius: '6px',
                          cursor:
                            mockInventory.find(
                              (i) => i.item.id === 'consumable_001'
                            )?.quantity && !isHelping
                              ? 'pointer'
                              : 'not-allowed',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          if (
                            mockInventory.find(
                              (i) => i.item.id === 'consumable_001'
                            )?.quantity &&
                            !isHelping
                          ) {
                            e.currentTarget.style.backgroundColor = '#66BB6A'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (
                            mockInventory.find(
                              (i) => i.item.id === 'consumable_001'
                            )?.quantity &&
                            !isHelping
                          ) {
                            e.currentTarget.style.backgroundColor = '#4CAF50'
                          }
                        }}
                      >
                        {!mockInventory.find(
                          (i) => i.item.id === 'consumable_001'
                        )?.quantity
                          ? '🔒 No First Aid Kits'
                          : '💊 Send First Aid Kit (-5 min)'}
                      </button>

                      {/* Revive Button */}
                      <button
                        onClick={() => handleRevive(patient)}
                        disabled={true} // Always disabled until education exists
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          backgroundColor: '#555',
                          color: '#888',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'not-allowed',
                          transition: 'all 0.2s',
                        }}
                      >
                        🔒 Revive (Requires Medic Education)
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
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            borderRadius: '8px',
            border: '1px solid #4CAF50',
          }}
        >
          <div style={{ fontSize: '14px', color: '#aaa', lineHeight: '1.6' }}>
            <strong style={{ color: '#4CAF50' }}>How it works:</strong>
            <br />
            <strong>Send First Aid Kit:</strong> Uses one of your First Aid Kits
            to reduce their recovery time by 5 minutes.
            <br />
            <strong>Revive:</strong> Costs 55 Energy. Instantly heals them to
            50% health and releases them from hospital. Requires Medic education
            (level 1+).
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
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#666')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#555')}
        >
          ← Back to City
        </button>
      </div>
    </div>
  )
}

export default Hospital
