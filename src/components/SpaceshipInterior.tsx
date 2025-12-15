// src/components/SpaceshipInterior.tsx
import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useUser'

interface SpaceshipInteriorProps {
  onNavigate?: (path: string) => void
}

const SpaceshipInterior: React.FC<SpaceshipInteriorProps> = ({
  onNavigate,
}) => {
  const cockpitRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { user } = useUser()

  useEffect(() => {
    const cockpit = cockpitRef.current
    if (!cockpit) return

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.pageX / window.innerWidth - 0.5
      const y = e.pageY / window.innerHeight - 0.5
      cockpit.style.transform = `
        perspective(120vw)
        rotateX(${y * 10 + 70}deg)
        rotateZ(${-x * 20 + 45}deg)
        translateZ(-8vw)
      `
    }

    document.body.addEventListener('pointermove', handleMouseMove)
    return () =>
      document.body.removeEventListener('pointermove', handleMouseMove)
  }, [])

  const handleNavClick = (path: string) => {
    if (onNavigate) {
      onNavigate(path)
    } else {
      navigate(path)
    }
  }

  if (!user) return null

  return (
    <>
      <style>{cockpitStyles}</style>
      <div className="cockpit-scene">
        <div className="cockpit" id="cockpit" ref={cockpitRef}>
          {/* Cockpit Lights */}
          <div className="cockpit-lights">
            <div className="cockpit-light light-1"></div>
            <div className="cockpit-light light-2"></div>
            <div className="cockpit-light light-3"></div>
            <div className="cockpit-light light-4"></div>
          </div>

          {/* Floor */}
          <div className="floor">
            <div className="floor__front face"></div>
            <div className="floor__back face"></div>
            <div className="floor__right face"></div>
            <div className="floor__left face"></div>
            <div className="floor__top face">
              <div className="floor-glow"></div>
            </div>
            <div className="floor__bottom face"></div>
          </div>

          {/* Left Wall */}
          <div className="wall-left">
            <div className="wall-left__front face"></div>
            <div className="wall-left__back face"></div>
            <div className="wall-left__right face"></div>
            <div className="wall-left__left face"></div>
            <div className="wall-left__top face"></div>
            <div className="wall-left__bottom face"></div>
          </div>

          {/* Right Wall */}
          <div className="wall-right">
            <div className="wall-right__front face"></div>
            <div className="wall-right__back face"></div>
            <div className="wall-right__right face"></div>
            <div className="wall-right__left face"></div>
            <div className="wall-right__top face"></div>
            <div className="wall-right__bottom face"></div>
          </div>

          {/* Main Control Panel (Center) */}
          <div className="control-panel-main">
            <div className="control-panel-main__front face">
              <div className="panel-title">NAVIGATION</div>
              <div className="panel-grid">
                <button
                  className="panel-btn"
                  onClick={() => handleNavClick('/crimes')}
                >
                  <span className="btn-icon">🔫</span>
                  <span className="btn-label">Crimes</span>
                </button>
                <button
                  className="panel-btn"
                  onClick={() => handleNavClick('/casino')}
                >
                  <span className="btn-icon">🎰</span>
                  <span className="btn-label">Casino</span>
                </button>
                <button
                  className="panel-btn"
                  onClick={() => handleNavClick('/gym')}
                >
                  <span className="btn-icon">💪</span>
                  <span className="btn-label">Gym</span>
                </button>
                <button
                  className="panel-btn"
                  onClick={() => handleNavClick('/stargate')}
                >
                  <span className="btn-icon">🌌</span>
                  <span className="btn-label">StarGate</span>
                </button>
                <button
                  className="panel-btn"
                  onClick={() => handleNavClick('/market')}
                >
                  <span className="btn-icon">🛒</span>
                  <span className="btn-label">Market</span>
                </button>
                <button
                  className="panel-btn"
                  onClick={() => handleNavClick('/inventory')}
                >
                  <span className="btn-icon">🎒</span>
                  <span className="btn-label">Inventory</span>
                </button>
              </div>
            </div>
            <div className="control-panel-main__back face"></div>
            <div className="control-panel-main__right face"></div>
            <div className="control-panel-main__left face"></div>
            <div className="control-panel-main__top face"></div>
            <div className="control-panel-main__bottom face"></div>
          </div>

          {/* Stats Panel (Left) */}
          <div className="stats-panel">
            <div className="stats-panel__front face">
              <div className="panel-title">STATUS</div>
              <div className="stats-display">
                <div className="stat-row">
                  <span className="stat-label">LEVEL</span>
                  <span className="stat-value">{user.level}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">CHIPS</span>
                  <span className="stat-value stat-money">
                    ${user.money.toLocaleString()}
                  </span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">ENERGY</span>
                  <div className="stat-bar">
                    <div
                      className="stat-bar-fill energy"
                      style={{
                        width: `${(user.energy / user.maxEnergy) * 100}%`,
                      }}
                    ></div>
                    <span className="stat-bar-text">
                      {user.energy}/{user.maxEnergy}
                    </span>
                  </div>
                </div>
                <div className="stat-row">
                  <span className="stat-label">HEALTH</span>
                  <div className="stat-bar">
                    <div
                      className="stat-bar-fill health"
                      style={{
                        width: `${(user.health / user.maxHealth) * 100}%`,
                      }}
                    ></div>
                    <span className="stat-bar-text">
                      {user.health}/{user.maxHealth}
                    </span>
                  </div>
                </div>
                <div className="stat-row">
                  <span className="stat-label">HEAT</span>
                  <div className="stat-bar">
                    <div
                      className="stat-bar-fill heat"
                      style={{
                        width: `${Math.min((user.heat / 100) * 100, 100)}%`,
                      }}
                    ></div>
                    <span className="stat-bar-text">{user.heat}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="stats-panel__back face"></div>
            <div className="stats-panel__right face"></div>
            <div className="stats-panel__left face"></div>
            <div className="stats-panel__top face"></div>
            <div className="stats-panel__bottom face"></div>
          </div>

          {/* Ship Info Panel (Right) */}
          <div className="ship-panel">
            <div className="ship-panel__front face">
              <div className="panel-title">SHIP STATUS</div>
              <div className="stats-display">
                <div className="stat-row">
                  <span className="stat-label">
                    {user.ship?.name || 'NO SHIP'}
                  </span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">HULL</span>
                  <div className="stat-bar">
                    <div
                      className="stat-bar-fill hull"
                      style={{
                        width: `${
                          ((user.ship?.hull || 0) / (user.ship?.maxHull || 1)) *
                          100
                        }%`,
                      }}
                    ></div>
                    <span className="stat-bar-text">
                      {user.ship?.hull || 0}/{user.ship?.maxHull || 0}
                    </span>
                  </div>
                </div>
                <div className="stat-row">
                  <span className="stat-label">SHIELDS</span>
                  <div className="stat-bar">
                    <div
                      className="stat-bar-fill shields"
                      style={{
                        width: `${
                          ((user.ship?.shields || 0) /
                            (user.ship?.maxShields || 1)) *
                          100
                        }%`,
                      }}
                    ></div>
                    <span className="stat-bar-text">
                      {user.ship?.shields || 0}/{user.ship?.maxShields || 0}
                    </span>
                  </div>
                </div>
                <div className="stat-row">
                  <span className="stat-label">CARGO</span>
                  <div className="stat-bar">
                    <div
                      className="stat-bar-fill cargo"
                      style={{
                        width: `${
                          ((user.ship?.cargo?.length || 0) /
                            (user.ship?.cargoCapacity || 1)) *
                          100
                        }%`,
                      }}
                    ></div>
                    <span className="stat-bar-text">
                      {user.ship?.cargo?.length || 0}/
                      {user.ship?.cargoCapacity || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="ship-panel__back face"></div>
            <div className="ship-panel__right face"></div>
            <div className="ship-panel__left face"></div>
            <div className="ship-panel__top face"></div>
            <div className="ship-panel__bottom face"></div>
          </div>

          {/* Hologram Displays */}
          <div className="hologram hologram-1">
            <div className="hologram__front face"></div>
            <div className="hologram__back face"></div>
            <div className="hologram__right face">
              <div className="hologram-content">ONLINE</div>
            </div>
            <div className="hologram__left face"></div>
            <div className="hologram__top face"></div>
            <div className="hologram__bottom face"></div>
          </div>

          <div className="hologram hologram-2">
            <div className="hologram__front face"></div>
            <div className="hologram__back face"></div>
            <div className="hologram__right face">
              <div className="hologram-content">SYSTEMS OK</div>
            </div>
            <div className="hologram__left face"></div>
            <div className="hologram__top face"></div>
            <div className="hologram__bottom face"></div>
          </div>
        </div>
      </div>
    </>
  )
}

