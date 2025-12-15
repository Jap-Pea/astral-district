// src/pages/CockpitHome.tsx - Cockpit Overlay Version
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useUser'
import { useModal } from '../hooks/useModal'
import { useProfileImage } from '../hooks/useProfileImage'
import ShipViewer from '../components/ShipViewer'
import type { Ship } from '../types/user.types'
import { formatGameTime } from '../utils/timeFormatters'
import { SelfDestructButton } from '../components/SelfDestructButton'
import '../styles/Home.css'

const Home = () => {
  const navigate = useNavigate()
  const { user, updateUser, startDocking, startUndocking, getFuelCount } =
    useUser()
  const { showModal } = useModal()
  const { fileInputRef, uploadingImage, handleImageClick, handleImageUpload } =
    useProfileImage()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  )
  const [avatarOffset, setAvatarOffset] = useState(
    user?.profilePicOffset || { x: 0, y: 0 }
  )
  const [showMenu, setShowMenu] = useState(false)
  const [menuClosing, setMenuClosing] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const handleResetGame = () => {
    localStorage.clear()
    window.location.reload()
  }

  // If docked, redirect to dashboard
  useEffect(() => {
    if (user && user.isDocked && !user.isDocking) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Slow down Earth orbit video
  useEffect(() => {
    const video = document.querySelector(
      '.earth-orbit-video'
    ) as HTMLVideoElement
    if (video) {
      video.playbackRate = 0.8 // Adjust this value: 0.5 = half speed, 0.25 = quarter speed, 2 = double speed
    }
  }, [])

  // Scale cockpit to fit viewport while maintaining aspect ratio
  useEffect(() => {
    const scaleCockpit = () => {
      const wrapper = document.querySelector('.cockpit-wrapper') as HTMLElement
      if (!wrapper) return

      const baseWidth = 1920
      const baseHeight = 1080
      const scaleX = window.innerWidth / baseWidth
      const scaleY = window.innerHeight / baseHeight
      const scale = Math.min(scaleX, scaleY)

      wrapper.style.transform = `scale(${scale})`
      wrapper.style.left = `${(window.innerWidth - baseWidth * scale) / 2}px`
      wrapper.style.top = `${(window.innerHeight - baseHeight * scale) / 2}px`
    }

    scaleCockpit()
    window.addEventListener('resize', scaleCockpit)
    return () => window.removeEventListener('resize', scaleCockpit)
  }, [])

  if (!user) return null

  const avatarSrc = user.profilePic || '/images/me.png'
  const userShip: Ship = (user.ship as Ship) || {
    name: 'Ship McShipface',
    hull: 85,
    maxHull: 100,
    shields: 60,
    maxShields: 50,
    cargo: [],
    cargoCapacity: 12,
  }

  // Cockpit layout
  return (
    <>
      <div
        className="cockpit-wrapper"
        onClick={() => {
          if (showMenu) {
            setMenuClosing(true)
            setTimeout(() => {
              setShowMenu(false)
              setMenuClosing(false)
            }, 300)
          }
        }}
      >
        {/* Dashboard Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            navigate('/dashboard')
          }}
          className="layout-toggle-btn"
        >
          Dashboard View
        </button>

        {/* Docking Controls Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (user.isDocking) {
              alert(
                `Docking procedure in progress: ${user.dockingTimeRemaining}s remaining`
              )
            } else if (user.isDocked) {
              if (startUndocking()) {
                alert('Undocking sequence initiated')
              }
            } else {
              if (!startDocking()) {
                const highHeat = user.heat >= 80
                const fine = highHeat ? 5000 : 100
                alert(`Cannot dock. Need $${fine} for docking fees.`)
              }
            }
          }}
          className="layout-toggle-btn"
          style={{
            top: '120px',
            backgroundColor: user.isDocked
              ? '#1e40af'
              : user.isDocking
              ? '#f59e0b'
              : '#059669',
          }}
        >
          {user.isDocking
            ? `⏳ ${user.isDocked ? 'Undocking' : 'Docking'}... ${
                user.dockingTimeRemaining
              }s`
            : user.isDocked
            ? '🚀 Undock'
            : '🛬 Dock at Station'}
        </button>

        {/* Background Video - Conditional based on docking state */}
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            top: '-100px',
            left: 0,
            width: '100%',
            height: '90%',
            objectFit: 'fill',
            zIndex: 0,
          }}
          className="earth-orbit-video"
        >
          <source
            src={
              user.isDocking
                ? '/images/videos/docking.mp4'
                : '/images/videos/spacestation.mp4'
            }
            type="video/mp4"
          />
        </video>

        {/* Docking/Undocking Blocker */}
        {user.isDocking && (
          <>
            {/* Fullscreen overlay to block all interactions and scrolling */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 999,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                pointerEvents: 'all',
                overflow: 'hidden',
              }}
              onWheel={(e) => e.preventDefault()}
              onTouchMove={(e) => e.preventDefault()}
            />

            {/* Status Overlay */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1000,
                textAlign: 'center',
                padding: '3rem',
                background: 'rgba(0, 0, 0, 0.9)',
                border: '2px solid #f59e0b',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 0 30px rgba(245, 158, 11, 0.5)',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                {user.isDocked ? '🚀' : '🛬'}
              </div>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#fbbf24',
                  marginBottom: '0.5rem',
                }}
              >
                {user.isDocked
                  ? 'Undocking in Progress'
                  : 'Docking in Progress'}
              </div>
              <div
                style={{
                  fontSize: '2.5rem',
                  color: '#fff',
                  fontWeight: 'bold',
                }}
              >
                {user.dockingTimeRemaining}s
              </div>
              <div
                style={{ fontSize: '0.9rem', color: '#aaa', marginTop: '1rem' }}
              >
                Please stand by...
              </div>
            </div>
          </>
        )}

        {/* Cockpit Foreground Image */}
        <div
          className="cockpit-bg"
          style={{ backgroundImage: 'url(/images/cockpit-bg.png)' }}
        />

        {/* Top Left - Profile Card & Picture */}
        <div className="profile-screen-cockpit">
          <div className="card-border">
            <div className="card-bg">
              <div className="profile-pic" style={{ userSelect: 'none' }}>
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    minHeight: 200,
                    minWidth: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseDown={(e) => {
                    setDragging(true)
                    setDragStart({
                      x: e.clientX - avatarOffset.x,
                      y: e.clientY - avatarOffset.y,
                    })
                  }}
                  onMouseUp={() => setDragging(false)}
                  onMouseLeave={() => setDragging(false)}
                  onMouseMove={(e) => {
                    if (dragging && dragStart) {
                      const newOffset = {
                        x: e.clientX - dragStart.x,
                        y: e.clientY - dragStart.y,
                      }
                      setAvatarOffset(newOffset)
                      updateUser({ profilePicOffset: newOffset })
                    }
                  }}
                >
                  <img
                    src={avatarSrc}
                    alt={user.username}
                    style={{
                      position: 'absolute',
                      left: avatarOffset.x,
                      top: avatarOffset.y,
                      width: '130%',
                      height: '130%',
                      objectFit: 'contain',
                      cursor: 'grab',
                      borderRadius: '0',
                      boxShadow: '0 0 8px #0008',
                    }}
                    draggable={false}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
              <strong className="viper">ASTRAL</strong>
              <div id="text-border" className="viper">
                DISTRICT
              </div>
              <div id="text-ext" className="viper">
                ID-743623
              </div>
              <div className="marquee">
                <div className="marquee__inner">
                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#57ff95"
                      strokeWidth="1"
                    />
                  </svg>
                </div>
              </div>
              <div id="blur-area" />
              <div className="mist-container">
                <div className="mist" />
              </div>
            </div>
          </div>
          <button
            className="edit-profile-btn"
            onClick={handleImageClick}
            disabled={uploadingImage}
          >
            {uploadingImage ? '⏳ Uploading...' : 'Edit Profile Pic'}
          </button>
        </div>

        {/* Top Right - 3D Ship Viewer Hologram */}
        <div className="ship-hologram">
          <ShipViewer
            src="/models/light_fighter_spaceship_-_free_-.glb"
            height="100%"
            width="100%"
            autoRotate={true}
            initialScale={0.3}
            background="transparent"
          />
        </div>

        {/* Fuel Reserve Hologram - Left Side */}
        <div className="fuel-hologram">
          <div className="fuel-hologram-inner">
            <div className="fuel-title">FUEL RESERVES</div>
            <div className="fuel-types">
              <div className="fuel-type-row">
                <span className="fuel-type-label">ION</span>
                <span className="fuel-type-value">{getFuelCount('ion')}</span>
              </div>
              <div className="fuel-type-row">
                <span className="fuel-type-label">FUSION</span>
                <span className="fuel-type-value">
                  {getFuelCount('fusion')}
                </span>
              </div>
              <div className="fuel-type-row">
                <span className="fuel-type-label">QUANTUM</span>
                <span className="fuel-type-value">
                  {getFuelCount('quantum')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Player Stats - Opposite side of profile */}
        <div className="screen player-stats-screen">
          <div className="screen-inner">
            <div className="stat-row">
              <span className="stat-label">Astral Credit</span>
              <span className="stat-value">${user.money.toLocaleString()}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Energy</span>
              <span className="stat-value">
                {user.energy}/{user.maxEnergy}
              </span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Health</span>
              <span className="stat-value">
                {user.health}/{user.maxHealth}
              </span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Heart Rate</span>
              <span className="stat-value">
                {user.heartRate}/{user.maxHeartRate}
              </span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Heat</span>
              <span className="stat-value">
                {user.heat}/{user.maxHeat}
              </span>
            </div>
          </div>
        </div>

        {/* Top Center - Clock & Systems */}
        <div className="screen clock-screen">
          <div className="clock-display">{formatGameTime(currentTime)}</div>
        </div>

        {/* Level Progress Indicator */}
        <div className="level-progress-container">
          <div className="level-percentage">
            {Math.round((user.experience / user.experienceToNext) * 100)}%
          </div>
          <svg width="120" height="120" viewBox="-100 -100 200 200">
            <mask id="progress-mask">
              <rect width="300" height="300" />
              <circle
                id="progressRing"
                r="96"
                fill="none"
                stroke="#fff"
                strokeWidth="7"
                strokeDasharray="100 100"
                strokeDashoffset={
                  100 - (user.experience / user.experienceToNext) * 100
                }
                pathLength="100"
              />
            </mask>
            <circle
              className="outer-circle-level"
              cx="0"
              cy="0"
              r="99"
              pathLength="64"
            />
            <circle
              className="outer-circle-bars-l"
              cx="0"
              cy="0"
              r="96"
              pathLength="64"
            />
            <circle
              className="outer-circle-bars-r"
              cx="0"
              cy="0"
              r="96"
              pathLength="64"
            />
            <circle
              className="inner-progress-circle"
              mask="url(#progress-mask)"
              cx="0"
              cy="0"
              r="96"
              pathLength="64"
              transform="rotate(-90 0 0)"
            />
            <circle
              className="inner-half-circle"
              cx="0"
              cy="0"
              r="80"
              pathLength="50"
            />
            <circle
              className="center-outer-circle"
              cx="0"
              cy="0"
              r="73"
              pathLength="50"
            />
            <circle
              className="center-inner-circle-second"
              cx="0"
              cy="0"
              r="67"
              pathLength="100"
            />
            <circle
              className="center-inner-circle-3"
              cx="0"
              cy="0"
              r="65"
              pathLength="100"
            />
            <circle
              className="center-inner-circle-3-dashed-vertical"
              cx="0"
              cy="0"
              r="61"
              pathLength="64"
            />
            <circle
              className="center-inner-circle-3-dashed"
              cx="0"
              cy="0"
              r="61"
              pathLength="100"
            />
            <circle
              className="center-inner-circle-2"
              cx="0"
              cy="0"
              r="58"
              pathLength="100"
            />
            <circle
              className="center-inner-circle-1"
              cx="0"
              cy="0"
              r="55"
              pathLength="100"
            />
            <circle
              className="center-inner-circle-0"
              cx="0"
              cy="0"
              r="35"
              pathLength="40"
            />
            <rect
              className="small-rectangles"
              x="-1.5"
              y="-68"
              width="4"
              height="4"
              rx="1"
            />
            <rect
              className="small-rectangles"
              x="-2.5"
              y="64"
              width="4"
              height="4"
              rx="1"
            />
            <rect
              className="small-rectangles"
              x="-68"
              y="-2.5"
              width="4"
              height="4"
              rx="1"
            />
            <rect
              className="small-rectangles"
              x="64"
              y="-1.5"
              width="4"
              height="4"
              rx="1"
            />
            <rect
              className="small-rectangles"
              x="-48"
              y="-49"
              width="4"
              height="4"
              rx="1"
            />
            <rect
              className="small-rectangles"
              x="45"
              y="-48"
              width="4"
              height="4"
              rx="1"
            />
            <rect
              className="small-rectangles"
              x="45"
              y="46"
              width="4"
              height="4"
              rx="1"
            />
            <rect
              className="small-rectangles"
              x="-49"
              y="44"
              width="4"
              height="4"
              rx="1"
            />
          </svg>
        </div>

        {/* Center Left - Location */}
        <div className="screen location-screen">
          <div className="screen-inner">
            <div className="location-planet">
              Location -{' '}
              {(user.location || 'Earth').charAt(0).toUpperCase() +
                (user.location || 'Earth').slice(1).toLowerCase()}
            </div>
          </div>
        </div>

        {/* Center Main - Ship Stats & Actions */}
        <div className="screen center-main-screen">
          <div className="screen-inner">
            <div className="ship-stat">
              <span className="stat-label-inline">Hull</span>
              <div className="ship-bar">
                <div
                  className="ship-bar-fill"
                  style={{
                    width: `${(userShip.hull / userShip.maxHull) * 100}%`,
                    background: '#00ff88',
                  }}
                />
              </div>
              <span className="stat-value-inline">
                {userShip.hull}/{userShip.maxHull}
              </span>
            </div>
            <div className="ship-stat">
              <span className="stat-label-inline">Shields</span>
              <div className="ship-bar">
                <div
                  className="ship-bar-fill"
                  style={{
                    width: `${(userShip.shields / userShip.maxShields) * 100}%`,
                    background: '#00d9ff',
                  }}
                />
              </div>
              <span className="stat-value-inline">
                {userShip.shields}/{userShip.maxShields}
              </span>
            </div>
            <div className="action-buttons-inline">
              <button
                className="action-btn-small"
                onClick={() => navigate('/shipyard')}
              >
                REPAIR
              </button>
              <button
                className="action-btn-small"
                onClick={() => {
                  if (!user?.isDocked) {
                    showModal({
                      title: 'Cannot Refuel',
                      message:
                        'You must be docked at a station to refuel your ship.',
                      type: 'warning',
                    })
                  } else {
                    navigate('/shops')
                  }
                }}
              >
                REFUEL
              </button>
              <button
                className="action-btn-small"
                onClick={() => navigate('/stargate')}
              >
                TRAVEL
              </button>
            </div>
          </div>
        </div>

        {/* Center Right - Inventory */}
        <div className="screen inventory-screen">
          <button
            className="inventory-btn"
            onClick={() => navigate('/inventory')}
          >
            <span className="btn-text">INVENTORY</span>
          </button>
        </div>

        {/* Bottom Left - Quick Actions & Menu */}
        <div className="screen quick-actions-screen">
          <div className="screen-inner">
            <button
              className="nav-btn-compact"
              onClick={(e) => {
                e.stopPropagation()
                if (showMenu) {
                  setMenuClosing(true)
                  setTimeout(() => {
                    setShowMenu(false)
                    setMenuClosing(false)
                  }, 300)
                } else {
                  setShowMenu(true)
                }
              }}
            >
              <span>MENU</span>
            </button>
            <button
              className="nav-btn-compact"
              onClick={() => navigate('/crimes')}
            >
              <span>CRIMES</span>
            </button>
            <button
              className="nav-btn-compact"
              onClick={() => navigate('/gym')}
            >
              <span>GYM</span>
            </button>
          </div>
          {showMenu && (
            <div
              className={`menu-dropdown ${menuClosing ? 'closing' : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => navigate('/casino')}>Casino</button>
              <button onClick={() => navigate('/market')}>Market</button>
              <button onClick={() => navigate('/stargate')}>StarGate</button>
              <button onClick={() => navigate('/shipyard')}>Shipyard</button>
              <button onClick={() => navigate('/combat')}>Combat</button>
              <button onClick={() => navigate('/city')}>City</button>
              <button onClick={() => navigate('/shops')}>Shops</button>
              <button onClick={() => navigate('/hospital')}>Hospital</button>
              <button onClick={() => navigate('/jail')}>Jail</button>
            </div>
          )}
        </div>

        {/* Bottom Right - Network, Missions, News */}
        <div className="screen info-screen">
          <div className="screen-inner">
            <button
              className="nav-btn-compact"
              onClick={() => navigate('/network')}
            >
              <span>NETWORK</span>
            </button>
            <button
              className="nav-btn-compact"
              onClick={() => navigate('/missions')}
            >
              <span>MISSIONS</span>
            </button>
            <button className="nav-btn-compact" onClick={() => {}}>
              <span>NEWS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reset Game Confirmation Modal */}
      {showResetConfirm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #1a0033 0%, #2d1b69 100%)',
              border: '3px solid #ff0000',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '500px',
              textAlign: 'center',
              boxShadow: '0 0 50px rgba(255, 0, 0, 0.5)',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ color: '#ff0000', marginBottom: '1rem' }}>
              Reset Game Data?
            </h2>
            <p style={{ color: '#fff', marginBottom: '2rem' }}>
              This will permanently delete all your progress, stats, inventory,
              and character data. This action cannot be undone!
            </p>
            <div
              style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}
            >
              <button
                onClick={handleResetGame}
                style={{
                  padding: '0.75rem 2rem',
                  background: '#ff0000',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px',
                }}
              >
                Yes, Reset Everything
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                style={{
                  padding: '0.75rem 2rem',
                  background: '#333',
                  border: '2px solid #666',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Self-Destruct Button (bottom right corner) - Only in development */}
      {import.meta.env.DEV && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '80px',
            zIndex: 9999,
            transform: 'scale(0.4)',
            transformOrigin: 'bottom right',
          }}
        >
          <SelfDestructButton
            onClick={() => setShowResetConfirm(true)}
            title="Reset Game Data"
          />
        </div>
      )}
    </>
  )
}

export default Home
