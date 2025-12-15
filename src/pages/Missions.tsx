// src/pages/Missions.tsx
// Complete missions page with tabs, categories, and timer system

import { useState, useEffect } from 'react'
import { useUser } from '../hooks/useUser'
import { GlassCard } from '../components/ui/GlassCard'
import { GradientButton } from '../components/ui/GradientButton'
import { PageContainer } from '../components/ui/PageContainer'
import * as MissionsData from '../data/missions/missions'
import type { Mission, ActiveMission } from '../data/missions/missions'

const ALL_MISSIONS = MissionsData.ALL_MISSIONS || []
const getMissionById = MissionsData.getMissionById

type TabType = 'available' | 'active' | 'completed'
type CategoryFilter = 'all' | 'combat' | 'smuggling' | 'hacking' | 'exploration'

const Missions = () => {
  const { user, updateUser } = useUser()

  // Debug log to check if missions are loading
  useEffect(() => {
    console.log('ALL_MISSIONS:', ALL_MISSIONS)
    console.log('MissionsData:', MissionsData)
  }, [])
  const [activeTab, setActiveTab] = useState<TabType>('available')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)
  const [now, setNow] = useState(() => Date.now())

  // Update time every second for timer display
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Check for expired missions every second
  useEffect(() => {
    if (!user?.activeMissions || user.activeMissions.length === 0) return

    const activeMissions = user.activeMissions as ActiveMission[]
    const expiredMissions = activeMissions.filter(
      (m: ActiveMission) => Date.now() >= m.expiresAt
    )

    if (expiredMissions.length > 0) {
      // Remove expired missions
      const remainingMissions = activeMissions.filter(
        (m: ActiveMission) => Date.now() < m.expiresAt
      )

      updateUser({ activeMissions: remainingMissions })

      // Show failure notification
      expiredMissions.forEach((m: ActiveMission) => {
        alert(`❌ MISSION FAILED: ${m.name}\nYou ran out of time!`)
      })
    }
  }, [now, user?.activeMissions, updateUser])

  if (!user) return null

  const activeMissions = (user.activeMissions || []) as ActiveMission[]
  const completedMissions = (user.completedMissions || []) as string[] // Array of mission IDs

  // Filter available missions
  const getAvailableMissions = () => {
    if (!ALL_MISSIONS || !Array.isArray(ALL_MISSIONS)) {
      return []
    }

    let missions = ALL_MISSIONS

    // Filter out already active missions
    missions = missions.filter(
      (m: Mission) =>
        !activeMissions.find((am: ActiveMission) => am.id === m.id)
    )

    // Filter out completed missions
    missions = missions.filter(
      (m: Mission) => !completedMissions.includes(m.id)
    )

    // Apply category filter
    if (categoryFilter !== 'all') {
      missions = missions.filter((m: Mission) => m.category === categoryFilter)
    }

    return missions
  }

  // Check if user meets mission requirements
  const meetsRequirements = (mission: Mission): boolean => {
    if (!mission.requirements || mission.requirements.length === 0) return true

    // Simple requirement checking (you can expand this)
    for (const req of mission.requirements) {
      if (req.startsWith('Level ')) {
        const requiredLevel = parseInt(
          req.replace('Level ', '').replace('+', '')
        )
        if (user.level < requiredLevel) return false
      }
      // Add more requirement checks as needed
    }

    return true
  }

  // Accept a mission
  const handleAcceptMission = (mission: Mission) => {
    if (activeMissions.length >= 3) {
      alert('⚠️ You can only have 3 active missions at a time!')
      return
    }

    if (!meetsRequirements(mission)) {
      alert('⚠️ You do not meet the requirements for this mission!')
      return
    }

    const timestamp = new Date().getTime()
    const activeMission: ActiveMission = {
      ...mission,
      acceptedAt: timestamp,
      expiresAt: timestamp + mission.timeLimit * 60 * 1000, // Convert minutes to milliseconds
    }

    updateUser({
      activeMissions: [...activeMissions, activeMission],
    })

    alert(
      `✅ Mission Accepted: ${mission.name}\nYou have ${mission.timeLimit} minutes to complete it!`
    )
    setSelectedMission(null)
  }

  // Complete a mission
  const handleCompleteMission = (mission: ActiveMission) => {
    const confirmed = window.confirm(
      `Complete mission: ${mission.name}?\n\n` +
        `Rewards:\n` +
        `💰 $${mission.moneyReward.toLocaleString()}\n` +
        `⭐ ${mission.expReward} XP`
    )

    if (!confirmed) return

    // Give rewards
    updateUser({
      money: user.money + mission.moneyReward,
      experience: user.experience + mission.expReward,
      activeMissions: activeMissions.filter((m) => m.id !== mission.id),
      completedMissions: [...completedMissions, mission.id],
    })

    alert(
      `🎉 MISSION COMPLETE!\n\n+$${mission.moneyReward.toLocaleString()}\n+${
        mission.expReward
      } XP`
    )
  }

  // Abandon a mission
  const handleAbandonMission = (mission: ActiveMission) => {
    const confirmed = window.confirm(
      `Abandon mission: ${mission.name}?\n\nYou will not receive any rewards.`
    )
    if (!confirmed) return

    updateUser({
      activeMissions: activeMissions.filter((m) => m.id !== mission.id),
    })

    alert(`Mission abandoned: ${mission.name}`)
  }

  // Format time remaining
  const formatTimeRemaining = (expiresAt: number): string => {
    const remaining = Math.max(0, expiresAt - now)
    const minutes = Math.floor(remaining / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const categoryIcons = {
    all: '🌟',
    combat: '💥',
    smuggling: '📦',
    hacking: '💻',
    exploration: '🌌',
  }

  return (
    <PageContainer>
      <style>{styles}</style>

      <div className="missions-header">
        <h1>Mission Board</h1>
        <p>Accept missions to earn credits and experience</p>
      </div>

      {/* Tabs */}
      <div className="missions-tabs">
        <button
          className={`tab ${activeTab === 'available' ? 'active' : ''}`}
          onClick={() => setActiveTab('available')}
        >
          📋 Available ({getAvailableMissions().length})
        </button>
        <button
          className={`tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          ⏱️ Active ({activeMissions.length}/3)
        </button>
        <button
          className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          ✅ Completed ({completedMissions.length})
        </button>
      </div>

      {/* Category Filter (only show on Available tab) */}
      {activeTab === 'available' && (
        <div className="category-filter">
          {(
            [
              'all',
              'combat',
              'smuggling',
              'hacking',
              'exploration',
            ] as CategoryFilter[]
          ).map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${categoryFilter === cat ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {categoryIcons[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="missions-content">
        {/* AVAILABLE MISSIONS */}
        {activeTab === 'available' && (
          <div className="missions-grid">
            {getAvailableMissions().length === 0 ? (
              <GlassCard>
                <div className="empty-state">
                  <div className="empty-icon">🚀</div>
                  <div>No missions available in this category</div>
                </div>
              </GlassCard>
            ) : (
              getAvailableMissions().map((mission) => (
                <GlassCard key={mission.id} hover className="mission-card">
                  <div className="mission-category">
                    {categoryIcons[mission.category]} {mission.category}
                  </div>
                  <h3 className="mission-name">{mission.name}</h3>
                  <p className="mission-desc">{mission.description}</p>

                  <div className="mission-details">
                    <div className="detail-item">
                      <span className="detail-label">📍 Location:</span>
                      <span>{mission.location}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">💰 Reward:</span>
                      <span>${mission.moneyReward.toLocaleString()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">⭐ EXP:</span>
                      <span>{mission.expReward}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">⏱️ Time Limit:</span>
                      <span>{mission.timeLimit}m</span>
                    </div>
                  </div>

                  {mission.requirements && mission.requirements.length > 0 && (
                    <div className="requirements">
                      <div className="req-label">Requirements:</div>
                      {mission.requirements.map((req, i) => (
                        <div
                          key={i}
                          className={`requirement ${
                            meetsRequirements(mission) ? 'met' : 'unmet'
                          }`}
                        >
                          {meetsRequirements(mission) ? '✅' : '❌'} {req}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mission-actions">
                    <GradientButton
                      gradient="blue"
                      onClick={() => setSelectedMission(mission)}
                    >
                      View Details
                    </GradientButton>
                    <GradientButton
                      gradient={meetsRequirements(mission) ? 'purple' : 'blue'}
                      onClick={() => handleAcceptMission(mission)}
                      disabled={!meetsRequirements(mission)}
                    >
                      Accept Mission
                    </GradientButton>
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        )}

        {/* ACTIVE MISSIONS */}
        {activeTab === 'active' && (
          <div className="missions-grid">
            {activeMissions.length === 0 ? (
              <GlassCard>
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <div>No active missions</div>
                  <button
                    className="link-btn"
                    onClick={() => setActiveTab('available')}
                  >
                    Browse Available Missions →
                  </button>
                </div>
              </GlassCard>
            ) : (
              activeMissions.map((mission) => {
                const timeRemaining = formatTimeRemaining(mission.expiresAt)
                const isExpiringSoon = mission.expiresAt - now < 300000 // Less than 5 minutes

                return (
                  <GlassCard key={mission.id} className="mission-card active">
                    <div className="mission-category">
                      {categoryIcons[mission.category]} {mission.category}
                    </div>
                    <h3 className="mission-name">{mission.name}</h3>

                    <div className={`timer ${isExpiringSoon ? 'warning' : ''}`}>
                      ⏱️ Time Remaining: {timeRemaining}
                    </div>

                    <div className="mission-details">
                      <div className="detail-item">
                        <span className="detail-label">📍 Location:</span>
                        <span>{mission.location}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">💰 Reward:</span>
                        <span>${mission.moneyReward.toLocaleString()}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">⭐ EXP:</span>
                        <span>{mission.expReward}</span>
                      </div>
                    </div>

                    <div className="mission-actions">
                      <GradientButton
                        gradient="green"
                        onClick={() => handleCompleteMission(mission)}
                      >
                        ✅ Complete Mission
                      </GradientButton>
                      <GradientButton
                        gradient="purple"
                        onClick={() => handleAbandonMission(mission)}
                      >
                        ❌ Abandon
                      </GradientButton>
                    </div>
                  </GlassCard>
                )
              })
            )}
          </div>
        )}

        {/* COMPLETED MISSIONS */}
        {activeTab === 'completed' && (
          <div className="missions-grid">
            {completedMissions.length === 0 ? (
              <GlassCard>
                <div className="empty-state">
                  <div className="empty-icon">🏆</div>
                  <div>No completed missions yet</div>
                  <button
                    className="link-btn"
                    onClick={() => setActiveTab('available')}
                  >
                    Start Your First Mission →
                  </button>
                </div>
              </GlassCard>
            ) : (
              completedMissions.map((missionId) => {
                const mission = getMissionById(missionId)
                if (!mission) return null

                return (
                  <GlassCard
                    key={mission.id}
                    className="mission-card completed"
                  >
                    <div className="completed-badge">✅ COMPLETED</div>
                    <div className="mission-category">
                      {categoryIcons[mission.category]} {mission.category}
                    </div>
                    <h3 className="mission-name">{mission.name}</h3>
                    <p className="mission-desc">{mission.description}</p>

                    <div className="mission-details">
                      <div className="detail-item">
                        <span className="detail-label">💰 Earned:</span>
                        <span>${mission.moneyReward.toLocaleString()}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">⭐ EXP Gained:</span>
                        <span>{mission.expReward}</span>
                      </div>
                    </div>
                  </GlassCard>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Mission Details Modal */}
      {selectedMission && (
        <div className="modal-overlay" onClick={() => setSelectedMission(null)}>
          <GlassCard className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <div className="mission-category">
                    {categoryIcons[selectedMission.category]}{' '}
                    {selectedMission.category}
                  </div>
                  <h2>{selectedMission.name}</h2>
                </div>
                <button
                  className="close-btn"
                  onClick={() => setSelectedMission(null)}
                >
                  ✕
                </button>
              </div>

              <p className="mission-desc">{selectedMission.description}</p>

              <div className="modal-details">
                <div className="detail-row">
                  <span className="label">📍 Location:</span>
                  <span>{selectedMission.location}</span>
                </div>
                <div className="detail-row">
                  <span className="label">💰 Money Reward:</span>
                  <span>${selectedMission.moneyReward.toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span className="label">⭐ EXP Reward:</span>
                  <span>{selectedMission.expReward}</span>
                </div>
                <div className="detail-row">
                  <span className="label">⏱️ Time Limit:</span>
                  <span>{selectedMission.timeLimit} minutes</span>
                </div>
              </div>

              {selectedMission.requirements &&
                selectedMission.requirements.length > 0 && (
                  <div className="requirements">
                    <div className="req-label">Requirements:</div>
                    {selectedMission.requirements.map((req, i) => (
                      <div
                        key={i}
                        className={`requirement ${
                          meetsRequirements(selectedMission) ? 'met' : 'unmet'
                        }`}
                      >
                        {meetsRequirements(selectedMission) ? '✅' : '❌'} {req}
                      </div>
                    ))}
                  </div>
                )}

              <div className="modal-actions">
                <GradientButton
                  gradient={
                    meetsRequirements(selectedMission) ? 'purple' : 'blue'
                  }
                  onClick={() => handleAcceptMission(selectedMission)}
                  disabled={!meetsRequirements(selectedMission)}
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
    </PageContainer>
  )
}

const styles = `
  .missions-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .missions-header h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    background: linear-gradient(90deg, #4a9eff, #74c3ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .missions-header p {
    color: #8ab9d4;
    font-size: 0.9rem;
  }

  .missions-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    border-bottom: 2px solid rgba(30, 77, 122, 0.5);
  }

  .tab {
    padding: 0.75rem 1.5rem;
    background: transparent;
    border: none;
    border-bottom: 3px solid transparent;
    color: #6ba3bf;
    font-size: 0.9rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
  }

  .tab:hover {
    color: #fff;
    background: rgba(30, 77, 122, 0.3);
  }

  .tab.active {
    color: #fff;
    border-bottom-color: #4a9eff;
    background: rgba(30, 77, 122, 0.5);
  }

  .category-filter {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }

  .filter-btn {
    padding: 0.5rem 1rem;
    background: rgba(30, 77, 122, 0.3);
    border: 1px solid rgba(30, 77, 122, 0.5);
    border-radius: 20px;
    color: #6ba3bf;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .filter-btn:hover {
    background: rgba(30, 77, 122, 0.5);
    color: #fff;
  }

  .filter-btn.active {
    background: rgba(74, 158, 255, 0.3);
    border-color: #4a9eff;
    color: #fff;
  }

  .missions-content {
    min-height: 400px;
  }

  .missions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
  }

  .mission-card {
    position: relative;
    padding: 1.5rem;
    transition: transform 0.2s;
  }

  .mission-card.active {
    border: 2px solid #4a9eff;
    box-shadow: 0 0 20px rgba(74, 158, 255, 0.3);
  }

  .mission-card.completed {
    opacity: 0.8;
  }

  .mission-category {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background: rgba(74, 158, 255, 0.2);
    border: 1px solid rgba(74, 158, 255, 0.5);
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: bold;
    text-transform: uppercase;
    margin-bottom: 0.75rem;
    color: #4a9eff;
  }

  .completed-badge {
    position: absolute;
    top: 1rem;
    right: 1rem;
    padding: 0.25rem 0.75rem;
    background: rgba(34, 197, 94, 0.2);
    border: 1px solid rgba(34, 197, 94, 0.5);
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: bold;
    color: #22c55e;
  }

  .mission-name {
    font-size: 1.25rem;
    margin-bottom: 0.75rem;
    color: #fff;
  }

  .mission-desc {
    font-size: 0.9rem;
    color: #8ab9d4;
    line-height: 1.5;
    margin-bottom: 1rem;
  }

  .timer {
    font-size: 1.1rem;
    font-weight: bold;
    color: #4a9eff;
    text-align: center;
    padding: 0.75rem;
    background: rgba(74, 158, 255, 0.1);
    border: 2px solid rgba(74, 158, 255, 0.3);
    border-radius: 8px;
    margin-bottom: 1rem;
    font-family: 'Courier New', monospace;
  }

  .timer.warning {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.5);
    animation: pulse 1s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  .mission-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 4px;
  }

  .detail-label {
    color: #8ab9d4;
    font-weight: 600;
  }

  .requirements {
    margin-bottom: 1rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 6px;
  }

  .req-label {
    font-size: 0.8rem;
    font-weight: bold;
    color: #8ab9d4;
    margin-bottom: 0.5rem;
  }

  .requirement {
    font-size: 0.8rem;
    padding: 0.25rem 0;
  }

  .requirement.met {
    color: #22c55e;
  }

  .requirement.unmet {
    color: #ef4444;
  }

  .mission-actions {
    display: flex;
    gap: 0.75rem;
  }

  .mission-actions button {
    flex: 1;
  }

  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .link-btn {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background: transparent;
    border: 1px solid #4a9eff;
    border-radius: 6px;
    color: #4a9eff;
    cursor: pointer;
    transition: all 0.2s;
  }

  .link-btn:hover {
    background: rgba(74, 158, 255, 0.1);
  }

  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 2rem;
  }

  .modal {
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-content {
    padding: 2rem;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .modal-header h2 {
    font-size: 1.5rem;
    color: #fff;
    margin-top: 0.5rem;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: #8ab9d4;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  .modal-details {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 6px;
    font-size: 0.9rem;
  }

  .detail-row .label {
    color: #8ab9d4;
    font-weight: 600;
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  @media (max-width: 768px) {
    .missions-grid {
      grid-template-columns: 1fr;
    }

    .missions-tabs {
      flex-direction: column;
    }

    .tab {
      text-align: left;
    }
  }
`

export default Missions
