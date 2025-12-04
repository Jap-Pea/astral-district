//src/components/layout/MainLayout.tsx
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useUser } from '../../hooks/useUser'
import { getTimeOfDay } from '../../utils/timeOfDay'

interface StatBarProps {
  label: string
  current: number
  max: number
  color: string
  icon: ReactNode
}
interface XPBarProps {
  current: number
  required: number
  level: number
}

const XPBar = ({ current, required, level }: XPBarProps) => {
  const percentage = required > 0 ? (current / required) * 100 : 0

  return (
    <div
      style={{
        minWidth: '200px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: '#888',
        }}
      >
        <span>Level {level}</span>
        <span>
          {current.toLocaleString()} / {required.toLocaleString()} XP
        </span>
      </div>

      <div
        style={{
          width: '100%',
          height: '8px',
          background: '#0a1929',
          border: '1px solid #1e4d7a',
          borderRadius: '4px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)',
            transition: 'width 0.3s ease',
            boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
          }}
        />
      </div>
    </div>
  )
}
export default XPBar

const StatBar = ({ label, current, max, color, icon }: StatBarProps) => {
  const percentage = max > 0 ? (current / max) * 100 : 0
  const [showTooltip, setShowTooltip] = useState(false)
  const tickMs =
    window.localStorage.getItem('astralDevFastTicks') === 'true' ? 5000 : 600000
  const energyPerTick = 5
  // Use a timer to force re-render for countdown
  // Removed unused 'now' state
  useEffect(() => {
    // No timer needed since countdown is static per hover
  }, [showTooltip])

  // Format ms as h:mm:ss
  function formatMs(ms: number | null): string {
    if (ms === null) return ''
    const totalSeconds = Math.max(0, Math.floor(ms / 1000))
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`
  }

  // Calculate countdown for energy and heat
  let tooltip = ''
  if (label === 'Energy' && current < max) {
    const ticksNeeded = Math.ceil((max - current) / energyPerTick)
    const totalMs = ticksNeeded * tickMs
    tooltip = `Regenerates in ${formatMs(totalMs)}`
  }
  if (label === 'Heat' && current > 0) {
    const totalMs = current * tickMs
    tooltip = `Cools down in ${formatMs(totalMs)}`
  }

  return (
    <div
      className="resource-display"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="resource-icon">{icon}</div>
      <div className="resource-info">
        <div className="resource-label">{label}</div>
        <div className="resource-bar">
          <div
            className="resource-bar-fill"
            style={{ width: `${percentage}%`, background: color }}
          />
        </div>
        <div className="resource-value">
          {current} / {max}
        </div>
      </div>

      {showTooltip && tooltip && (
        <div className="resource-tooltip">{tooltip}</div>
      )}
    </div>
  )
}

const navItems = [
  {
    name: 'Home',
    path: '/',
    icon: <img src="images/icons/astronaut.png" alt="Home" />,
  },
  {
    name: 'Crimes',
    path: '/crimes',
    icon: <img src="images/icons/crime.png" alt="Crimes" />,
  },
  {
    name: 'Gym',
    path: '/gym',
    icon: <img src="images/icons/gym.png" alt="Gym" />,
  },
  { name: 'Items', path: '/inventory', icon: '🎒' },
  {
    name: 'City',
    path: '/city',
    icon: <img src="images/icons/city.png" alt="City" />,
  },
  {
    name: 'Shops',
    path: '/shops',
    icon: <img src="images/icons/shop.png" alt="Shops" />,
  },
  {
    name: 'Casino',
    path: '/casino',
    icon: <img src="images/icons/casino.png" alt="Casino" />,
  },
  {
    name: 'StarGate',
    path: '/stargate',
    icon: <img src="images/icons/black-hole.png" alt="Gym" />,
  },
  {
    name: 'Jail',
    path: '/jail',
    icon: <img src="images/icons/jail.png" alt="Jail" />,
  },
  {
    name: 'Hospital',
    path: '/hospital',
    icon: <img src="images/icons/hospital.png" alt="Hospital" />,
  },
  { name: 'Network', path: '/network', icon: '🌐' },
  {
    name: 'Combat',
    path: '/combat',
    icon: '⚔️',
  },
]

interface MainLayoutProps {
  children: ReactNode
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, isLoading, isInJail, isInHospital, isTraveling } = useUser()
  const location = useLocation()
  const navigate = useNavigate()
  const timeOfDay = getTimeOfDay()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  // Restrict access when jailed/hospitalized but allow Home and Items
  useEffect(() => {
    const jailWhitelist = ['/', '/inventory', '/jail']
    const hospitalWhitelist = ['/', '/inventory', '/hospital']

    if (isInJail && !jailWhitelist.includes(location.pathname)) {
      navigate('/jail', { replace: true })
    } else if (isInHospital && !hospitalWhitelist.includes(location.pathname)) {
      navigate('/hospital', { replace: true })
    }
  }, [isInJail, isInHospital, navigate, location.pathname])

  if (isLoading) {
    return <div className="loading">Loading...</div>
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          background: #000;
          font-family: 'Verdana', 'Arial', sans-serif;
          color: #6ba3bf;
          overflow-x: hidden;
        }

        .layout-container {
          min-height: 100vh;
          background: url('/images/spacebg.gif') center/cover fixed;
          padding: 20px;
        }

        .game-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          background: rgba(6, 24, 41, 0.25); /* Layer 1: Most transparent */
          border: 2px solid rgba(30, 77, 122, 0.4);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.9);
        }

        /* Top Header */
        .top-header {
          background: linear-gradient(180deg, rgba(10, 37, 64, 0.5) 0%, rgba(6, 24, 41, 0.5) 100%); /* Layer 2: Medium transparency */
          border-bottom: 2px solid rgba(30, 77, 122, 0.5);
          padding: 10px 20px;
        }

        .top-header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .logo {
          font-size: 1.6rem;
          font-weight: bold;
          letter-spacing: 3px;
          background: linear-gradient(90deg, #4a9eff, #74c3ff);
          -webkit-background-clip: text;
          color: transparent;
          text-shadow: 0 0 12px rgba(74, 158, 255, 0.4);
        }

        .logo-sub {
          font-size: 0.65rem;
          color: #8ab9d4;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          opacity: 0.85;
      }

        .player-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .info-badge {
          background: rgba(30, 77, 122, 0.75); /* Layer 3: Least transparent */
          border: 1px solid rgba(30, 77, 122, 0.8);
          padding: 5px 12px;
          border-radius: 3px;
          font-size: 0.8rem;
          color: #6ba3bf;
        }

        .player-name {
          font-weight: bold;
          color: #fff;
        }

        .money-badge {
          color: #22c55e;
          font-weight: bold;
        }

        /* Resources Bar */
        .resources-bar {
          background: linear-gradient(180deg, rgba(13, 27, 42, 0.5) 0%, rgba(7, 16, 24, 0.5) 100%); /* Layer 2: Medium transparency */
          border-bottom: 1px solid rgba(30, 77, 122, 0.5);
          padding: 10px 20px;
        }

        .resources-content {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .resource-display {
          display: flex;
          gap: 8px;
          align-items: center;
          background: rgba(10, 37, 64, 0.75); /* Layer 3: Least transparent */
          border: 1px solid rgba(30, 77, 122, 0.8);
          border-radius: 4px;
          padding: 6px 10px;
          position: relative;
        }

        .resource-icon {
          font-size: 1.3rem;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .resource-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .resource-label {
          font-size: 0.65rem;
          color: #6ba3bf;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .resource-bar {
          width: 90px;
          height: 7px;
          background: #0a1929;
          border: 1px solid #1e4d7a;
          border-radius: 2px;
          overflow: hidden;
        }

        .resource-bar-fill {
          height: 100%;
          transition: width 0.3s ease;
          box-shadow: 0 0 8px currentColor;
        }

        .resource-value {
          font-size: 0.7rem;
          color: #fff;
          font-weight: bold;
        }

        .resource-tooltip {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          background: #0a2540;
          border: 1px solid #1e4d7a;
          color: #6ba3bf;
          border-radius: 4px;
          padding: 6px 10px;
          font-size: 0.7rem;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.7);
          z-index: 1000;
          pointer-events: none;
        }

        .resource-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 5px solid transparent;
          border-top-color: #1e4d7a;
        }

        /* Main Navigation */
        .main-nav {
          background: linear-gradient(180deg, rgba(10, 37, 64, 0.5) 0%, rgba(6, 24, 41, 0.5) 0.2%); /* Layer 2: Medium transparency */
          border-bottom: 2px solid rgba(30, 77, 122, 0.5);
        }

        .primary-nav {
          display: flex;
          justify-content: center;
          gap: 2px;
          padding: 0;
          flex-wrap: wrap;
        }

        .nav-item {
          background: linear-gradient(180deg, rgba(13, 58, 95, 0.75) 0%, rgba(10, 37, 64, 0.75) 0%); /* Layer 3: Least transparent */
          border-right: 1px solid rgba(30, 77, 122, 0.8);
          border-left: 1px solid rgba(10, 37, 64, 0.8);
          color: #6ba3bf;
          text-decoration: none;
          padding: 10px 16px;
          font-size: 0.8rem;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: all 0.2s;
          position: relative;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .nav-item:hover {
          background: linear-gradient(180deg, rgba(30, 77, 122, 0.85) 0%, rgba(13, 58, 95, 0.85) 100%);
          color: #fff;
        }

        .nav-item.active {
          background: linear-gradient(180deg, rgba(45, 90, 122, 0.9) 0%, rgba(30, 77, 122, 0.9) 100%);
          color: #fff;
          border-bottom: 3px solid #4a9eff;
        }

        .nav-icon {
          font-size: 1rem;
        }

        /* Main Content Area */
        .main-content {
          padding: 20px;
          min-height: 400px;
          background: rgba(10, 37, 64, 0.2); 
        }

        .loading {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: #6ba3bf;
        }

        @media (max-width: 968px) {
          .layout-container {
            padding: 10px;
          }

          .game-wrapper {
            border-radius: 0;
          }

          .player-info {
            flex-wrap: wrap;
            gap: 8px;
          }

          .primary-nav {
            flex-wrap: wrap;
          }

          .nav-item {
            flex: 1 1 auto;
            min-width: 80px;
            justify-content: center;
            font-size: 0.7rem;
            padding: 8px 12px;
          }
        }
      `}</style>

      <div className="layout-container">
        <div className="game-wrapper">
          {/* Top Header */}
          <div className="top-header">
            <div className="top-header-content">
              <div className="logo-section">
                <div>
                  <div className="logo">ASTRAL</div>
                  <div className="logo-sub">DISTRICT</div>
                </div>
              </div>

              <div className="player-info">
                <div className="info-badge">
                  {timeOfDay === 'night' ? '🌙' : '☀️'}{' '}
                  {now.toLocaleTimeString()}
                </div>
                {user && (
                  <>
                    <div className="info-badge">Lv.{user.level}</div>
                    <XPBar
                      current={user.experience}
                      required={user.experienceToNext}
                      level={user.level}
                    />
                    <div className="info-badge player-name">
                      {user.username}
                    </div>
                    <div className="info-badge money-badge">
                      ${user.money.toLocaleString()}
                    </div>
                    <div className="info-badge">
                      📍 {user.location.toUpperCase()}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Resources Bar */}
          {user && (
            <div className="resources-bar">
              <div className="resources-content">
                <StatBar
                  label="Health"
                  current={user.health}
                  max={user.maxHealth}
                  color="#38bdf8"
                  icon={<img src="images/icons/health.png" alt="Health" />}
                />
                <StatBar
                  label="Energy"
                  current={user.energy}
                  max={user.maxEnergy}
                  color="#22c55e"
                  icon={<img src="images/icons/energy.png" alt="Energy" />}
                />
                <StatBar
                  label="Heartrate"
                  current={user.heartRate}
                  max={user.maxHeartRate}
                  color="#fbbf24"
                  icon={
                    <img src="images/icons/heartbeat.png" alt="Heart Rate" />
                  }
                />
                <StatBar
                  label="Heat"
                  current={user.heat}
                  max={user.maxHeat}
                  color="#ef4444"
                  icon={<img src="images/icons/policeHeat.png" alt="Heat" />}
                />
              </div>
            </div>
          )}

          {/* Main Navigation */}
          <div className="main-nav">
            <div className="primary-nav">
              {navItems.map((item) => {
                // Block navigation to Shops and Casino if traveling
                const travelingBlocked =
                  isTraveling &&
                  (item.path === '/shops' || item.path === '/casino')

                // Additional gating: while in jail/hospital only allow Home + Items + own state page
                const jailWhitelist = ['/', '/inventory', '/jail']
                const hospitalWhitelist = ['/', '/inventory', '/hospital']
                const jailBlocked =
                  isInJail && !jailWhitelist.includes(item.path)
                const hospitalBlocked =
                  isInHospital && !hospitalWhitelist.includes(item.path)

                const isBlocked =
                  travelingBlocked || jailBlocked || hospitalBlocked

                return isBlocked ? (
                  <span
                    key={item.path}
                    className="nav-item nav-item--disabled"
                    style={{
                      opacity: 0.5,
                      pointerEvents: 'none',
                      cursor: 'not-allowed',
                    }}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span>{item.name}</span>
                  </span>
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-item ${
                      isActive(item.path) ? 'active' : ''
                    }`}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="main-content">{children}</div>
        </div>
      </div>
    </>
  )
}
