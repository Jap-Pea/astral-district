import React, { useState, useEffect } from 'react'
import { TechLoader } from '../components/TechLoader'
import GlitchButton from '../components/ui/GlitchButton'

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
    icon: '🔗',
    gradient: 'linear-gradient(135deg, #1a0033 0%, #2d1b69 100%)',
  },
  {
    title: 'Scanning Biometric Data...',
    subtitle: 'Analyzing genetic markers',
    icon: '🧬',
    gradient: 'linear-gradient(135deg, #0f0033 0%, #4a1a7a 100%)',
  },
  {
    title: 'Establishing Quantum Link...',
    subtitle: 'Syncing with district mainframe',
    icon: '⚛️',
    gradient: 'linear-gradient(135deg, #1a0052 0%, #3d2694 100%)',
  },
  {
    title: 'Loading Character Matrix...',
    subtitle: 'Preparing your digital identity',
    icon: '👤',
    gradient: 'linear-gradient(135deg, #0a001a 0%, #5c2bb8 100%)',
  },
]

const INTRO_TEXT = `It's the year 2187, the Astral District Corporation controls trade, security, and information across the outer colonies. Its influence reaches every orbital station and drifting habitat. In the shadows of this corporate empire, crime syndicates rise, fortunes are stolen, and power changes hands by force. Build your network. Claim your territory. Decide how far you're willing to go`

