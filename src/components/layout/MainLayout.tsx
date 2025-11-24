import { ReactNode, useEffect, useState } from 'react'
import { useLayoutEffect } from 'react'
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

const StatBar = ({ label, current, max, color, icon }: StatBarProps) => {
  const percentage = max > 0 ? (current / max) * 100 : 0
  const [showTooltip, setShowTooltip] = useState(false)
  // countdownMs is managed as state for rendering
  const tickMs =
    window.localStorage.getItem('astralDevFastTicks') === 'true' ? 5000 : 600000
  const [countdownMs, setCountdownMs] = useState<number | null>(null)

  // Set initial countdownMs only when tooltip is shown for the first time
  useLayoutEffect(() => {
    if (showTooltip) {
      let initialMs: number | null = null
      if (label === 'Energy' && current < max) {
        initialMs = (max - current) * tickMs
      } else if (label === 'Heat' && current > 0) {
        initialMs = current * tickMs
      }
      if (countdownMs === null) {
        setCountdownMs(initialMs)
      }
    } else {
      setCountdownMs(null)
    }
  }, [showTooltip, label, current, max, tickMs, countdownMs])

  // Calculate initial countdownMs based on stat logic
  const getInitialCountdownMs = () => {
    const tickMs =
      window.localStorage.getItem('astralDevFastTicks') === 'true'
        ? 5000
        : 600000
    if (label === 'Energy' && current < max) {
      return (max - current) * tickMs
    }
    if (label === 'Heat' && current > 0) {
      return current * tickMs
    }
    return null
  }

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

  useEffect(() => {
    if (showTooltip) {
      const interval = setInterval(() => {
        setCountdownMs((prev) => (prev !== null && prev > 0 ? prev - 1000 : 0))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [showTooltip])

  let tooltip = ''
  if (label === 'Energy' && current < max) {
    tooltip = `Regenerates in ${formatMs(countdownMs)}`
  }
  if (label === 'Heat' && current > 0) {
    tooltip = `Cools down in ${formatMs(countdownMs)}`
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
  { name: 'Home', path: '/', icon: '🏠' },
  { name: 'Crimes', path: '/crimes', icon: '🔫' },
  { name: 'Gym', path: '/gym', icon: '💪' },
  { name: 'Items', path: '/inventory', icon: '🎒' },
  { name: 'City', path: '/city', icon: '🏙️' },
  { name: 'Shops', path: '/shops', icon: '🛒' },
  { name: 'Casino', path: '/casino', icon: '🎰' },
  { name: 'StarGate', path: '/stargate', icon: '✈️' },
  { name: 'Jail', path: '/jail', icon: '⛓️' },
  { name: 'Hospital', path: '/hospital', icon: '🏥' },
  { name: 'Network', path: '/network', icon: '🌐' },
]

interface MainLayoutProps {
  children: ReactNode
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, isLoading, isInJail, isInHospital } = useUser()
  const location = useLocation()
  const navigate = useNavigate()
  const timeOfDay = getTimeOfDay()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (isInJail && location.pathname !== '/jail') {
      navigate('/jail', { replace: true })
    } else if (isInHospital && location.pathname !== '/hospital') {
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
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080"><rect fill="%23000814"/><circle cx="200" cy="200" r="1" fill="%23ffffff" opacity="0.3"/><circle cx="800" cy="400" r="1" fill="%23ffffff" opacity="0.4"/><circle cx="1200" cy="150" r="1" fill="%23ffffff" opacity="0.3"/><circle cx="400" cy="600" r="1" fill="%23ffffff" opacity="0.5"/><circle cx="1600" cy="700" r="1" fill="%23ffffff" opacity="0.3"/><circle cx="900" cy="900" r="1" fill="%23ffffff" opacity="0.4"/></svg>') center/cover fixed;
          padding: 20px;
        }

        .game-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          background: rgba(6, 24, 41, 0.95);
          border: 2px solid #1e4d7a;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
        }

        /* Top Header */
        .top-header {
          background: linear-gradient(180deg, #0a2540 0%, #061829 100%);
          border-bottom: 2px solid #1e4d7a;
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
          color: #4a9eff;
          text-shadow: 0 0 10px rgba(74, 158, 255, 0.5);
        }

        .logo-sub {
          font-size: 0.65rem;
          color: #6ba3bf;
          letter-spacing: 1px;
        }

        .player-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .info-badge {
          background: rgba(30, 77, 122, 0.6);
          border: 1px solid #1e4d7a;
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
          background: linear-gradient(180deg, #0d1b2a 0%, #071018 100%);
          border-bottom: 1px solid #1e4d7a;
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
          background: rgba(10, 37, 64, 0.6);
          border: 1px solid #1e4d7a;
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
          background: linear-gradient(180deg, #0a2540 0%, #061829 100%);
          border-bottom: 2px solid #1e4d7a;
        }

        .primary-nav {
          display: flex;
          justify-content: center;
          gap: 2px;
          padding: 0;
          flex-wrap: wrap;
        }

        .nav-item {
          background: linear-gradient(180deg, #0d3a5f 0%, #0a2540 100%);
          border-right: 1px solid #1e4d7a;
          border-left: 1px solid #0a2540;
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
          background: linear-gradient(180deg, #1e4d7a 0%, #0d3a5f 100%);
          color: #fff;
        }

        .nav-item.active {
          background: linear-gradient(180deg, #2d5a7a 0%, #1e4d7a 100%);
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
                  icon="❤️"
                />
                <StatBar
                  label="Energy"
                  current={user.energy}
                  max={user.maxEnergy}
                  color="#22c55e"
                  icon="⚡"
                />
                <StatBar
                  label="Heartrate"
                  current={user.heartRate}
                  max={user.maxHeartRate}
                  color="#fbbf24"
                  icon="💓"
                />
                <StatBar
                  label="Heat"
                  current={user.heat}
                  max={user.maxHeat}
                  color="#ef4444"
                  icon="🔥"
                />
              </div>
            </div>
          )}

          {/* Main Navigation */}
          <div className="main-nav">
            <div className="primary-nav">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="main-content">{children}</div>
        </div>
      </div>
    </>
  )
}