const cockpitStyles = `
*, *::after, *::before {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  user-select: none;
  transform-style: preserve-3d;
  -webkit-tap-highlight-color: transparent;
}

.cockpit-scene {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  cursor: pointer;
  background-image: radial-gradient(circle, hsl(220, 28%, 8%), hsl(220, 28%, 3%));
  position: relative;
}

.face {
  position: absolute;
}

.cockpit {
  position: absolute;
  width: 35vw;
  height: 35vw;
  transform: perspective(120vw) rotateX(70deg) rotateZ(45deg) translateZ(-8vw);
  transition: transform 0.1s ease-out;
}

.cockpit-lights {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  width: 50vw;
  height: 50vw;
  pointer-events: none;
}

.cockpit-light {
  position: absolute;
  border-radius: 50%;
  filter: blur(2vw);
}

.light-1 {
  bottom: 8vw;
  right: 5vw;
  width: 16vw;
  height: 16vw;
  background-image: radial-gradient(hsl(220, 28%, 12%), transparent);
}

.light-2 {
  bottom: 20vw;
  right: 2vw;
  width: 3vw;
  height: 14vw;
  transform: rotateZ(-50deg);
  background-image: radial-gradient(rgba(84, 116, 251, 0.5) 50%, rgba(40, 60, 210, 0.5), transparent);
  box-shadow: -1vw -1vw 2vw 1vw rgba(100, 140, 251, 0.15);
}

.light-3 {
  bottom: 0vw;
  right: 18vw;
  width: 6vw;
  height: 15vw;
  transform: rotateZ(-50deg);
  background-image: radial-gradient(rgba(84, 116, 251, 0.6) 50%, rgba(40, 60, 210, 0.6), transparent);
  filter: blur(2.5vw);
}

.light-4 {
  bottom: 8vw;
  left: 10vw;
  width: 32vw;
  height: 5vw;
  transform-origin: top left;
  transform: skewX(58deg);
  background-image: linear-gradient(to right, rgba(84, 116, 251, 0.1) 10%, transparent 25%, transparent, rgba(0, 0, 0, 0.2));
  filter: blur(0.5vw);
}

/* Floor */
.floor {
  position: absolute;
  left: 0;
  top: 0;
  width: 35vw;
  height: 35vw;
}

.floor__front {
  width: 35vw;
  height: 0.5vw;
  transform-origin: bottom left;
  transform: rotateX(-90deg) translateZ(-0.25vw);
  background-color: hsl(250, 28%, 20%);
}

.floor__back {
  width: 35vw;
  height: 0.5vw;
  transform-origin: top left;
  transform: rotateX(-90deg) rotateY(180deg) translateX(-35vw) translateY(-0.5vw);
  background-color: hsl(250, 28%, 15%);
}

.floor__right {
  width: 1vw;
  height: 0.5vw;
  transform-origin: top left;
  transform: rotateY(90deg) rotateZ(-90deg) translateZ(35vw) translateX(-1vw) translateY(-0.5vw);
  background-color: hsl(250, 28%, 15%);
}

.floor__left {
  width: 1vw;
  height: 0.5vw;
  transform-origin: top left;
  transform: rotateY(-90deg) rotateZ(90deg) translateY(-0.5vw);
  background-color: hsl(250, 28%, 22%);
}

.floor__top {
  width: 35vw;
  height: 35vw;
  transform-origin: top left;
  transform: translateZ(0.5vw);
  background-image: linear-gradient(to bottom, hsl(250, 28%, 12%), hsl(250, 28%, 18%), hsl(250, 28%, 20%));
  overflow: hidden;
}

.floor-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: linear-gradient(to bottom, rgba(40, 60, 210, 0.4), transparent 30%, transparent 70%, rgba(84, 116, 251, 0.4));
}

.floor__bottom {
  width: 35vw;
  height: 35vw;
  transform-origin: top left;
  transform: rotateY(180deg) translateX(-35vw);
  background-color: hsl(250, 28%, 15%);
}

/* Walls */
.wall-left {
  position: absolute;
  left: 0;
  top: 0;
  width: 1vw;
  height: 35vw;
  transform: translateZ(0.5vw);
}

.wall-left__front {
  width: 1vw;
  height: 18vw;
  transform-origin: bottom left;
  transform: rotateX(-90deg) translateZ(-18vw);
  background-image: linear-gradient(to bottom, hsl(250, 28%, 15%), hsl(250, 28%, 20%));
}

.wall-left__back {
  width: 1vw;
  height: 18vw;
  transform-origin: top left;
  transform: rotateX(-90deg) rotateY(180deg) translateX(-1vw) translateY(-18vw);
  background-color: hsl(250, 28%, 15%);
}

.wall-left__right {
  width: 35vw;
  height: 18vw;
  transform-origin: top left;
  transform: rotateY(90deg) rotateZ(-90deg) translateZ(1vw) translateX(-35vw) translateY(-18vw);
  background-image: linear-gradient(to bottom, hsl(240, 28%, 8%), hsl(240, 28%, 13%), hsl(240, 28%, 13%) 90%, hsl(240, 28%, 10%));
}

.wall-left__left {
  width: 35vw;
  height: 18vw;
  transform-origin: top left;
  transform: rotateY(-90deg) rotateZ(90deg) translateY(-18vw);
  background-color: hsl(250, 28%, 22%);
}

.wall-left__top {
  width: 1vw;
  height: 35vw;
  transform-origin: top left;
  transform: translateZ(18vw);
  background-color: hsl(250, 28%, 22%);
}

.wall-left__bottom {
  width: 1vw;
  height: 35vw;
  transform-origin: top left;
  transform: rotateY(180deg) translateX(-1vw);
  background-color: hsl(250, 28%, 15%);
}

.wall-right {
  position: absolute;
  right: 0;
  top: 0;
  width: 1vw;
  height: 35vw;
  transform: translateZ(0.5vw);
}

.wall-right__front {
  width: 1vw;
  height: 18vw;
  transform-origin: bottom left;
  transform: rotateX(-90deg) translateZ(-18vw);
  background-image: linear-gradient(to bottom, hsl(250, 28%, 15%), hsl(250, 28%, 18%));
}

.wall-right__back {
  width: 1vw;
  height: 18vw;
  transform-origin: top left;
  transform: rotateX(-90deg) rotateY(180deg) translateX(-1vw) translateY(-18vw);
  background-color: hsl(250, 28%, 15%);
}

.wall-right__right {
  width: 35vw;
  height: 18vw;
  transform-origin: top left;
  transform: rotateY(90deg) rotateZ(-90deg) translateZ(1vw) translateX(-35vw) translateY(-18vw);
  background-image: radial-gradient(circle, hsl(240, 28%, 12%), hsl(240, 28%, 8%));
}

.wall-right__left {
  width: 35vw;
  height: 18vw;
  transform-origin: top left;
  transform: rotateY(-90deg) rotateZ(90deg) translateY(-18vw);
  background-color: hsl(250, 28%, 22%);
}

.wall-right__top {
  width: 1vw;
  height: 35vw;
  transform-origin: top left;
  transform: translateZ(18vw);
  background-color: hsl(250, 28%, 18%);
}

.wall-right__bottom {
  width: 1vw;
  height: 35vw;
  transform-origin: top left;
  transform: rotateY(180deg) translateX(-1vw);
  background-color: hsl(250, 28%, 15%);
}

/* Control Panels */
.control-panel-main {
  position: absolute;
  left: 10vw;
  top: 12vw;
  width: 15vw;
  height: 5vw;
  transform: translateZ(8vw);
}

.control-panel-main__front {
  width: 15vw;
  height: 5vw;
  transform-origin: bottom left;
  transform: rotateX(-90deg) translateZ(-5vw);
  background: linear-gradient(to bottom, hsl(240, 40%, 25%), hsl(240, 40%, 18%));
  border: 0.1vw solid hsl(220, 60%, 35%);
  padding: 0.5vw;
  display: flex;
  flex-direction: column;
  gap: 0.5vw;
}

.control-panel-main__back {
  width: 15vw;
  height: 5vw;
  transform-origin: top left;
  transform: rotateX(-90deg) rotateY(180deg) translateX(-15vw) translateY(-5vw);
  background-color: hsl(240, 28%, 12%);
}

.control-panel-main__right {
  width: 5vw;
  height: 5vw;
  transform-origin: top left;
  transform: rotateY(90deg) rotateZ(-90deg) translateZ(15vw) translateX(-5vw) translateY(-5vw);
  background: hsl(240, 28%, 15%);
}

.control-panel-main__left {
  width: 5vw;
  height: 5vw;
  transform-origin: top left;
  transform: rotateY(-90deg) rotateZ(90deg) translateY(-5vw);
  background: hsl(240, 28%, 20%);
}

.control-panel-main__top {
  width: 15vw;
  height: 5vw;
  transform-origin: top left;
  transform: translateZ(5vw);
  background: linear-gradient(to right, hsl(240, 28%, 22%), hsl(240, 28%, 18%));
}

.control-panel-main__bottom {
  width: 15vw;
  height: 5vw;
  transform-origin: top left;
  transform: rotateY(180deg) translateX(-15vw);
  background: hsl(240, 28%, 12%);
}

.panel-title {
  font-size: 0.6vw;
  font-weight: 700;
  color: hsl(220, 95%, 65%);
  text-transform: uppercase;
  letter-spacing: 0.1vw;
  margin-bottom: 0.3vw;
  text-shadow: 0 0 0.5vw rgba(84, 116, 251, 0.8);
}

.panel-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.3vw;
  flex: 1;
}

.panel-btn {
  background: linear-gradient(135deg, hsl(220, 50%, 20%), hsl(220, 50%, 15%));
  border: 0.05vw solid hsl(220, 95%, 45%);
  border-radius: 0.2vw;
  color: hsl(220, 95%, 65%);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2vw;
  padding: 0.3vw;
  font-size: 0.4vw;
  font-weight: 600;
  transition: all 0.2s;
  box-shadow: 0 0 0.3vw rgba(84, 116, 251, 0.3);
}

.panel-btn:hover {
  background: linear-gradient(135deg, hsl(220, 70%, 35%), hsl(220, 70%, 25%));
  box-shadow: 0 0 0.6vw rgba(84, 116, 251, 0.6);
  transform: translateY(-0.1vw);
}

.btn-icon {
  font-size: 0.8vw;
}

.btn-label {
  font-size: 0.35vw;
  text-transform: uppercase;
  letter-spacing: 0.02vw;
}

/* Stats Panel */
.stats-panel {
  position: absolute;
  left: 2vw;
  top: 8vw;
  width: 7vw;
  height: 10vw;
  transform: translateZ(6vw);
}

.stats-panel__front {
  width: 7vw;
  height: 5vw;
  transform-origin: bottom left;
  transform: rotateX(-90deg) translateZ(-5vw);
  background: linear-gradient(to bottom, hsl(180, 50%, 20%), hsl(180, 50%, 12%));
  border: 0.1vw solid hsl(180, 60%, 35%);
  padding: 0.4vw;
  display: flex;
  flex-direction: column;
  gap: 0.3vw;
}

.stats-panel__back {
  width: 7vw;
  height: 5vw;
  transform-origin: top left;
  transform: rotateX(-90deg) rotateY(180deg) translateX(-7vw) translateY(-5vw);
  background-color: hsl(180, 28%, 12%);
}

.stats-panel__right {
  width: 10vw;
  height: 5vw;
  transform-origin: top left;
  transform: rotateY(90deg) rotateZ(-90deg) translateZ(7vw) translateX(-10vw) translateY(-5vw);
  background: hsl(180, 28%, 15%);
}

.stats-panel__left {
  width: 10vw;
  height: 5vw;
  transform-origin: top left;
  transform: rotateY(-90deg) rotateZ(90deg) translateY(-5vw);
  background: hsl(180, 28%, 20%);
}

.stats-panel__top {
  width: 7vw;
  height: 10vw;
  transform-origin: top left;
  transform: translateZ(5vw);
  background: linear-gradient(to right, hsl(180, 28%, 22%), hsl(180, 28%, 18%));
}

.stats-panel__bottom {
  width: 7vw;
  height: 10vw;
  transform-origin: top left;
  transform: rotateY(180deg) translateX(-7vw);
  background: hsl(180, 28%, 12%);
}

/* Ship Panel */
.ship-panel {
  position: absolute;
  right: 2vw;
  top: 8vw;
  width: 7vw;
  height: 10vw;
  transform: translateZ(6vw);
}

.ship-panel__front {
  width: 7vw;
  height: 5vw;
  transform-origin: bottom left;
  transform: rotateX(-90deg) translateZ(-5vw);
  background: linear-gradient(to bottom, hsl(280, 50%, 20%), hsl(280, 50%, 12%));
  border: 0.1vw solid hsl(280, 60%, 35%);
  padding: 0.4vw;
  display: flex;
  flex-direction: column;
  gap: 0.3vw;
}

.ship-panel__back {
  width: 7vw;
  height: 5vw;
  transform-origin: top left;
  transform: rotateX(-90deg) rotateY(180deg) translateX(-7vw) translateY(-5vw);
  background-color: hsl(280, 28%, 12%);
}

.ship-panel__right {
  width: 10vw;
  height: 5vw;
  transform-origin: top left;
  transform: rotateY(90deg) rotateZ(-90deg) translateZ(7vw) translateX(-10vw) translateY(-5vw);
  background: hsl(280, 28%, 15%);
}

.ship-panel__left {
  width: 10vw;
  height: 5vw;
  transform-origin: top left;
  transform: rotateY(-90deg) rotateZ(90deg) translateY(-5vw);
  background: hsl(280, 28%, 20%);
}

.ship-panel__top {
  width: 7vw;
  height: 10vw;
  transform-origin: top left;
  transform: translateZ(5vw);
  background: linear-gradient(to right, hsl(280, 28%, 22%), hsl(280, 28%, 18%));
}

.ship-panel__bottom {
  width: 7vw;
  height: 10vw;
  transform-origin: top left;
  transform: rotateY(180deg) translateX(-7vw);
  background: hsl(280, 28%, 12%);
}

.stats-display {
  display: flex;
  flex-direction: column;
  gap: 0.25vw;
  flex: 1;
}

.stat-row {
  display: flex;
  flex-direction: column;
  gap: 0.1vw;
}

.stat-label {
  font-size: 0.35vw;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.05vw;
  font-weight: 600;
}

.stat-value {
  font-size: 0.5vw;
  color: white;
  font-weight: 700;
  font-family: monospace;
}

.stat-money {
  color: #22c55e;
}

.stat-bar {
  position: relative;
  height: 0.4vw;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 0.2vw;
  overflow: hidden;
  border: 0.02vw solid rgba(255, 255, 255, 0.2);
}

.stat-bar-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 0.2vw;
}

.stat-bar-fill.energy {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  box-shadow: 0 0 0.3vw rgba(59, 130, 246, 0.6);
}

.stat-bar-fill.health {
  background: linear-gradient(90deg, #ef4444, #f87171);
  box-shadow: 0 0 0.3vw rgba(239, 68, 68, 0.6);
}

.stat-bar-fill.heat {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
  box-shadow: 0 0 0.3vw rgba(245, 158, 11, 0.6);
}

.stat-bar-fill.hull {
  background: linear-gradient(90deg, #22c55e, #4ade80);
  box-shadow: 0 0 0.3vw rgba(34, 197, 94, 0.6);
}

.stat-bar-fill.shields {
  background: linear-gradient(90deg, #00d9ff, #60efff);
  box-shadow: 0 0 0.3vw rgba(0, 217, 255, 0.6);
}

.stat-bar-fill.cargo {
  background: linear-gradient(90deg, #8b5cf6, #a78bfa);
  box-shadow: 0 0 0.3vw rgba(139, 92, 246, 0.6);
}

.stat-bar-text {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.3vw;
  color: white;
  font-weight: 700;
  text-shadow: 0 0 0.2vw rgba(0, 0, 0, 0.8);
  z-index: 1;
}

/* Holograms */
.hologram {
  position: absolute;
  width: 0.5vw;
  height: 2vw;
}

.hologram-1 {
  left: 5vw;
  top: 4vw;
  transform: translateZ(5vw);
}

.hologram-2 {
  right: 5vw;
  top: 4vw;
  transform: translateZ(5vw);
}

.hologram__front {
  width: 0.5vw;
  height: 4vw;
  transform-origin: bottom left;
  transform: rotateX(-90deg) translateZ(-4vw);
  background-color: hsl(180, 80%, 50%, 0.1);
}

.hologram__back {
  width: 0.5vw;
  height: 4vw;
  transform-origin: top left;
  transform: rotateX(-90deg) rotateY(180deg) translateX(-0.5vw) translateY(-4vw);
  background-color: hsl(180, 80%, 50%, 0.1);
}

.hologram__right {
  width: 2vw;
  height: 4vw;
  transform-origin: top left;
  transform: rotateY(90deg) rotateZ(-90deg) translateZ(0.5vw) translateX(-2vw) translateY(-4vw);
  background: linear-gradient(to bottom, rgba(0, 217, 255, 0.4), rgba(0, 217, 255, 0.8), rgba(0, 217, 255, 0.4));
  border: 0.05vw solid rgba(0, 217, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: hologram-flicker 3s infinite;
}

.hologram__left {
  width: 2vw;
  height: 4vw;
  transform-origin: top left;
  transform: rotateY(-90deg) rotateZ(90deg) translateY(-4vw);
  background-color: hsl(180, 80%, 50%, 0.1);
}

.hologram__top {
  width: 0.5vw;
  height: 2vw;
  transform-origin: top left;
  transform: translateZ(4vw);
  background-color: hsl(180, 80%, 50%, 0.2);
}

.hologram__bottom {
  width: 0.5vw;
  height: 2vw;
  transform-origin: top left;
  transform: rotateY(180deg) translateX(-0.5vw);
  background-color: hsl(180, 80%, 50%, 0.1);
}

.hologram-content {
  font-size: 0.35vw;
  color: #00d9ff;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05vw;
  text-shadow: 0 0 0.3vw rgba(0, 217, 255, 0.8);
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
}

@keyframes hologram-flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
  75% { opacity: 0.9; }
}

@media (max-width: 768px) {
  .cockpit {
    width: 80vw;
    height: 80vw;
  }
  
  .panel-title {
    font-size: 1.2vw;
  }
  
  .btn-icon {
    font-size: 2vw;
  }
  
  .btn-label {
    font-size: 0.9vw;
  }
  
  .stat-label {
    font-size: 0.9vw;
  }
  
  .stat-value {
    font-size: 1.2vw;
  }
  
  .stat-bar-text {
    font-size: 0.8vw;
  }
  
  .hologram-content {
    font-size: 0.9vw;
  }
}
`

export default SpaceshipInterior