export default function NewPlayerSetup({
  onComplete,
  initialUsername = '',
}: {
  onComplete: (result: NewPlayerResult) => void
  initialUsername?: string
}) {
  const [stage, setStage] = useState<
    'splash' | 'astral' | 'intro' | 'setup' | 'loading'
  >('splash')
  const [loadingIndex, setLoadingIndex] = useState(0)
  const [showIntroButton, setShowIntroButton] = useState(false)
  const [introText, setIntroText] = useState('')
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
        male: '/images/races/humanMale.png',
        female: '/images/races/humanFemale.png',
      },
      gleek: {
        male: '/images/races/gleekMale.png',
        female: '/images/races/gleekFemale.png',
      },
      ortanz: {
        male: '/images/races/ortanzMale.png',
        female: '/images/races/ortanzFemale.png',
      },
    }

    // Placeholder fallback - replace with your images
    return (
      imagePaths[race][gender] ||
      `https://placehold.co/300x400/333/fff?text=${race}+${gender}`
    )
  }

  const RACES: Record<
    RaceKey,
    {
      label: string
      description: string
      lore: string
      color: string
      perks: (stats: typeof BASE_STATS) => Record<string, number>
    }
  > = {
    human: {
      label: 'Human',
      description: 'Balanced and adaptable survivors',
      lore: 'Humans are the most common species in the Astral District. Their adaptability and determination make them formidable in any situation.',
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
      color: '#8b5cf6',
      perks: () => ({
        maxHealth: 85,
        strength: 1.5,
        dexterity: 1.2,
        defense: 0.7,
      }),
    },
    ortanz: {
      label: 'Ortanz',
      description: 'Resilient giants with unmatched endurance',
      lore: 'Ortanz possess thick bio-armor and regenerative capabilities. They can withstand punishment that would kill lesser beings.',
      color: '#ef4444',
      perks: () => ({
        maxHealth: 120,
        strength: 0.8,
        dexterity: 0.8,
        defense: 1.5,
      }),
    },
  }

  // Splash screen - auto advance after animation
  useEffect(() => {
    if (stage === 'splash') {
      const timer = setTimeout(() => {
        setStage('astral')
      }, 6000) // 6 seconds total (3s visible + 2s fade out)
      return () => clearTimeout(timer)
    }
  }, [stage])

  // ASTRAL.gif screen - auto advance after animation
  useEffect(() => {
    if (stage === 'astral') {
      const timer = setTimeout(() => {
        setStage('intro')
      }, 8000) // 8 seconds for ASTRAL.gif with fade out
      return () => clearTimeout(timer)
    }
  }, [stage])

  // Typewriter effect for intro text
  useEffect(() => {
    if (stage === 'intro') {
      let currentIndex = 0
      const interval = setInterval(() => {
        if (currentIndex <= INTRO_TEXT.length) {
          setIntroText(INTRO_TEXT.slice(0, currentIndex))
          currentIndex++
        } else {
          clearInterval(interval)
          setShowIntroButton(true)
        }
      }, 50) // Typing speed
      return () => clearInterval(interval)
    }
  }, [stage])

  // Loading screen progression (after character setup)
  useEffect(() => {
    if (stage !== 'loading') return

    const interval = setInterval(() => {
      setLoadingIndex((prev) => {
        if (prev >= LOADING_SCREENS.length - 1) {
          // After loading screens complete, call onComplete with character data
          if (race && gender) {
            const perks = RACES[race].perks(BASE_STATS)
            const result: NewPlayerResult = {
              username: username.trim(),
              race,
              gender,
              perks,
              profilePic: getRaceImage(race, gender),
            }
            setTimeout(() => onComplete(result), 500) // Small delay before transitioning
          }
          return prev
        }
        return prev + 1
      })
    }, 2500)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, race, gender, username, onComplete])

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

    // Start loading screens, will call onComplete after they finish
    setLoadingIndex(0)
    setStage('loading')
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
          Character Stats Preview
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
            },
            {
              label: 'Strength',
              value: perks ? perks.strength : BASE_STATS.strength,
            },
            {
              label: 'Dexterity',
              value: perks ? perks.dexterity : BASE_STATS.dexterity,
            },
            {
              label: 'Defense',
              value: perks ? perks.defense : BASE_STATS.defense,
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

  // Splash Screen with IndaiGo logo
  if (stage === 'splash') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000000',
          animation:
            'fadeInSlow 1.5s ease-in, fadeOutSlow 2s ease-out 3s forwards',
          flexDirection: 'column',
        }}
      >
        <style>{`
          @keyframes fadeInSlow {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fadeOutSlow {
            from { opacity: 1; }
            to { opacity: 0; }
          }
          @keyframes logoGlow {
            0%, 100% { 
              filter: drop-shadow(0 0 20px rgba(107, 163, 191, 0.3));
              transform: scale(1);
            }
            50% { 
              filter: drop-shadow(0 0 40px rgba(107, 163, 191, 0.6));
              transform: scale(1.02);
            }
          }
        `}</style>
        <div
          style={{
            textAlign: 'center',
            animation: 'logoGlow 5s ease-in-out infinite',
          }}
        >
          <img
            src="/images/IndaiGoCopy.png"
            alt="IndaiGo - Astral District"
            style={{
              width: '500px',
              height: 'auto',
              maxWidth: '90vw',
            }}
          />
        </div>
        <div
          style={{
            fontSize: '2rem',
            color: '#4a9eff',
            fontWeight: 'bold',
            marginTop: '2rem',
            textShadow: '0 0 20px rgba(74, 158, 255, 0.5)',
            textAlign: 'center',
          }}
        >
          Games Presents
        </div>
      </div>
    )
  }

  // ASTRAL.gif Screen
  if (stage === 'astral') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000000',
          animation:
            'fadeInSlowSmooth 3s ease-in-out, fadeOutSmooth 2.5s ease-out 4s forwards',
        }}
      >
        <style>{`
          @keyframes fadeInSlowSmooth {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fadeOutSmooth {
            from { opacity: 1; }
            to { opacity: 0; }
          }
        `}</style>
        <div style={{ textAlign: 'center' }}>
          <img
            src="/images/ASTRAL.gif"
            alt="Astral District"
            style={{ width: '600px', height: '600px', maxWidth: '100vw' }}
          />
        </div>
      </div>
    )
  }

  // Loading Screen
  if (stage === 'loading') {
    const currentScreen = LOADING_SCREENS[loadingIndex]
    const progress = ((loadingIndex + 1) / LOADING_SCREENS.length) * 100

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000000',
          position: 'relative',
        }}
      >
        {/* Tech Loader with embedded text */}
        <TechLoader
          title={currentScreen.title}
          subtitle={currentScreen.subtitle}
          progress={progress}
        />
      </div>
    )
  }

  // Intro Screen with typewriter effect
  if (stage === 'intro') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000000',
          padding: '0rem',
          animation: 'fadeInSmooth 2s ease-in-out',
        }}
      >
        <style>{`
          @keyframes fadeInSmooth {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes typing {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes buttonSlide {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        <div
          style={{
            maxWidth: '800px',
            width: '100%',
            padding: '3rem',
            background:
              'linear-gradient(135deg, rgba(10, 37, 64, 0.95), rgba(6, 24, 41, 0.95))',
            border: '2px solid #1e4d7a',
            borderRadius: '1rem',
            textAlign: 'center',
            color: '#6ba3bf',
            animation: 'slideUp 1s ease-out',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)',
          }}
        >
          <div
            style={{
              fontSize: '2rem',
              marginBottom: '-8rem',
              marginTop: '-5rem',
            }}
          >
            <img
              src="images/astraldistrict.png"
              alt="Astral District"
              style={{ width: '400px', height: '600px' }}
            />
          </div>

          <p
            style={{
              fontSize: '1.2rem',
              lineHeight: '1.5',
              marginBottom: '0.8rem',
              color: '#6ba3bf',
              minHeight: '200px',
              textAlign: 'left',
              fontFamily: 'monospace',
            }}
          >
            {introText}
            {introText.length < INTRO_TEXT.length && (
              <span
                style={{
                  animation: 'typing 0.3s infinite',
                  marginLeft: '2px',
                }}
              >
                ▊
              </span>
            )}
          </p>
          {showIntroButton && (
            <GlitchButton onClick={() => setStage('setup')}>
              Sign Up
            </GlitchButton>
          )}
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
        background: '#000000',
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
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
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
          background:
            'linear-gradient(135deg, rgba(10, 37, 64, 0.95), rgba(6, 24, 41, 0.95))',
          backdropFilter: 'blur(20px)',
          border: '2px solid #1e4d7a',
          borderRadius: '1rem',
          padding: '3rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)',
          animation: 'slideUp 0.8s ease-out',
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
              Character Name
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
                e.currentTarget.style.boxShadow =
                  '0 0 20px rgba(74, 158, 255, 0.3)'
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
                      boxShadow: active
                        ? '0 8px 30px rgba(74, 158, 255, 0.3)'
                        : 'none',
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
              Select Your Race
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
                Select a gender first to see race images
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

            <GlitchButton type="submit">Begin Journey</GlitchButton>
          </div>
        </form>
      </div>
    </div>
  )
}
