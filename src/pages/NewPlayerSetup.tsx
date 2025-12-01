import React, { useState, useEffect } from 'react'

export type RaceKey = 'human' | 'gleek' | 'ortanz'
export type GenderKey = 'male' | 'female'

export type NewPlayerResult = {
  username: string
  race: RaceKey
  gender: GenderKey
  perks: Record<string, number>
  profilePic?: string
}

const LOADING_SCREENS = [
  {
    title: 'Initializing Neural Interface...',
    subtitle: 'Connecting to the Astral Network',
    icon: '🧠',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    title: 'Scanning Biometric Data...',
    subtitle: 'Analyzing genetic markers',
    icon: '🔬',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  {
    title: 'Establishing Quantum Link...',
    subtitle: 'Syncing with district mainframe',
    icon: '⚡',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  {
    title: 'Loading Character Matrix...',
    subtitle: 'Preparing your digital identity',
    icon: '🌌',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  },
]

export default function NewPlayerSetup({
  onComplete,
  initialUsername = '',
}: {
  onComplete: (result: NewPlayerResult) => void
  initialUsername?: string
}) {
  const [stage, setStage] = useState<'loading' | 'intro' | 'setup'>('loading')
  const [loadingIndex, setLoadingIndex] = useState(0)
  const [username, setUsername] = useState(initialUsername)
  const [race, setRace] = useState<RaceKey | null>(null)
  const [gender, setGender] = useState<GenderKey | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hoveredRace, setHoveredRace] = useState<RaceKey | null>(null)

  const BASE_STATS = {
    health: 100,
    strength: 1,
    defense: 1,
    dexterity: 1,
    speed: 1,
  }

  // Race image paths - Update these with your actual image paths later
  const getRaceImage = (race: RaceKey, gender: GenderKey): string => {
    const imagePaths = {
      human: {
        male: '/images/races/human-male.png',
        female: '/images/races/human-female.png',
      },
      gleek: {
        male: '/images/races/gleekMale.png', 
        female: '/images/races/gleekFemale.png',
      },
      ortanz: {
        male: '/images/races/ortanz-male.png',
        female: '/images/races/ortanz-female.png',
      },
    }

    // Placeholder fallback - replace with your images
    return imagePaths[race][gender] || `https://placehold.co/300x400/333/fff?text=${race}+${gender}`
  }

  const RACES: Record<
    RaceKey,
    {
      label: string
      description: string
      lore: string
      icon: string
      color: string
      perks: (stats: typeof BASE_STATS) => Record<string, number>
    }
  > = {
    human: {
      label: 'Human',
      description: 'Balanced and adaptable survivors',
      lore: 'Humans are the most common species in the Astral District. Their adaptability and determination make them formidable in any situation.',
      icon: '👤',
      color: '#6b7280',
      perks: (s) => ({
        maxHealth: s.health,
        strength: s.strength,
        dexterity: s.dexterity,
        defense: s.defense,
      }),
    },
    gleek: {
      label: 'Gleek',
      description: 'Agile warriors with enhanced reflexes',
      lore: 'Gleeks are known for their lightning-fast movements and precision. Their cybernetic enhancements grant superior combat capabilities.',
      icon: '⚔️',
      color: '#8b5cf6',
      perks: (s) => ({
        maxHealth: s.health,
        strength: Math.round(s.strength * 1.03),
        dexterity: Math.round(s.dexterity * 1.05),
        defense: s.defense,
      }),
    },
    ortanz: {
      label: 'Ortanz',
      description: 'Resilient giants with unmatched endurance',
      lore: 'Ortanz possess thick bio-armor and regenerative capabilities. They can withstand punishment that would kill lesser beings.',
      icon: '🛡️',
      color: '#ef4444',
      perks: (s) => ({
        maxHealth: Math.round(s.health * 1.3),
        strength: s.strength,
        dexterity: s.dexterity,
        defense: Math.round(s.defense * 1.1),
      }),
    },
  }

  // Loading screen progression
  useEffect(() => {
    if (stage !== 'loading') return

    const interval = setInterval(() => {
      setLoadingIndex((prev) => {
        if (prev >= LOADING_SCREENS.length - 1) {
          setStage('intro')
          return prev
        }
        return prev + 1
      })
    }, 1500)

    return () => clearInterval(interval)
  }, [stage])

  function validate() {
    if (!username || username.trim().length < 2) {
      setError('Please enter a name (2+ characters)')
      return false
    }
    if (username.trim().length > 20) {
      setError('Name must be 20 characters or less')
      return false
    }
    if (!gender) {
      setError('Select a gender to continue')
      return false
    }
    if (!race) {
      setError('Select a race to continue')
      return false
    }
    return true
  }

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    if (!validate() || !race || !gender) return

    const perks = RACES[race].perks(BASE_STATS)

    const result: NewPlayerResult = {
      username: username.trim(),
      race,
      gender,
      perks,
      profilePic: getRaceImage(race, gender),
    }

    onComplete(result)
  }

  function renderPreview() {
    const selected = race ? RACES[race] : null
    const perks = selected ? selected.perks(BASE_STATS) : null

    return (
      <div
        style={{
          marginTop: '1.5rem',
          padding: '1.5rem',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          animation: 'fadeIn 0.5s ease-out',
        }}
      >
        <div
          style={{
            fontSize: '0.9rem',
            color: '#6ba3bf',
            marginBottom: '1rem',
            fontWeight: '600',
          }}
        >
          📊 Character Stats Preview
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1rem',
          }}
        >
          {[
            {
              label: 'Health',
              value: perks ? perks.maxHealth : BASE_STATS.health,
              icon: '❤️',
            },
            {
              label: 'Strength',
              value: perks ? perks.strength : BASE_STATS.strength,
              icon: '💪',
            },
            {
              label: 'Dexterity',
              value: perks ? perks.dexterity : BASE_STATS.dexterity,
              icon: '🎯',
            },
            {
              label: 'Defense',
              value: perks ? perks.defense : BASE_STATS.defense,
              icon: '🛡️',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                textAlign: 'center',
                padding: '0.75rem',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                {stat.icon}
              </div>
              <div
                style={{
                  fontSize: '0.7rem',
                  color: '#6ba3bf',
                  marginBottom: '0.25rem',
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#fff',
                }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Loading Screen
  if (stage === 'loading') {
    const currentScreen = LOADING_SCREENS[loadingIndex]
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: currentScreen.gradient,
          animation: 'fadeIn 0.5s ease-out',
        }}
      >
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          @keyframes slideIn {
            from { transform: translateX(-20px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}</style>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div
            style={{
              fontSize: '5rem',
              marginBottom: '1rem',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          >
            {currentScreen.icon}
          </div>
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
              textShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}
          >
            {currentScreen.title}
          </h1>
          <p
            style={{
              fontSize: '1.2rem',
              opacity: 0.9,
              marginBottom: '2rem',
            }}
          >
            {currentScreen.subtitle}
          </p>
          <div
            style={{
              width: '300px',
              height: '4px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '2px',
              overflow: 'hidden',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                height: '100%',
                background: 'white',
                width: `${((loadingIndex + 1) / LOADING_SCREENS.length) * 100}%`,
                transition: 'width 0.5s ease-out',
                boxShadow: '0 0 10px rgba(255,255,255,0.5)',
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  // Intro Screen
  if (stage === 'intro') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a2540 0%, #061829 100%)',
          padding: '2rem',
          animation: 'fadeIn 0.8s ease-out',
        }}
      >
        <div
          style={{
            maxWidth: '700px',
            textAlign: 'center',
            color: '#6ba3bf',
          }}
        >
          <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>🌌</div>
          <h1
            style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: '#4a9eff',
              marginBottom: '1rem',
              textShadow: '0 0 30px rgba(74, 158, 255, 0.5)',
            }}
          >
            Welcome to Astral District
          </h1>
          <p
            style={{
              fontSize: '1.2rem',
              lineHeight: '1.8',
              marginBottom: '2rem',
              color: '#6ba3bf',
            }}
          >
            In the year 2847, humanity has spread across the stars. The Astral
            District is a sprawling megacity floating in deep space, where
            fortune seekers, criminals, and heroes collide. Choose your path
            wisely—every decision shapes your destiny.
          </p>
          <button
            onClick={() => setStage('setup')}
            style={{
              padding: '1rem 3rem',
              fontSize: '1.3rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(139, 92, 246, 0.4)',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)'
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(139, 92, 246, 0.6)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(139, 92, 246, 0.4)'
            }}
          >
            Create Character →
          </button>
        </div>
      </div>
    )
  }

  // Character Creation
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'url(/images/spacebg.gif) center/cover fixed, linear-gradient(135deg, #0a2540 0%, #061829 100%)',
        padding: '2rem',
        animation: 'fadeIn 0.5s ease-out',
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .race-card {
          transition: all 0.3s ease;
        }
        .race-card:hover {
          transform: translateY(-5px);
        }
        .gender-btn {
          transition: all 0.3s ease;
        }
        .gender-btn:hover {
          transform: scale(1.05);
        }
        input:focus {
          outline: none;
        }
      `}</style>

      <div
        style={{
          maxWidth: '1000px',
          width: '100%',
          background: 'rgba(10, 37, 64, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '2px solid #1e4d7a',
          borderRadius: '16px',
          padding: '3rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)',
          animation: 'fadeIn 0.5s ease-out',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2
            style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#4a9eff',
              marginBottom: '0.5rem',
              textShadow: '0 0 20px rgba(74, 158, 255, 0.5)',
            }}
          >
            Create Your Character
          </h2>
          <p style={{ color: '#6ba3bf', fontSize: '1.1rem' }}>
            Your legend begins here
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Username Input */}
          <div style={{ marginBottom: '2rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                marginBottom: '0.75rem',
                color: '#6ba3bf',
              }}
            >
              🎭 Character Name
            </label>
            <input
              style={{
                width: '100%',
                padding: '1rem 1.25rem',
                fontSize: '1.1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                transition: 'all 0.3s ease',
              }}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                if (error) setError(null)
              }}
              placeholder="Enter your character name..."
              autoFocus
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#4a9eff'
                e.currentTarget.style.boxShadow = '0 0 20px rgba(74, 158, 255, 0.3)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Gender Selection */}
          <div style={{ marginBottom: '2rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                marginBottom: '0.75rem',
                color: '#6ba3bf',
              }}
            >
              ⚧ Select Gender
            </label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {(['male', 'female'] as GenderKey[]).map((g) => {
                const active = gender === g
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      setGender(g)
                      if (error) setError(null)
                    }}
                    className="gender-btn"
                    style={{
                      flex: 1,
                      padding: '1.25rem',
                      borderRadius: '12px',
                      border: active
                        ? '2px solid #4a9eff'
                        : '2px solid rgba(255, 255, 255, 0.1)',
                      background: active
                        ? 'linear-gradient(135deg, rgba(74, 158, 255, 0.2), rgba(74, 158, 255, 0.1))'
                        : 'rgba(255, 255, 255, 0.03)',
                      color: active ? '#4a9eff' : '#6ba3bf',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      textTransform: 'capitalize',
                      boxShadow: active ? '0 8px 30px rgba(74, 158, 255, 0.3)' : 'none',
                    }}
                  >
                    {g === 'male' ? '♂ Male' : '♀ Female'}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Race Selection */}
          <div style={{ marginBottom: '2rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: '#6ba3bf',
              }}
            >
              🧬 Select Your Race
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
              }}
            >
              {(['human', 'gleek', 'ortanz'] as RaceKey[]).map((r) => {
                const meta = RACES[r]
                const active = race === r
                const hovered = hoveredRace === r
                const canShowImage = gender !== null

                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setRace(r)
                      if (error) setError(null)
                    }}
                    onMouseEnter={() => setHoveredRace(r)}
                    onMouseLeave={() => setHoveredRace(null)}
                    className="race-card"
                    style={{
                      padding: '0',
                      textAlign: 'left',
                      background: active
                        ? `linear-gradient(135deg, ${meta.color}40, ${meta.color}20)`
                        : 'rgba(255, 255, 255, 0.03)',
                      border: active
                        ? `2px solid ${meta.color}`
                        : '2px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      cursor: canShowImage ? 'pointer' : 'not-allowed',
                      boxShadow: active
                        ? `0 8px 30px ${meta.color}40`
                        : hovered
                        ? '0 8px 20px rgba(0, 0, 0, 0.5)'
                        : 'none',
                      overflow: 'hidden',
                      opacity: canShowImage ? 1 : 0.5,
                    }}
                    disabled={!canShowImage}
                  >
                    {/* Race Image */}
                    {canShowImage && gender && (
                      <div
                        style={{
                          width: '100%',
                          height: '250px',
                          overflow: 'hidden',
                          background: 'rgba(0, 0, 0, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img
                          src={getRaceImage(r, gender)}
                          alt={`${meta.label} ${gender}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            filter: active ? 'none' : 'grayscale(0.3)',
                          }}
                        />
                      </div>
                    )}

                    {/* Race Info */}
                    <div style={{ padding: '1.5rem' }}>
                      <div
                        style={{
                          fontSize: '2rem',
                          marginBottom: '0.5rem',
                        }}
                      >
                        {meta.icon}
                      </div>
                      <div
                        style={{
                          fontSize: '1.3rem',
                          fontWeight: 'bold',
                          color: active ? meta.color : '#fff',
                          marginBottom: '0.5rem',
                        }}
                      >
                        {meta.label}
                      </div>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          color: '#6ba3bf',
                          marginBottom: '0.5rem',
                        }}
                      >
                        {meta.description}
                      </div>
                      {(active || hovered) && (
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: '#6ba3bf',
                            fontStyle: 'italic',
                            lineHeight: '1.4',
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                            paddingTop: '0.75rem',
                            marginTop: '0.5rem',
                            animation: 'slideIn 0.3s ease-out',
                          }}
                        >
                          {meta.lore}
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
            {!gender && (
              <div
                style={{
                  marginTop: '1rem',
                  textAlign: 'center',
                  color: '#6ba3bf',
                  fontSize: '0.9rem',
                  fontStyle: 'italic',
                }}
              >
                💡 Select a gender first to see race images
              </div>
            )}
          </div>

          {/* Preview */}
          {race && renderPreview()}

          {/* Error Message */}
          {error && (
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: '0.9rem',
                animation: 'fadeIn 0.3s ease-out',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Action Buttons */}
          <div
            style={{
              marginTop: '2.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setUsername('')
                setRace(null)
                setGender(null)
                setError(null)
              }}
              style={{
                padding: '0.875rem 2rem',
                fontSize: '1rem',
                fontWeight: '600',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#6ba3bf',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
              }}
            >
              ↻ Reset
            </button>

            <button
              type="submit"
              style={{
                padding: '0.875rem 3rem',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                boxShadow: '0 8px 30px rgba(34, 197, 94, 0.4)',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(34, 197, 94, 0.6)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(34, 197, 94, 0.4)'
              }}
            >
              🚀 Begin Journey
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}