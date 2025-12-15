// src/pages/Dashboard.tsx - Original Three-Column Layout
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useUser'
import { useProfileImage } from '../hooks/useProfileImage'
import { GlassCard } from '../components/ui/GlassCard'
import { GradientButton } from '../components/ui/GradientButton'
import { StatCard } from '../components/ui/StatCard'
import { theme } from '../styles/theme'
import ShipViewer from '../components/ShipViewer'
import { SelfDestructButton } from '../components/SelfDestructButton'

interface Mission {
  id: string
  name: string
  description: string
  location: string
  moneyReward: number
  expReward: number
  timeLimit: number // in minutes
  requirements?: string[]
}

// Placeholder missions
const AVAILABLE_MISSIONS: Mission[] = [
  {
    id: 'mission_1',
    name: 'Data Heist',
    description:
      'Steal encrypted data from a corporate server. High risk, high reward.',
    location: 'Alpha Centauri',
    moneyReward: 50000,
    expReward: 1000,
    timeLimit: 120,

    requirements: ['Level 5+', 'Hacking Tools'],
  },
  {
    id: 'mission_2',
    name: 'Smuggling Run',
    description:
      'Transport contraband across star systems without getting caught.',
    location: 'Sirius',
    moneyReward: 25000,
    expReward: 500,
    timeLimit: 180,

    requirements: ['Cargo space: 10+'],
  },
  {
    id: 'mission_3',
    name: 'Bounty Collection',
    description: 'Track down and eliminate a low-level target.',
    location: 'Earth',
    moneyReward: 15000,
    expReward: 300,
    timeLimit: 60,

    requirements: ['Combat experience'],
  },
]

// Placeholder news
const NEWS_ITEMS = [
  {
    id: 1,
    title: 'Galactic Market Crash',
    description: 'Quantum Flux prices drop 15% amid supply surplus.',
    icon: '📉',
    time: '2h ago',
  },
  {
    id: 2,
    title: 'New Planet Discovered',
    description: 'Explorers find habitable world in Andromeda sector.',
    icon: '🌍',
    time: '5h ago',
  },
  {
    id: 3,
    title: 'Security Alert',
    description: 'Increased police presence in Alpha Centauri system.',
    icon: '🚨',
    time: '8h ago',
  },
  {
    id: 4,
    title: 'Black Market Open',
    description: 'Rare weapons now available at undisclosed location.',
    icon: '🔫',
    time: '12h ago',
  },
]

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, updateUser, getFuelCount, startUndocking } = useUser()
  const { fileInputRef, uploadingImage, handleImageClick, handleImageUpload } =
    useProfileImage()
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)
  const [avatarOffset, setAvatarOffset] = useState(() =>
    user?.profilePicOffset ? user.profilePicOffset : { x: 0, y: 0 }
  )
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  )
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const handleResetGame = () => {
    localStorage.clear()
    window.location.reload()
  }

  if (!user) return null

  const avatarSrc = user.profilePic || '/images/me.png'

  // Get background image based on current location (when in orbit)
  const getLocationBackground = () => {
    if (user.isDocked || user.isDocking) return null

    const locationImages: Record<string, string> = {
      earth: '/images/planets/earth.jpg',
      'alpha-centauri': '/images/planets/alphaCentauri.jpg',
      'barnards-star': '/images/planets/barnardsStar.jpg',
      sirius: '/images/planets/sirius.jpeg',
      'epsilon-eridani': '/images/planets/epsilonEridani.png',
    }

    return locationImages[user.location] || '/images/planets/earth.jpg'
  }

  const backgroundImage = getLocationBackground()

  // Get user's ship or default
  const userShip: import('../types/user.types').Ship =
    (user.ship as import('../types/user.types').Ship) || {
      id: 'shipFace',
      name: 'Ship McShipface',
      tier: 'basic',
      modelPath: '',
      price: 0,
      hull: 0,
      maxHull: 100,
      shields: 0,
      maxShields: 50,
      cargoCapacity: 12,
      cargo: [],
      fuelTypes: ['ion'],
      travelTimeReduction: 0,
      description: 'The shippiest ship.',
    }

  // Get active missions from user
  const activeMissions = (user.activeMissions ?? []) as Mission[]

  // Calculate cargo usage
  const cargoUsed = userShip.cargo?.length || 0
  const cargoIsFull = cargoUsed >= userShip.cargoCapacity

  const handleTransferAllCargo = () => {
    if (!userShip.cargo || userShip.cargo.length === 0) {
      alert('No cargo to transfer!')
      return
    }

    const confirmed = window.confirm(
      `Transfer all ${userShip.cargo.length} items from ship cargo to your inventory?`
    )

    if (!confirmed) return

    // Transfer all cargo to inventory
    // Convert cargo items to InventoryItem objects
    const cargoAsInventoryItems = userShip.cargo.map((item) => ({
      item,
      quantity: 1,
      acquiredAt: new Date(),
    }))
    const updatedInventory = [...user.inventory, ...cargoAsInventoryItems]
    const updatedShip = {
      ...userShip,
      cargo: [],
      id: userShip.id,
      name: userShip.name,
      tier: userShip.tier,
      modelPath: userShip.modelPath,
      price: userShip.price,
      hull: userShip.hull,
      maxHull: userShip.maxHull,
      shields: userShip.shields,
      maxShields: userShip.maxShields,
      cargoCapacity: userShip.cargoCapacity,
      fuelTypes: userShip.fuelTypes,
      travelTimeReduction: userShip.travelTimeReduction,
      statModifiers: userShip.statModifiers,
      description: userShip.description,
    }

    updateUser({
      inventory: updatedInventory,
      ship: updatedShip,
    })

    alert('✅ All cargo transferred to inventory!')
  }

  const handleAcceptMission = (mission: Mission) => {
    const confirmed = window.confirm(
      `Accept mission: ${mission.name}?\n\n` +
        `Location: ${mission.location}\n` +
        `Reward: $${mission.moneyReward.toLocaleString()} + ${
          mission.expReward
        } XP\n` +
        `Time Limit: ${mission.timeLimit} minutes`
    )

    if (!confirmed) return

    // Add mission to active missions
    const newActiveMissions = [...activeMissions, mission]
    updateUser({ activeMissions: newActiveMissions })

    alert('✅ Mission accepted! Check your active missions.')
  }

  const handleViewMissionDetails = (mission: Mission) => {
    setSelectedMission(mission)
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Location Background (when in orbit) - Behind everything */}
      {backgroundImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 0,
          }}
        />
      )}

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          background: 'transparent',
          padding: '2rem',
        }}
      >
        <style>{cssString}</style>

        {/* Docking/Undocking Fullscreen Blocker */}
        {user.isDocking && (
          <>
            {/* Video Background */}
            <video
              autoPlay
              loop
              muted
              playsInline
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                objectFit: 'cover',
                zIndex: 9998,
                pointerEvents: 'none',
              }}
            >
              <source src="/images/videos/docking.mp4" type="video/mp4" />
            </video>

            {/* Fullscreen overlay to block all interactions and scrolling */}
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 9999,
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
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10000,
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

        {/* Ship View Button (only show when NOT docked) */}
        {!user.isDocked && (
          <button
            onClick={() => navigate('/')}
            style={{
              position: 'fixed',
              top: '80px',
              right: '20px',
              padding: '10px 20px',
              background: 'rgba(87, 255, 149, 0.2)',
              border: '2px solid #57ff95',
              borderRadius: '6px',
              color: '#57ff95',
              cursor: 'pointer',
              zIndex: 10001,
              fontSize: '12px',
              fontWeight: 'bold',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(87, 255, 149, 0.3)'
              e.currentTarget.style.boxShadow =
                '0 0 10px rgba(87, 255, 149, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(87, 255, 149, 0.2)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            Ship View
          </button>
        )}

        {/* Undock Button (only show when docked) */}
        {user.isDocked && (
          <button
            onClick={() => {
              if (startUndocking()) {
                alert(
                  'Undocking sequence initiated. You will return to orbit shortly.'
                )
              }
            }}
            style={{
              position: 'fixed',
              top: '80px',
              right: '20px',
              padding: '10px 20px',
              background: user.isDocking
                ? 'rgba(245, 158, 11, 0.2)'
                : 'rgba(30, 64, 175, 0.2)',
              border: user.isDocking
                ? '2px solid #f59e0b'
                : '2px solid #1e40af',
              borderRadius: '6px',
              color: user.isDocking ? '#fbbf24' : '#60a5fa',
              cursor: user.isDocking ? 'not-allowed' : 'pointer',
              zIndex: 10001,
              fontSize: '12px',
              fontWeight: 'bold',
              transition: 'all 0.2s ease',
              opacity: user.isDocking ? 0.6 : 1,
            }}
            disabled={user.isDocking}
            onMouseEnter={(e) => {
              if (!user.isDocking) {
                e.currentTarget.style.background = 'rgba(30, 64, 175, 0.3)'
                e.currentTarget.style.boxShadow =
                  '0 0 10px rgba(96, 165, 250, 0.5)'
              }
            }}
            onMouseLeave={(e) => {
              if (!user.isDocking) {
                e.currentTarget.style.background = 'rgba(30, 64, 175, 0.2)'
                e.currentTarget.style.boxShadow = 'none'
              }
            }}
          >
            {user.isDocking
              ? `⏳ Undocking... ${user.dockingTimeRemaining}s`
              : '🚀 Undock from Station'}
          </button>
        )}

        <div className="cc-grid">
          {/* LEFT COLUMN: Profile card + stats */}
          <aside className="cc-left">
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
                        width: '150%',
                        height: '150%',
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
                  ASTRAL
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

            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                margin: '1rem 0',
              }}
            >
              <button
                className="edit-profile-btn"
                onClick={handleImageClick}
                disabled={uploadingImage}
              >
                {uploadingImage ? '⏳ Uploading...' : 'Edit Profile Pic'}
              </button>
            </div>

            <div className="cc-left-stack">
              <StatCard
                label="Level"
                value={user.level}
                icon="⭐"
                color="purple"
              />
              <StatCard
                label="Astral Credit"
                value={`$${user.money.toLocaleString()}`}
                icon="💰"
                color="green"
              />
              <StatCard
                label="Energy"
                value={`${user.energy}/${user.maxEnergy}`}
                icon="⚡"
                color="blue"
                tooltip={
                  user.energy < user.maxEnergy
                    ? `${
                        Math.ceil(
                          ((user.maxEnergy - user.energy) / 5) *
                            (window.localStorage.getItem(
                              'astralDevFastTicks'
                            ) === 'true'
                              ? 5
                              : 600)
                        ) / 60
                      } min until full`
                    : 'Full'
                }
              />
              <StatCard
                label="Health"
                value={`${user.health}/${user.maxHealth}`}
                icon="❤️"
                color="red"
                tooltip={
                  user.health < user.maxHealth
                    ? `${Math.ceil(
                        ((user.maxHealth - user.health) *
                          (window.localStorage.getItem('astralDevFastTicks') ===
                          'true'
                            ? 5
                            : 60)) /
                          60
                      )} min until full`
                    : 'Full'
                }
              />
              <StatCard
                label="Heat"
                value={user.heat}
                icon="🔥"
                color="red"
                tooltip={
                  user.heat > 0
                    ? `${Math.ceil(
                        ((user.heat / 2) *
                          (window.localStorage.getItem('astralDevFastTicks') ===
                          'true'
                            ? 5
                            : 300)) /
                          60
                      )} min until zero`
                    : 'Zero'
                }
              />
            </div>

            <GlassCard padding="md" className="cc-mini-card">
              <div className="cc-mini-card-inner">
                <button
                  className="cc-mini-btn"
                  onClick={() => navigate('/network')}
                >
                  Network
                </button>
                <button
                  className="cc-mini-btn"
                  onClick={() => navigate('/friends')}
                >
                  Friends
                </button>
                <button
                  className="cc-mini-btn"
                  onClick={() => navigate('/messages')}
                >
                  Messages
                </button>
                <button
                  className="cc-mini-btn"
                  onClick={() => navigate('/settings')}
                >
                  Settings
                </button>
              </div>
            </GlassCard>
            <GlassCard>
              <div style={styles.sectionTitle}>Crime Totals</div>
              <div>
                <strong>Total:</strong> {user.crimesTally.total}
              </div>
              <div>
                <strong>Success:</strong> {user.crimesTally.success}
              </div>
              <div>
                <strong>Failed:</strong> {user.crimesTally.failed}
              </div>
              <div>
                <strong>Critical:</strong> {user.crimesTally.critical}
              </div>
            </GlassCard>
            <GlassCard>
              <div style={styles.sectionTitle}>Combat Totals</div>
              <div>
                <strong>Attacks:</strong> {user.combatTally.attacks}
              </div>
              <div>
                <strong>Defends:</strong> {user.combatTally.defends}
              </div>
              <div>
                <strong>Escapes:</strong> {user.combatTally.escapes}
              </div>
              <div>
                <strong>Kills:</strong> {user.combatTally.kills}
              </div>
              <div>
                <strong>Deaths:</strong> {user.combatTally.deaths}
              </div>
            </GlassCard>
          </aside>

          {/* CENTER COLUMN */}
          <main className="cc-center">
            {/* Welcome Card with Ship Viewer and Active Missions */}
            <GlassCard padding="lg" className="compact-welcome">
              <div style={styles.welcomeSection}>
                <div style={styles.welcomeHeader}>
                  <div>
                    <span style={styles.welcomeText}>
                      Welcome back, <strong>{user.username}</strong>
                    </span>
                    <span style={styles.welcomeTagline}>
                      What's on the agenda today?
                    </span>
                  </div>
                  <GradientButton
                    gradient="purple"
                    size="md"
                    onClick={() => navigate('/shipyard')}
                    data-shipyard-button
                  >
                    Shipyard
                  </GradientButton>
                </div>

                <div style={styles.shipViewerContainer}>
                  {user.ship ? (
                    <ShipViewer
                      src={user.ship.modelPath}
                      height={250}
                      width={350}
                      autoRotate={true}
                      initialScale={0.35}
                    />
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '250px',
                        color: '#888',
                        fontSize: '1.2rem',
                      }}
                    >
                      No Ship
                    </div>
                  )}
                </div>

                {/* Active Missions */}
                <div style={styles.activeMissionsSection}>
                  <div style={styles.activeMissionsHeader}>
                    <span style={styles.activeMissionsTitle}>
                      Active Missions
                    </span>
                    <span style={styles.missionCount}>
                      {activeMissions.length}/3
                    </span>
                  </div>
                  {activeMissions.length > 0 ? (
                    <div style={styles.activeMissionsList}>
                      {activeMissions.map((mission: Mission) => (
                        <div key={mission.id} style={styles.activeMissionItem}>
                          <div style={styles.activeMissionInfo}>
                            <div style={styles.activeMissionName}>
                              {mission.name}
                            </div>
                            <div style={styles.activeMissionLocation}>
                              📍 {mission.location}
                            </div>
                          </div>
                          <div style={styles.activeMissionTime}>
                            ⏱️ {mission.timeLimit}m
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={styles.noMissions}>
                      No active missions. Check the mission board!
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>

            {/* Quick Navigation */}
            <div style={styles.sectionTitle}>Quick Navigation</div>
            <div style={styles.navGrid}>
              <GlassCard
                hover
                onClick={() => navigate('/crimes')}
                className="nav-card"
              >
                <div style={styles.navIcon}>🔫</div>
                <div style={styles.navLabel}>Crimes</div>
              </GlassCard>
              <GlassCard
                hover
                onClick={() => navigate('/casino')}
                className="nav-card"
              >
                <div style={styles.navIcon}>
                  <img src="images/icons/casino.png" alt="Casino" />
                </div>
                <div style={styles.navLabel}>Casino</div>
              </GlassCard>
              <GlassCard
                hover
                onClick={() => navigate('/gym')}
                className="nav-card"
              >
                <div style={styles.navIcon}>
                  <img src="images/icons/gym.png" alt="Gym" />
                </div>
                <div style={styles.navLabel}>Gym</div>
              </GlassCard>
              <GlassCard
                hover
                onClick={() => navigate('/stargate')}
                className="nav-card"
              >
                <div style={styles.navIcon}>
                  <img src="images/icons/black-hole.png" alt="StarGate" />
                </div>
                <div style={styles.navLabel}>StarGate</div>
              </GlassCard>
              <GlassCard
                hover
                onClick={() => navigate('/shops')}
                className="nav-card"
              >
                <div style={styles.navIcon}>
                  <img src="images/icons/shop.png" alt="Shops" />
                </div>
                <div style={styles.navLabel}>Shops</div>
              </GlassCard>
              <GlassCard
                hover
                onClick={() => navigate('/inventory')}
                className="nav-card"
              >
                <div style={styles.navIcon}>🎒</div>
                <div style={styles.navLabel}>Inventory</div>
              </GlassCard>
            </div>

            {/* News Feed */}
            <div style={styles.sectionTitle}>📰 Galactic News</div>
            <GlassCard>
              <div style={styles.newsFeed}>
                {NEWS_ITEMS.map((news) => (
                  <div key={news.id} style={styles.newsItem}>
                    <span style={styles.newsIcon}>{news.icon}</span>
                    <div style={styles.newsContent}>
                      <div style={styles.newsTitle}>{news.title}</div>
                      <div style={styles.newsDesc}>{news.description}</div>
                    </div>
                    <div style={styles.newsTime}>{news.time}</div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Activity Feed */}
            <div style={styles.sectionTitle}>Recent Activity</div>
            <GlassCard>
              <div style={styles.activityFeed}>
                <div style={styles.activityItem}>
                  <span style={styles.activityIcon}>💰</span>
                  <div style={styles.activityText}>
                    <div style={styles.activityTitle}>Crime Success</div>
                    <div style={styles.activityDesc}>
                      Earned $5,000 from Street Robbery
                    </div>
                  </div>
                  <div style={styles.activityTime}>2m ago</div>
                </div>
                <div style={styles.activityItem}>
                  <span style={styles.activityIcon}>⭐</span>
                  <div style={styles.activityText}>
                    <div style={styles.activityTitle}>Level Up!</div>
                    <div style={styles.activityDesc}>
                      Reached Level {user.level}
                    </div>
                  </div>
                  <div style={styles.activityTime}>1h ago</div>
                </div>
                <div style={styles.activityItem}>
                  <span style={styles.activityIcon}>🚀</span>
                  <div style={styles.activityText}>
                    <div style={styles.activityTitle}>Travel Complete</div>
                    <div style={styles.activityDesc}>
                      Arrived at Alpha Centauri
                    </div>
                  </div>
                  <div style={styles.activityTime}>3h ago</div>
                </div>
              </div>
            </GlassCard>
          </main>

          {/* RIGHT COLUMN: Ship Stats + Fuel + Mission Board */}
          <aside className="cc-right">
            {/* Combined Ship Stats & Fuel */}
            <div style={styles.sectionTitle}>
              <strong>🚀 {userShip.name}</strong>
            </div>

            <GlassCard>
              <div style={styles.shipStatsContainer}>
                {/* Hull */}
                <div style={styles.statSection}>
                  <div style={styles.statLabel}>
                    <span>🛡️ Hull</span>
                    <span>
                      {userShip.hull}/{userShip.maxHull}
                    </span>
                  </div>
                  <div style={styles.progressBar}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${(userShip.hull / userShip.maxHull) * 100}%`,
                        background:
                          userShip.hull < userShip.maxHull * 0.3
                            ? '#ef4444'
                            : '#22c55e',
                      }}
                    />
                  </div>
                </div>

                {/* Shields */}
                <div style={styles.statSection}>
                  <div style={styles.statLabel}>
                    <span>⚡ Shields</span>
                    <span>
                      {userShip.shields}/{userShip.maxShields}
                    </span>
                  </div>
                  <div style={styles.progressBar}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${
                          (userShip.shields / userShip.maxShields) * 100
                        }%`,
                        background:
                          userShip.shields < userShip.maxShields * 0.3
                            ? '#ef4444'
                            : '#00d9ff',
                      }}
                    />
                  </div>
                </div>

                {/* Cargo */}
                <div style={styles.statSection}>
                  <div style={styles.statLabel}>
                    <span>📦 Cargo</span>
                    <span>
                      {cargoUsed}/{userShip.cargoCapacity}
                      {cargoIsFull && (
                        <span style={styles.fullBadge}>FULL</span>
                      )}
                    </span>
                  </div>
                  <div style={styles.progressBar}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${(cargoUsed / userShip.cargoCapacity) * 100}%`,
                        background: cargoIsFull ? '#f59e0b' : '#8b5cf6',
                      }}
                    />
                  </div>
                </div>

                {/* Transfer Cargo Button */}
                {cargoUsed > 0 && (
                  <GradientButton
                    gradient="blue"
                    size="sm"
                    onClick={handleTransferAllCargo}
                  >
                    📦 Transfer All to Inventory
                  </GradientButton>
                )}

                {/* Divider */}
                <div style={styles.divider} />

                {/* Fuel Status */}
                <div style={styles.fuelSection}>
                  <div style={styles.fuelTitle}>⛽ Fuel Reserves</div>
                  <div style={styles.fuelItem}>
                    <span style={styles.fuelIcon}>⚡</span>
                    <span style={styles.fuelLabel}>Ion</span>
                    <span style={styles.fuelAmount}>
                      {getFuelCount('ion').toLocaleString()}
                    </span>
                  </div>
                  <div style={styles.fuelItem}>
                    <span style={styles.fuelIcon}>🔋</span>
                    <span style={styles.fuelLabel}>Fusion</span>
                    <span style={styles.fuelAmount}>
                      {getFuelCount('fusion').toLocaleString()}
                    </span>
                  </div>
                  <div style={styles.fuelItem}>
                    <span style={styles.fuelIcon}>💠</span>
                    <span style={styles.fuelLabel}>Quantum</span>
                    <span style={styles.fuelAmount}>
                      {getFuelCount('quantum').toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Repair Warning */}
                {(userShip.hull < userShip.maxHull ||
                  userShip.shields < userShip.maxShields) && (
                  <div style={styles.repairWarning}>
                    <span>⚠️</span>
                    <span style={{ fontSize: '11px' }}>Ship needs repair</span>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Mission Board */}
            <div style={styles.sectionTitle}>
              <strong>📋 Quick Missions</strong>
            </div>

            <div style={styles.missionBoard}>
              {AVAILABLE_MISSIONS.slice(0, 3).map((mission) => (
                <GlassCard key={mission.id} hover className="mb-3">
                  <div style={styles.missionCard}>
                    <div style={styles.missionHeader}>
                      <div style={styles.missionName}>{mission.name}</div>
                    </div>
                    <div style={styles.missionDetails}>
                      <div style={styles.missionDetailItem}>
                        <span>📍</span>
                        <span>{mission.location}</span>
                      </div>
                      <div style={styles.missionDetailItem}>
                        <span>💰</span>
                        <span>${mission.moneyReward.toLocaleString()}</span>
                      </div>
                      <div style={styles.missionDetailItem}>
                        <span>⏱️</span>
                        <span>{mission.timeLimit}m</span>
                      </div>
                    </div>
                    <div style={styles.missionActions}>
                      <button
                        style={styles.missionAcceptBtn}
                        onClick={() => handleAcceptMission(mission)}
                        disabled={activeMissions.length >= 3}
                      >
                        Accept
                      </button>
                      <button
                        style={styles.missionDetailsBtn}
                        onClick={() => handleViewMissionDetails(mission)}
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </aside>
        </div>

        {/* Mission Details Modal */}
        {selectedMission && (
          <div
            style={styles.modalOverlay}
            onClick={() => setSelectedMission(null)}
          >
            <GlassCard className="modal">
              <div
                style={styles.modalContent}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <h2 style={styles.modalTitle}>{selectedMission.name}</h2>

                <p style={styles.modalDescription}>
                  {selectedMission.description}
                </p>

                <div style={styles.modalDetails}>
                  <div style={styles.modalDetailRow}>
                    <span style={styles.modalDetailLabel}>📍 Location:</span>
                    <span>{selectedMission.location}</span>
                  </div>
                  <div style={styles.modalDetailRow}>
                    <span style={styles.modalDetailLabel}>Money Reward:</span>
                    <span>${selectedMission.moneyReward.toLocaleString()}</span>
                  </div>
                  <div style={styles.modalDetailRow}>
                    <span style={styles.modalDetailLabel}>EXP Reward:</span>
                    <span>{selectedMission.expReward} XP</span>
                  </div>
                  <div style={styles.modalDetailRow}>
                    <span style={styles.modalDetailLabel}>⏱️ Time Limit:</span>
                    <span>{selectedMission.timeLimit} minutes</span>
                  </div>
                </div>

                {selectedMission.requirements && (
                  <div style={styles.requirements}>
                    <div style={styles.requirementsTitle}>Requirements:</div>
                    {selectedMission.requirements.map((req, idx) => (
                      <div key={idx} style={styles.requirement}>
                        • {req}
                      </div>
                    ))}
                  </div>
                )}

                <div style={styles.modalActions}>
                  <GradientButton
                    gradient="purple"
                    onClick={() => {
                      handleAcceptMission(selectedMission)
                      setSelectedMission(null)
                    }}
                    disabled={activeMissions.length >= 3}
                  >
                    Accept Mission
                  </GradientButton>
                  <GradientButton
                    gradient="blue"
                    onClick={() => setSelectedMission(null)}
                  >
                    Close
                  </GradientButton>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Reset Game Confirmation Modal */}
        {showResetConfirm && (
          <div
            style={{
              position: 'relative',
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
                This will permanently delete all your progress, stats,
                inventory, and character data. This action cannot be undone!
              </p>
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'center',
                }}
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

        {/* Self-Destruct Button*/}
        <div
          style={{
            position: 'absolute',
            bottom: '2rem',
            right: '2rem',
            transform: 'scale(0.3)',
            transformOrigin: 'bottom right',
          }}
        >
          <SelfDestructButton
            onClick={() => setShowResetConfirm(true)}
            title="Reset Game Data"
          />
        </div>
      </div>
    </div>
  )
}

const styles = {
  welcomeSection: {
    padding: '1rem',
  } as React.CSSProperties,

  welcomeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  } as React.CSSProperties,

  welcomeText: {
    fontSize: '20px',
    display: 'block',
    marginBottom: '0.25rem',
    fontWeight: '600',
  } as React.CSSProperties,

  welcomeTagline: {
    fontSize: '14px',
    color: theme.colors.text.secondary,
    display: 'block',
  } as React.CSSProperties,

  shipViewerContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1rem',
  } as React.CSSProperties,

  activeMissionsSection: {
    marginTop: '1rem',
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: theme.borderRadius.md,
  } as React.CSSProperties,

  activeMissionsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  } as React.CSSProperties,

  activeMissionsTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
  } as React.CSSProperties,

  missionCount: {
    fontSize: '12px',
    padding: '0.25rem 0.5rem',
    background: theme.colors.gradients.purple,
    borderRadius: theme.borderRadius.full,
  } as React.CSSProperties,

  activeMissionsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  } as React.CSSProperties,

  activeMissionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.borderRadius.sm,
  } as React.CSSProperties,

  activeMissionInfo: {
    flex: 1,
  } as React.CSSProperties,

  activeMissionName: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '0.25rem',
  } as React.CSSProperties,

  activeMissionLocation: {
    fontSize: '12px',
    color: theme.colors.text.secondary,
  } as React.CSSProperties,

  activeMissionTime: {
    fontSize: '12px',
    color: theme.colors.accent.purple,
    fontWeight: '600',
  } as React.CSSProperties,

  noMissions: {
    textAlign: 'center' as const,
    padding: '1rem',
    fontSize: '13px',
    color: theme.colors.text.secondary,
  } as React.CSSProperties,

  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.lg,
  } as React.CSSProperties,

  navGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  } as React.CSSProperties,

  navCard: {
    padding: '1rem',
    textAlign: 'center' as const,
    cursor: 'pointer',
  } as React.CSSProperties,

  navIcon: {
    fontSize: '32px',
    marginBottom: '0.5rem',
  } as React.CSSProperties,

  navLabel: {
    fontSize: '14px',
    fontWeight: '600',
  } as React.CSSProperties,

  newsFeed: {
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  } as React.CSSProperties,

  newsItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '0.75rem',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: theme.borderRadius.md,
  } as React.CSSProperties,

  newsIcon: {
    fontSize: '24px',
  } as React.CSSProperties,

  newsContent: {
    flex: 1,
  } as React.CSSProperties,

  newsTitle: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '0.25rem',
  } as React.CSSProperties,

  newsDesc: {
    fontSize: '12px',
    color: theme.colors.text.secondary,
    lineHeight: 1.4,
  } as React.CSSProperties,

  newsTime: {
    fontSize: '11px',
    color: theme.colors.text.secondary,
  } as React.CSSProperties,

  activityFeed: {
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  } as React.CSSProperties,

  activityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: theme.borderRadius.md,
  } as React.CSSProperties,

  activityIcon: {
    fontSize: '24px',
  } as React.CSSProperties,

  activityText: {
    flex: 1,
  } as React.CSSProperties,

  activityTitle: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '0.25rem',
  } as React.CSSProperties,

  activityDesc: {
    fontSize: '12px',
    color: theme.colors.text.secondary,
  } as React.CSSProperties,

  activityTime: {
    fontSize: '11px',
    color: theme.colors.text.secondary,
  } as React.CSSProperties,

  shipStatsContainer: {
    padding: '1rem',
  } as React.CSSProperties,

  statSection: {
    marginBottom: '1rem',
  } as React.CSSProperties,

  statLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '0.5rem',
  } as React.CSSProperties,

  progressBar: {
    height: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  } as React.CSSProperties,

  progressFill: {
    height: '100%',
    transition: 'width 0.3s ease',
    borderRadius: theme.borderRadius.full,
  } as React.CSSProperties,

  fullBadge: {
    marginLeft: '0.5rem',
    padding: '0.125rem 0.5rem',
    background: '#f59e0b',
    borderRadius: theme.borderRadius.sm,
    fontSize: '10px',
    fontWeight: 'bold',
  } as React.CSSProperties,

  divider: {
    height: '1px',
    background: 'rgba(255, 255, 255, 0.1)',
    margin: '1rem 0',
  } as React.CSSProperties,

  fuelSection: {
    marginTop: '0.5rem',
  } as React.CSSProperties,

  fuelTitle: {
    fontSize: '13px',
    fontWeight: 'bold',
    marginBottom: '0.75rem',
  } as React.CSSProperties,

  fuelItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem',
    marginBottom: '0.5rem',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: theme.borderRadius.sm,
  } as React.CSSProperties,

  fuelIcon: {
    fontSize: '18px',
  } as React.CSSProperties,

  fuelLabel: {
    flex: 1,
    fontSize: '12px',
    color: theme.colors.text.secondary,
  } as React.CSSProperties,

  fuelAmount: {
    fontSize: '13px',
    fontWeight: 'bold',
  } as React.CSSProperties,

  repairWarning: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem',
    background: 'rgba(251, 191, 36, 0.1)',
    border: '1px solid #f59e0b',
    borderRadius: theme.borderRadius.sm,
    color: '#f59e0b',
    fontSize: '12px',
    marginTop: '0.5rem',
  } as React.CSSProperties,

  missionBoard: {
    display: 'flex',
    flexDirection: 'column' as const,
  } as React.CSSProperties,

  missionCard: {
    padding: '1rem',
  } as React.CSSProperties,

  missionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  } as React.CSSProperties,

  missionName: {
    fontSize: '14px',
    fontWeight: 'bold',
  } as React.CSSProperties,

  difficultyBadge: {
    padding: '0.25rem 0.5rem',
    borderRadius: theme.borderRadius.sm,
    fontSize: '10px',
    fontWeight: 'bold',
    color: 'white',
    textTransform: 'uppercase' as const,
  } as React.CSSProperties,

  missionDetails: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    marginBottom: '0.75rem',
  } as React.CSSProperties,

  missionDetailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '12px',
  } as React.CSSProperties,

  missionActions: {
    display: 'flex',
    gap: '0.5rem',
  } as React.CSSProperties,

  missionAcceptBtn: {
    flex: 1,
    padding: '0.5rem',
    background: theme.colors.gradients.purple,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
  } as React.CSSProperties,

  missionDetailsBtn: {
    flex: 1,
    padding: '0.5rem',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.md,
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
  } as React.CSSProperties,

  modalOverlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '2rem',
  } as React.CSSProperties,

  modal: {
    maxWidth: '500px',
    width: '100%',
    maxHeight: '80vh',
    overflow: 'auto',
  } as React.CSSProperties,

  modalContent: {
    padding: '2rem',
  } as React.CSSProperties,

  modalTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  } as React.CSSProperties,

  modalDescription: {
    fontSize: '14px',
    color: theme.colors.text.secondary,
    lineHeight: 1.6,
    marginBottom: '1.5rem',
  } as React.CSSProperties,

  modalDetails: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    marginBottom: '1.5rem',
  } as React.CSSProperties,

  modalDetailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    padding: '0.5rem',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.borderRadius.sm,
  } as React.CSSProperties,

  modalDetailLabel: {
    fontWeight: '600',
  } as React.CSSProperties,

  requirements: {
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.borderRadius.md,
    marginBottom: '1.5rem',
  } as React.CSSProperties,

  requirementsTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  } as React.CSSProperties,

  requirement: {
    fontSize: '13px',
    color: theme.colors.text.secondary,
    marginBottom: '0.25rem',
  } as React.CSSProperties,

  modalActions: {
    display: 'flex',
    gap: '1rem',
  } as React.CSSProperties,
} as const

export default Dashboard

const cssString = `
.cc-grid {
  display: grid;
  grid-template-columns: 300px 1fr 260px;
  gap: 1.25rem;
  align-items: start;
  width: 100%;
  background: rgba(10, 37, 64, 0); 
}

@media (max-width: 980px) {
  .cc-grid {
    grid-template-columns: 1fr;
    background: rgba(10, 37, 64, 0); 
  }
  .cc-left {
    order: 1;
  }
  .cc-center {
    order: 2;
  }
  .cc-right {
    order: 3;
  }
}

.cc-left {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cc-left-stack {
  display: grid;
  gap: 0.75rem;
}

.cc-mini-card {
  margin-top: 0.5rem;
  padding: 0.5rem;
}

.cc-mini-card-inner {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cc-mini-btn {
  background: transparent;
  color: inherit;
  border: 1px solid rgba(255,255,255,0.1);
  padding: 0.5rem 0.6rem;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  font-weight: 600;
  transition: all 0.2s;
}

.cc-mini-btn:hover {
  background: rgba(255,255,255,0.05);
  border-color: rgba(255,255,255,0.1);
}

.cc-center {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cc-right {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: stretch;
}

.compact-welcome {
  margin-bottom: 0.5rem;
}

.card-border {
  z-index: 0;
  position: relative;
  padding: 1rem;
  width: 100%;
  height: 350px;
  box-sizing: border-box;
  background: transparent;
  backdrop-filter: blur(40px);
  border-radius: 0px 2rem;
  background-image: radial-gradient(#2121218a, #212121cc), linear-gradient(35deg,#124926 62%,#57ff94 100%);
  background-origin: border-box;
  background-clip: content-box, border-box;
  box-shadow: 1px 1px 3rem #57ff95;
  transition: all 0.5s;
  animation: pulse_3011 3s infinite;
  overflow: visible;
  margin-bottom: 2rem;
}

.card-bg {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 0px 0.8rem;
  background: linear-gradient(346.80deg, #124926 30%, #165c30 30%, rgba(255, 70, 84, 0) 30%, rgba(255, 70, 84, 0) 32%, #124926 32%, #124926  35%, transparent 35%);
}

.viper {
  position: absolute;
  display: flex;
  text-transform: uppercase;
  font-family: 'Open Sans Pro', sans-serif;
  font-size: 3.5rem;
  font-weight: 900;
  align-items: center;
  line-height: 0.85em;
  color: transparent;
  -webkit-text-stroke-width: 2px;
  -webkit-text-stroke-color: rgb(255, 255, 255);
  margin: 0;
  padding: 0;
  left: 1.5rem;
  top: 11rem;
}

strong.viper {
  top: 9rem;
  left: 1.5rem;
  font-size: 3.5rem;
}

@media (max-width: 980px) {
  .card-border {
    width: 100%;
    height: 260px;
    border-radius: 0.75rem;
  }
  .viper {
    font-size: 3.2rem;
  }
  strong.viper {
    font-size: 3.2rem;
  }
}

#text-border {
  position: absolute;
  top: 15.35rem;
  left: 1.5rem;
  width: calc(100% - 3rem);
  height: fit-content;
  color: transparent;
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: rgb(255, 255, 255);
  background: linear-gradient(90deg,  transparent 100%, #ffffff  65%);
  background-size: cover;
  background-clip: text;
  -webkit-background-clip: text;
}

#text-ext {
  z-index: -1;
  display: flex;
  position: absolute;
  inset: 1rem;
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: #ffffff;
  background: linear-gradient(346.80deg, rgb(255, 255, 255)  30%, #ffffff 30%, #ffffff 30%, rgb(255, 255, 255)  32%, rgb(255, 255, 255)  32%, rgb(255, 255, 255) 35%);
  background-size: cover;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  padding: 9rem 0 0 0.5rem;
}

.marquee {
  top: 0;
  z-index: -5;
  width: 100%;
  height: 100%;
  position: absolute;
  overflow: hidden;
  --offset: 2rem;
  --move-initial: calc(-20% + var(--offset));
  --move-final: calc(-85% + var(--offset));
  border-radius: 0px 1rem;
  filter: opacity(0.3);
}

.marquee__inner {
  width: fit-content;
  display: flex;
  position: relative;
  transform: translate3d(var(--move-initial), 0, 0);
  animation: slide 60s linear infinite;
  border-radius: 0px 1rem;
}

.marquee__inner {
  animation-play-state: running;
}

#blur-area {
  display: block;
  position: absolute;
  z-index: -1;
  inset: 0;
  border-radius: 0 1rem;
  backdrop-filter: blur(3px);
  background: linear-gradient(90deg, transparent  0%, #00000044 100%);
}

.mist-container {
  position: absolute;
  width: 450px;
  height: 150px;
  overflow: hidden;
  filter: blur(1rem);
  top: 60%;
  left: 0;
}

.mist {
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(196, 3, 3, 0.63) 10%, rgba(255, 255, 255, 0) 50%);
  animation: mist 10s infinite both;
}

.card-bg svg {
  position: absolute;
  top: 0%;
  width: 18rem;
  height: 100%;
  z-index: -2;
}

.card-border:hover {
  transform: rotateY(20deg);
}

.profile-pic {
  position: absolute;
  top: 4rem;
  right: 2rem;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #57ff95;
  box-shadow: 0 0 1.5rem #57ff95aa;
  z-index: 10;
}

.profile-pic img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.edit-profile-btn {
  position: absolute;
  top: 400px;
  left: 15%;
  transform: translateX(-50%);
  padding: 0.6rem 1.2rem;
  background: linear-gradient(135deg, #124926, #165c30);
  color: #57ff95;
  border: 1px solid #57ff95;
  border-radius: 0.5rem;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0 1rem rgba(87, 255, 149, 0.3);
  z-index: 20;
  white-space: nowrap;
}

.edit-profile-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #165c30, #1a7039);
  box-shadow: 0 0 1.5rem rgba(87, 255, 149, 0.5);
  transform: translateX(-50%) translateY(-2px);
}

.edit-profile-btn:active:not(:disabled) {
  transform: translateX(-50%) translateY(0);
}

.edit-profile-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes mist {
  0% { transform: translateX(-50%) translateY(0%) scaleY(0.7) rotate(0deg); opacity: 0.3; }
  50% { transform: translateX(0%) translateY(50%) scaleY(-10.3) rotate(20deg); opacity: 0.5; }
  100% { transform: translateX(-50%) translateY(0%) scaleY(0.7) rotate(-20deg); opacity: 0.3; }
}

@keyframes pulse_3011 {
  0% { box-shadow: 0 0 1rem #57ff95; }
  70% { box-shadow: 0 0 2rem #57ff95; }
  100% { box-shadow: 0 0 1rem #57ff95; }
}

@keyframes slide {
  0% { transform: translate3d(var(--move-initial), 0, 0); }
  100% { transform: translate3d(var(--move-final), 0, 0); }
}
`
