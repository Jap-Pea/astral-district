// src/pages/Network.tsx - Enhanced with cool visuals and features
import React, { useEffect, useMemo, useState } from 'react'
import { PageContainer } from '../components/ui/PageContainer'
import { GlassCard } from '../components/ui/GlassCard'
import { GradientButton } from '../components/ui/GradientButton'

interface User {
  id: number
  name: string
  isApproved?: boolean
  level?: number
  contributions?: number
}

interface Vault {
  money: number
  items: string[]
  weapons: string[]
}

interface Network {
  id: number
  name: string
  boss: string
  createdAt: number
  ageDays: number
  rank: number
  notoriety: number
  members: User[]
  organizedCrimes: string[]
  vault: Vault
  boardMessages: { author: string; text: string; timestamp: number }[]
  logo?: string
  description?: string
  color?: string
}

type TabKey = 'overview' | 'members' | 'crimes' | 'board' | 'vault' | 'stats'

const crimeDefs: {
  name: string
  notorietyGain: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  icon: string
  description: string
}[] = [
  {
    name: 'Bank Heist',
    notorietyGain: 1200,
    difficulty: 'Hard',
    icon: '🏦',
    description: 'High-stakes robbery of a secure bank',
  },
  {
    name: 'Smuggling',
    notorietyGain: 400,
    difficulty: 'Medium',
    icon: '📦',
    description: 'Transport illegal goods across borders',
  },
  {
    name: 'Armored Truck Robbery',
    notorietyGain: 800,
    difficulty: 'Hard',
    icon: '🚛',
    description: 'Intercept and rob an armored vehicle',
  },
  {
    name: 'Cyber Theft',
    notorietyGain: 600,
    difficulty: 'Medium',
    icon: '💻',
    description: 'Hack into corporate systems for profit',
  },
  {
    name: 'Warehouse Raid',
    notorietyGain: 300,
    difficulty: 'Easy',
    icon: '🏭',
    description: 'Break into a warehouse and steal goods',
  },
  {
    name: 'Art Heist',
    notorietyGain: 1000,
    difficulty: 'Hard',
    icon: '🖼️',
    description: 'Steal priceless art from a museum',
  },
  {
    name: 'Drug Running',
    notorietyGain: 500,
    difficulty: 'Medium',
    icon: '💊',
    description: 'Distribute controlled substances',
  },
  {
    name: 'Protection Racket',
    notorietyGain: 350,
    difficulty: 'Easy',
    icon: '🛡️',
    description: 'Extort local businesses for protection money',
  },
]

const getCrimeByName = (name: string) => crimeDefs.find((c) => c.name === name)
const computeNotoriety = (crimes: string[]) =>
  crimes.reduce((sum, c) => sum + (getCrimeByName(c)?.notorietyGain || 0), 0)

const now = () => Date.now()

const placeholderNetworks: Network[] = [
  {
    id: 1,
    name: 'Shadow Syndicate',
    boss: 'DarkLord',
    createdAt: now() - 120 * 24 * 60 * 60 * 1000,
    ageDays: 120,
    rank: 2,
    notoriety: 4500,
    members: [
      {
        id: 1,
        name: 'PlayerOne',
        isApproved: true,
        level: 15,
        contributions: 2500,
      },
      { id: 2, name: 'PlayerTwo', level: 12, contributions: 1800 },
    ],
    organizedCrimes: ['Bank Heist', 'Smuggling'],
    vault: { money: 500000, items: ['Health Pack'], weapons: ['Pistol'] },
    boardMessages: [
      {
        author: 'DarkLord',
        text: 'Welcome to the Shadow Syndicate!',
        timestamp: now() - 3 * 24 * 60 * 60 * 1000,
      },
    ],
    logo: '🕶️',
    description: 'Elite operators working in the shadows',
    color: '#8b5cf6',
  },
  {
    id: 2,
    name: 'Iron Web',
    boss: 'SteelQueen',
    createdAt: now() - 300 * 24 * 60 * 60 * 1000,
    ageDays: 300,
    rank: 1,
    notoriety: 9000,
    members: [
      {
        id: 3,
        name: 'PlayerThree',
        isApproved: true,
        level: 20,
        contributions: 5000,
      },
    ],
    organizedCrimes: ['Armored Truck Robbery', 'Art Heist'],
    vault: { money: 1000000, items: ['Ammo'], weapons: ['Rifle'] },
    boardMessages: [
      {
        author: 'SteelQueen',
        text: 'Keep your eyes open!',
        timestamp: now() - 1 * 24 * 60 * 60 * 1000,
      },
    ],
    logo: '🕸️',
    description: 'The most notorious network in the galaxy',
    color: '#ef4444',
  },
]

const styles = `
:root{--glass-bg: rgba(255,255,255,0.04);--glass-border: rgba(255,255,255,0.08);--muted:#9ca3af}
*{box-sizing:border-box}
.network-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem}
.network-title{display:flex;align-items:center;gap:.6rem;font-size:1.6rem}
.network-icon{font-size:1.4rem}
.section-title{margin:1rem 0;font-size:1.2rem}
.networks-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1rem}
.network-card{padding:1rem;border-radius:14px;position:relative;overflow:hidden}
.network-card-header{display:flex;align-items:center;justify-content:space-between;padding:0.5rem;border-top:6px solid transparent}
.network-card-logo{width:48px;height:48px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;color:white}
.network-card-rank{font-weight:700}
.network-card-name{margin:.6rem 0 0;font-size:1.05rem}
.network-card-desc{font-size:.85rem;color:var(--muted)}
.network-stats-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:.5rem;margin-top:.6rem}
.stat-item{display:flex;flex-direction:column}
.stat-label{font-size:.75rem;color:var(--muted)}
.stat-value{font-weight:700}
.crime-badge{display:inline-block;padding:.25rem .5rem;border-radius:999px;margin-right:.25rem;background:rgba(255,255,255,0.03)}

.modal-overlay{position:fixed;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.45),rgba(0,0,0,0.6));display:flex;align-items:center;justify-content:center;z-index:60}
.create-modal{width:420px;padding:1rem;border-radius:12px}
.modal-title{margin:0 0 .6rem}
.form-group{margin:.5rem 0}
.modal-input{width:100%;padding:.5rem;border-radius:8px;border:1px solid rgba(255,255,255,0.06);background:transparent;color:inherit}
.color-picker{display:flex;gap:.4rem;margin-top:.4rem}
.color-option{width:28px;height:28px;border-radius:6px;border:2px solid transparent;cursor:pointer}
.color-option.selected{outline:3px solid rgba(255,255,255,0.06)}
.network-preview{display:flex;gap:.6rem;align-items:center;margin-top:.6rem}
.modal-actions{display:flex;gap:.5rem;margin-top:.8rem}

.network-dashboard{display:flex;gap:1rem}
.network-sidebar{width:320px}
.sidebar-header{display:flex;gap:.6rem;align-items:center;padding:.6rem;border-radius:10px;border:1px solid var(--glass-border)}
.sidebar-logo{width:56px;height:56px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;color:white}
.sidebar-title{font-size:1.05rem;margin:0}
.sidebar-subtitle{font-size:.8rem;color:var(--muted)}
.sidebar-stats{margin-top:.8rem}
.sidebar-stat{display:flex;gap:.6rem;align-items:center;padding:.5rem 0}
.stat-icon{font-size:1.2rem}
.notoriety-section{margin-top:.6rem}
.notoriety-header{display:flex;justify-content:space-between}
.notoriety-bar{height:10px;background:rgba(255,255,255,0.04);border-radius:999px;margin-top:.4rem}
.notoriety-fill{height:10px;border-radius:999px;transition:width .6s ease}
.members-count{margin-top:.8rem;display:flex;gap:.6rem;align-items:center}
.sidebar-actions{margin-top:.8rem;display:flex;flex-direction:column;gap:.4rem}
.sidebar-btn{padding:.5rem;border-radius:8px;border:1px solid var(--glass-border);background:transparent;cursor:pointer}
.sidebar-btn.danger{border-color:#f87171;color:#f87171}
.leaderboard-section{margin-top:1rem}
.leaderboard-item{display:flex;gap:.6rem;align-items:center;padding:.4rem;border-radius:8px}
.leaderboard-item.current{background:linear-gradient(90deg,rgba(255,255,255,0.02),transparent)}

.network-main{flex:1}
.tabs{display:flex;gap:.4rem;border-bottom:1px solid rgba(255,255,255,0.03);padding-bottom:.6rem}
.tab{background:transparent;border:none;padding:.6rem .8rem;border-bottom:2px solid transparent;cursor:pointer;border-radius:6px 6px 0 0}
.tab.active{font-weight:700}
.tab span{margin-left:.4rem}
.tab-content{margin-top:1rem}
.overview-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1rem}
.overview-stat{display:flex;gap:.6rem;align-items:center}
.overview-stat-icon{width:44px;height:44px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:white}
.card-title{margin:0 0 .6rem}
.crimes-showcase{display:flex;flex-wrap:wrap;gap:.5rem}
.crime-showcase-item{display:flex;gap:.6rem;align-items:center;padding:.5rem;border-radius:10px;background:rgba(255,255,255,0.02)}
.empty-state{color:var(--muted)}

.members-list{display:flex;flex-direction:column;gap:.5rem}
.member-item{display:flex;align-items:center;gap:.6rem;padding:.5rem;border-radius:10px;border:1px solid rgba(255,255,255,0.03)}
.member-avatar{width:44px;height:44px;border-radius:8px;background:rgba(255,255,255,0.03);display:flex;align-items:center;justify-content:center;font-weight:700}
.member-badge{margin-left:.5rem;padding:.15rem .4rem;border-radius:6px;font-size:.7rem}
.member-badge.you{background:rgba(255,255,255,0.02)}
.member-badge.boss{background:rgba(255,215,0,0.14)}
.member-actions{margin-left:auto;display:flex;gap:.4rem}
.member-action-btn{padding:.35rem .5rem;border-radius:8px;border:1px solid rgba(255,255,255,0.04);background:transparent;cursor:pointer}
.member-action-btn.approve{background:rgba(34,197,94,0.06)}

.crimes-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:.6rem}
.crime-card{padding:.6rem;border-radius:10px;border:1px solid rgba(255,255,255,0.02)}
.crime-footer{display:flex;justify-content:space-between;margin-top:.5rem}

.board-area{display:flex;flex-direction:column;gap:.6rem}
.board-input{display:flex;gap:.4rem}
.board-message{padding:.5rem;border-radius:8px;border:1px solid rgba(255,255,255,0.02)}
.timestamp{font-size:.7rem;color:var(--muted)}

.vault-grid{display:grid;grid-template-columns:1fr 240px;gap:1rem}
.vault-panel{padding:.6rem;border-radius:10px;border:1px solid rgba(255,255,255,0.02)}
.vault-list{display:flex;flex-direction:column;gap:.4rem}

.stats-charts{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:.8rem}
.sparkline{width:100%;height:48px}

@media(max-width:900px){.network-dashboard{flex-direction:column}.network-sidebar{width:100%}.vault-grid{grid-template-columns:1fr}}
`

const NetworkPage: React.FC = () => {
  const [networks, setNetworks] = useState<Network[]>(placeholderNetworks)
  const [userNetworkId, setUserNetworkId] = useState<number | null>(null)
  const userNetwork = useMemo(
    () => networks.find((n) => n.id === userNetworkId) || null,
    [networks, userNetworkId]
  )

  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [newBoardMessage, setNewBoardMessage] = useState('')
  const [selectedCrimes, setSelectedCrimes] = useState<string[]>([])
  const [depositAmount, setDepositAmount] = useState<number>(0)
  const [newItem, setNewItem] = useState<string>('')
  const [newWeapon, setNewWeapon] = useState<string>('')
  const [selectedMember, setSelectedMember] = useState<User | null>(null)
  const [messageToMember, setMessageToMember] = useState<string>('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newNetworkName, setNewNetworkName] = useState('')
  const [newNetworkLogo, setNewNetworkLogo] = useState('🏴')
  const [newNetworkColor, setNewNetworkColor] = useState('#8b5cf6')

  const currentUserId = 999
  const currentUserName = 'You'

  // update ages every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setNetworks((prev) =>
        prev.map((n) => {
          const age = Math.floor((now() - n.createdAt) / (24 * 60 * 60 * 1000))
          return { ...n, ageDays: age }
        })
      )
    }, 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // recompute notoriety & ranks whenever crimes change
  useEffect(() => {
    setNetworks((prev) => {
      const recomputed = prev.map((n) => ({
        ...n,
        notoriety: computeNotoriety(n.organizedCrimes),
      }))
      const sorted = [...recomputed].sort((a, b) => b.notoriety - a.notoriety)
      const withRanks = recomputed.map((n) => ({
        ...n,
        rank: sorted.findIndex((x) => x.id === n.id) + 1,
      }))
      return withRanks
    })
  }, [networks.map((n) => n.organizedCrimes.join('|')).join('||')])

  const createNetwork = () => {
    if (userNetworkId || !newNetworkName.trim()) return
    const newNetwork: Network = {
      id: networks.length + 1,
      name: newNetworkName.trim(),
      boss: currentUserName,
      createdAt: now(),
      ageDays: 0,
      rank: networks.length + 1,
      notoriety: 0,
      members: [
        {
          id: currentUserId,
          name: currentUserName,
          isApproved: true,
          level: 1,
          contributions: 0,
        },
      ],
      organizedCrimes: [],
      vault: { money: 1000000, items: [], weapons: [] },
      boardMessages: [],
      logo: newNetworkLogo,
      description: 'A new criminal enterprise',
      color: newNetworkColor,
    }
    setNetworks((prev) => [...prev, newNetwork])
    setUserNetworkId(newNetwork.id)
    setActiveTab('overview')
    setShowCreateModal(false)
    setNewNetworkName('')
  }

  const joinNetwork = (id: number) => {
    if (userNetworkId) return
    setNetworks((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              members: [
                ...n.members,
                {
                  id: currentUserId,
                  name: currentUserName,
                  isApproved: false,
                  level: 1,
                  contributions: 0,
                },
              ],
            }
          : n
      )
    )
    setUserNetworkId(id)
    setActiveTab('overview')
  }

  const leaveNetwork = () => {
    if (!userNetwork) return
    if (userNetwork.boss === currentUserName) {
      alert('Boss cannot leave. Transfer leadership first.')
      return
    }
    setNetworks((prev) =>
      prev.map((n) =>
        n.id === userNetwork.id
          ? { ...n, members: n.members.filter((m) => m.id !== currentUserId) }
          : n
      )
    )
    setUserNetworkId(null)
    setActiveTab('overview')
  }

  const addBoardMessage = () => {
    if (!userNetwork) return
    const me = userNetwork.members.find((m) => m.id === currentUserId)
    const canPost = me?.isApproved || userNetwork.boss === currentUserName
    if (!canPost || !newBoardMessage.trim()) return

    const msg = {
      author: currentUserName,
      text: newBoardMessage.trim(),
      timestamp: now(),
    }
    setNetworks((prev) =>
      prev.map((n) =>
        n.id === userNetwork.id
          ? { ...n, boardMessages: [...n.boardMessages, msg] }
          : n
      )
    )
    setNewBoardMessage('')
  }

  const toggleCrimeSelection = (crime: string) => {
    setSelectedCrimes((prev) =>
      prev.includes(crime) ? prev.filter((c) => c !== crime) : [...prev, crime]
    )
  }

  const organizeCrimes = () => {
    if (!userNetwork || selectedCrimes.length === 0) return
    setNetworks((prev) =>
      prev.map((n) =>
        n.id === userNetwork.id
          ? { ...n, organizedCrimes: [...n.organizedCrimes, ...selectedCrimes] }
          : n
      )
    )
    setSelectedCrimes([])
  }

  const approveMember = (memberId: number) => {
    if (!userNetwork || userNetwork.boss !== currentUserName) return
    setNetworks((prev) =>
      prev.map((n) =>
        n.id === userNetwork.id
          ? {
              ...n,
              members: n.members.map((m) =>
                m.id === memberId ? { ...m, isApproved: true } : m
              ),
            }
          : n
      )
    )
  }

  const depositMoneyToVault = () => {
    if (!userNetwork || depositAmount <= 0) return
    setNetworks((prev) =>
      prev.map((n) =>
        n.id === userNetwork.id
          ? {
              ...n,
              vault: { ...n.vault, money: n.vault.money + depositAmount },
            }
          : n
      )
    )
    setDepositAmount(0)
  }

  const addItemToVault = () => {
    if (!userNetwork || !newItem.trim()) return
    setNetworks((prev) =>
      prev.map((n) =>
        n.id === userNetwork.id
          ? {
              ...n,
              vault: { ...n.vault, items: [...n.vault.items, newItem.trim()] },
            }
          : n
      )
    )
    setNewItem('')
  }

  const addWeaponToVault = () => {
    if (!userNetwork || !newWeapon.trim()) return
    setNetworks((prev) =>
      prev.map((n) =>
        n.id === userNetwork.id
          ? {
              ...n,
              vault: {
                ...n.vault,
                weapons: [...n.vault.weapons, newWeapon.trim()],
              },
            }
          : n
      )
    )
    setNewWeapon('')
  }

  const transferLeadership = (memberId: number) => {
    if (!userNetwork || userNetwork.boss !== currentUserName) return
    const target = userNetwork.members.find((m) => m.id === memberId)
    if (!target) return
    setNetworks((prev) =>
      prev.map((n) =>
        n.id === userNetwork.id ? { ...n, boss: target.name } : n
      )
    )
  }

  const openMemberProfile = (member: User) => {
    setSelectedMember(member)
    setMessageToMember('')
  }

  const sendMessageToMember = () => {
    if (!selectedMember || !messageToMember.trim()) return
    alert(`Message sent to ${selectedMember.name}: "${messageToMember.trim()}"`)
    setMessageToMember('')
  }

  const leaderboard = useMemo(() => {
    return [...networks].sort((a, b) => b.notoriety - a.notoriety).slice(0, 5)
  }, [networks])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return '#22c55e'
      case 'Medium':
        return '#f59e0b'
      case 'Hard':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  // small helper to render a tiny sparkline as SVG for the stats tab
  const Sparkline: React.FC<{ values: number[] }> = ({ values }) => {
    const w = 120
    const h = 36
    const max = Math.max(...values, 1)
    const min = Math.min(...values, 0)
    const points = values
      .map(
        (v, i) =>
          `${(i / (values.length - 1)) * w},${
            h - ((v - min) / (max - min || 1)) * h
          }`
      )
      .join(' ')
    return (
      <svg
        className="sparkline"
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
      >
        <polyline
          fill="none"
          strokeWidth={2}
          stroke="currentColor"
          points={points}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <PageContainer>
      <style>{styles}</style>

      <div className="network-header">
        <h1 className="network-title">
          <span className="network-icon">🌐</span>
          Network HQ
        </h1>
        {!userNetwork && (
          <GradientButton
            onClick={() => setShowCreateModal(true)}
            gradient="purple"
          >
            + Create Network
          </GradientButton>
        )}
      </div>

      {/* Create Network Modal */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <GlassCard
            className="create-modal"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <h2 className="modal-title">Create Your Network</h2>
            <div className="form-group">
              <label>Network Name</label>
              <input
                type="text"
                className="modal-input"
                placeholder="Enter network name..."
                value={newNetworkName}
                onChange={(e) => setNewNetworkName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Logo Emoji</label>
              <input
                type="text"
                className="modal-input"
                placeholder="🏴"
                value={newNetworkLogo}
                onChange={(e) => setNewNetworkLogo(e.target.value)}
                maxLength={2}
              />
            </div>
            <div className="form-group">
              <label>Network Color</label>
              <div className="color-picker">
                {[
                  '#8b5cf6',
                  '#ef4444',
                  '#3b82f6',
                  '#10b981',
                  '#f59e0b',
                  '#ec4899',
                ].map((color) => (
                  <button
                    key={color}
                    className={`color-option ${
                      newNetworkColor === color ? 'selected' : ''
                    }`}
                    style={{ background: color }}
                    onClick={() => setNewNetworkColor(color)}
                  />
                ))}
              </div>
            </div>
            <div className="network-preview">
              <span style={{ fontSize: '2rem' }}>{newNetworkLogo}</span>
              <span style={{ color: newNetworkColor, fontWeight: 'bold' }}>
                {newNetworkName || 'Your Network'}
              </span>
            </div>
            <div className="modal-actions">
              <GradientButton
                onClick={createNetwork}
                disabled={!newNetworkName.trim()}
                gradient="purple"
              >
                Create (💰 1,000,000)
              </GradientButton>
              <GradientButton
                onClick={() => setShowCreateModal(false)}
                gradient="blue"
              >
                Cancel
              </GradientButton>
            </div>
          </GlassCard>
        </div>
      )}

      {!userNetwork && (
        <div>
          <h2 className="section-title">Available Networks</h2>
          <div className="networks-grid">
            {networks.map((n) => (
              <GlassCard key={n.id} className="network-card" hover>
                <div
                  className="network-card-header"
                  style={{ borderTopColor: n.color }}
                >
                  <div
                    className="network-card-logo"
                    style={{ background: n.color }}
                  >
                    {n.logo || '🛡️'}
                  </div>
                  <div className="network-card-rank">
                    {getRankBadge(n.rank)}
                  </div>
                </div>
                <h3 className="network-card-name">{n.name}</h3>
                <p className="network-card-desc">{n.description}</p>

                <div className="network-stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Boss</span>
                    <span className="stat-value">{n.boss}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Age</span>
                    <span className="stat-value">{n.ageDays}d</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Members</span>
                    <span className="stat-value">{n.members.length}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Notoriety</span>
                    <span className="stat-value">{n.notoriety}</span>
                  </div>
                </div>

                <div className="network-crimes">
                  {n.organizedCrimes.slice(0, 3).map((c, i) => {
                    const crime = getCrimeByName(c)
                    return (
                      <span key={i} className="crime-badge" title={c}>
                        {crime?.icon || '⚔️'}
                      </span>
                    )
                  })}
                  {n.organizedCrimes.length > 3 && (
                    <span className="crime-badge">
                      +{n.organizedCrimes.length - 3}
                    </span>
                  )}
                </div>

                <GradientButton
                  onClick={() => joinNetwork(n.id)}
                  gradient="purple"
                  className="mt-3"
                >
                  Join Network
                </GradientButton>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {userNetwork && (
        <div className="network-dashboard">
          {/* Sidebar */}
          <aside className="network-sidebar">
            <div
              className="sidebar-header"
              style={{ borderColor: userNetwork.color }}
            >
              <div
                className="sidebar-logo"
                style={{ background: userNetwork.color }}
              >
                {userNetwork.logo || '🏴'}
              </div>
              <div>
                <h2 className="sidebar-title">{userNetwork.name}</h2>
                <p className="sidebar-subtitle">{userNetwork.description}</p>
              </div>
            </div>

            <div className="sidebar-stats">
              <div className="sidebar-stat">
                <span className="stat-icon">👑</span>
                <div>
                  <div className="stat-label">Boss</div>
                  <div className="stat-value">{userNetwork.boss}</div>
                </div>
              </div>
              <div className="sidebar-stat">
                <span className="stat-icon">📅</span>
                <div>
                  <div className="stat-label">Age</div>
                  <div className="stat-value">{userNetwork.ageDays} days</div>
                </div>
              </div>
              <div className="sidebar-stat">
                <span className="stat-icon">🏆</span>
                <div>
                  <div className="stat-label">Rank</div>
                  <div className="stat-value">
                    {getRankBadge(userNetwork.rank)}
                  </div>
                </div>
              </div>
            </div>

            <div className="notoriety-section">
              <div className="notoriety-header">
                <span>🔥 Notoriety</span>
                <span className="notoriety-value">{userNetwork.notoriety}</span>
              </div>
              <div className="notoriety-bar">
                <div
                  className="notoriety-fill"
                  style={{
                    width: `${Math.min(
                      100,
                      (userNetwork.notoriety /
                        Math.max(1, leaderboard[0]?.notoriety || 1)) *
                        100
                    )}%`,
                    background: userNetwork.color,
                  }}
                />
              </div>
            </div>

            <div className="members-count">
              <span className="stat-icon">👥</span>
              <span>{userNetwork.members.length} Members</span>
            </div>

            <div className="sidebar-actions">
              {userNetwork.boss === currentUserName ? (
                <>
                  <button
                    className="sidebar-btn"
                    onClick={() => setActiveTab('members')}
                  >
                    👥 Manage Members
                  </button>
                  <button
                    className="sidebar-btn"
                    onClick={() => setActiveTab('board')}
                  >
                    📋 Message Board
                  </button>
                  <button
                    className="sidebar-btn"
                    onClick={() => setActiveTab('vault')}
                  >
                    💰 Vault
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="sidebar-btn"
                    onClick={() => setActiveTab('board')}
                  >
                    📋 Message Board
                  </button>
                  <button className="sidebar-btn danger" onClick={leaveNetwork}>
                    🚪 Leave Network
                  </button>
                </>
              )}
            </div>

            <div className="leaderboard-section">
              <h4 className="leaderboard-title">🏆 Top Networks</h4>
              <div className="leaderboard-list">
                {leaderboard.map((n) => (
                  <div
                    key={n.id}
                    className={`leaderboard-item ${
                      n.id === userNetwork.id ? 'current' : ''
                    }`}
                  >
                    <span className="leaderboard-rank">
                      {getRankBadge(n.rank)}
                    </span>
                    <span className="leaderboard-logo">{n.logo}</span>
                    <span className="leaderboard-name">{n.name}</span>
                    <span className="leaderboard-score">{n.notoriety}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="network-main">
            {/* Tabs */}
            <div className="tabs">
              {(
                [
                  'overview',
                  'members',
                  'crimes',
                  'board',
                  'vault',
                  'stats',
                ] as TabKey[]
              ).map((tab) => (
                <button
                  key={tab}
                  className={`tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                  style={
                    activeTab === tab
                      ? { borderBottomColor: userNetwork.color }
                      : {}
                  }
                >
                  {tab === 'overview' && '📊'}
                  {tab === 'members' && '👥'}
                  {tab === 'crimes' && '⚔️'}
                  {tab === 'board' && '📋'}
                  {tab === 'vault' && '💰'}
                  {tab === 'stats' && '📈'}
                  <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="tab-content">
                <GlassCard className="overview-card">
                  <h3 className="card-title">Network Overview</h3>
                  <div className="overview-grid">
                    <div className="overview-stat">
                      <div
                        className="overview-stat-icon"
                        style={{ background: userNetwork.color }}
                      >
                        👑
                      </div>
                      <div>
                        <div className="overview-stat-label">Boss</div>
                        <div className="overview-stat-value">
                          {userNetwork.boss}
                        </div>
                      </div>
                    </div>
                    <div className="overview-stat">
                      <div
                        className="overview-stat-icon"
                        style={{ background: userNetwork.color }}
                      >
                        🏆
                      </div>
                      <div>
                        <div className="overview-stat-label">Rank</div>
                        <div className="overview-stat-value">
                          #{userNetwork.rank}
                        </div>
                      </div>
                    </div>
                    <div className="overview-stat">
                      <div
                        className="overview-stat-icon"
                        style={{ background: userNetwork.color }}
                      >
                        🔥
                      </div>
                      <div>
                        <div className="overview-stat-label">Notoriety</div>
                        <div className="overview-stat-value">
                          {userNetwork.notoriety}
                        </div>
                      </div>
                    </div>
                    <div className="overview-stat">
                      <div
                        className="overview-stat-icon"
                        style={{ background: userNetwork.color }}
                      >
                        👥
                      </div>
                      <div>
                        <div className="overview-stat-label">Members</div>
                        <div className="overview-stat-value">
                          {userNetwork.members.length}
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="recent-crimes-card mt-4">
                  <h3 className="card-title">Recent Criminal Activity</h3>
                  <div className="crimes-showcase">
                    {userNetwork.organizedCrimes
                      .slice(-8)
                      .reverse()
                      .map((c, i) => {
                        const crime = getCrimeByName(c)
                        return (
                          <div
                            key={`${c}-${i}`}
                            className="crime-showcase-item"
                          >
                            <span className="crime-showcase-icon">
                              {crime?.icon || '⚔️'}
                            </span>
                            <span className="crime-showcase-name">{c}</span>
                            <span className="crime-showcase-gain">
                              +{crime?.notorietyGain || 0}
                            </span>
                          </div>
                        )
                      })}
                    {userNetwork.organizedCrimes.length === 0 && (
                      <p className="empty-state">
                        No crimes committed yet. Time to get started!
                      </p>
                    )}
                  </div>
                </GlassCard>
              </div>
            )}

            {/* Members Tab */}
            {activeTab === 'members' && (
              <div className="tab-content">
                <GlassCard className="members-card">
                  <h3 className="card-title">Network Members</h3>
                  <div className="members-list">
                    {userNetwork.members.map((m) => (
                      <div key={m.id} className="member-item">
                        <div className="member-avatar">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="member-info">
                          <div className="member-name">
                            {m.name}
                            {m.id === currentUserId && (
                              <span className="member-badge you">You</span>
                            )}
                            {m.name === userNetwork.boss && (
                              <span className="member-badge boss">Boss</span>
                            )}
                          </div>
                          <div className="member-stats">
                            <span>Lv.{m.level || 1}</span>
                            <span>•</span>
                            <span>{m.contributions || 0} contributions</span>
                            <span>•</span>
                            <span
                              className={
                                m.isApproved
                                  ? 'status-approved'
                                  : 'status-pending'
                              }
                            >
                              {m.isApproved ? '✓ Approved' : '⏱ Pending'}
                            </span>
                          </div>
                        </div>
                        <div className="member-actions">
                          <button
                            className="member-action-btn"
                            onClick={() => openMemberProfile(m)}
                          >
                            👤 Profile
                          </button>
                          {userNetwork.boss === currentUserName &&
                            m.id !== currentUserId &&
                            !m.isApproved && (
                              <button
                                className="member-action-btn approve"
                                onClick={() => approveMember(m.id)}
                              >
                                ✓ Approve
                              </button>
                            )}
                          {userNetwork.boss === currentUserName &&
                            m.id !== currentUserId && (
                              <button
                                className="member-action-btn promote"
                                onClick={() => transferLeadership(m.id)}
                              >
                                👑 Make Boss
                              </button>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* Member profile drawer-ish */}
                {selectedMember && (
                  <GlassCard className="mt-4" style={{ padding: '1rem' }}>
                    <h4>{selectedMember.name}</h4>
                    <div
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        marginTop: '.6rem',
                      }}
                    >
                      <div style={{ minWidth: 120 }}>
                        <div
                          style={{ fontSize: '.85rem', color: 'var(--muted)' }}
                        >
                          Level
                        </div>
                        <div style={{ fontWeight: 700 }}>
                          {selectedMember.level || 1}
                        </div>
                      </div>
                      <div style={{ minWidth: 160 }}>
                        <div
                          style={{ fontSize: '.85rem', color: 'var(--muted)' }}
                        >
                          Contributions
                        </div>
                        <div style={{ fontWeight: 700 }}>
                          {selectedMember.contributions || 0}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '.6rem' }}>
                      <div
                        style={{ fontSize: '.85rem', color: 'var(--muted)' }}
                      >
                        Send Message
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: '.4rem',
                          marginTop: '.4rem',
                        }}
                      >
                        <input
                          className="modal-input"
                          value={messageToMember}
                          onChange={(e) => setMessageToMember(e.target.value)}
                          placeholder={`Say something to ${selectedMember.name}...`}
                        />
                        <GradientButton
                          onClick={sendMessageToMember}
                          gradient="blue"
                        >
                          Send
                        </GradientButton>
                      </div>
                    </div>

                    <div style={{ marginTop: '.6rem' }}>
                      <button
                        className="sidebar-btn"
                        onClick={() => setSelectedMember(null)}
                      >
                        Close
                      </button>
                    </div>
                  </GlassCard>
                )}
              </div>
            )}

            {/* Crimes Tab */}
            {activeTab === 'crimes' && (
              <div className="tab-content">
                <GlassCard className="crimes-card">
                  <h3 className="card-title">Organize Crime</h3>
                  <div className="crimes-list">
                    {crimeDefs.map((crime) => (
                      <div key={crime.name} className="crime-card">
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              gap: '.6rem',
                              alignItems: 'center',
                            }}
                          >
                            <div style={{ fontSize: '1.4rem' }}>
                              {crime.icon}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700 }}>
                                {crime.name}
                              </div>
                              <div
                                style={{
                                  fontSize: '.8rem',
                                  color: 'var(--muted)',
                                }}
                              >
                                {crime.description}
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 700 }}>
                              {crime.notorietyGain}⚡
                            </div>
                            <div
                              style={{
                                fontSize: '.75rem',
                                color: getDifficultyColor(crime.difficulty),
                              }}
                            >
                              {crime.difficulty}
                            </div>
                          </div>
                        </div>

                        <div className="crime-footer">
                          <div>
                            <label
                              style={{
                                fontSize: '.8rem',
                                color: 'var(--muted)',
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={selectedCrimes.includes(crime.name)}
                                onChange={() =>
                                  toggleCrimeSelection(crime.name)
                                }
                              />{' '}
                              Schedule
                            </label>
                          </div>
                          <div>
                            <GradientButton
                              onClick={() => {
                                setSelectedCrimes([crime.name])
                                organizeCrimes()
                              }}
                              gradient="purple"
                            >
                              Execute Now
                            </GradientButton>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      marginTop: '.8rem',
                      display: 'flex',
                      gap: '.6rem',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ fontSize: '.9rem' }}>
                      {selectedCrimes.length} selected
                    </div>
                    <GradientButton onClick={organizeCrimes} gradient="blue">
                      Organize Selected
                    </GradientButton>
                  </div>
                </GlassCard>
              </div>
            )}

            {/* Board Tab */}
            {activeTab === 'board' && (
              <div className="tab-content">
                <GlassCard className="board-card">
                  <h3 className="card-title">Message Board</h3>
                  <div className="board-area">
                    <div style={{ display: 'flex', gap: '.6rem' }}>
                      <input
                        className="modal-input"
                        value={newBoardMessage}
                        onChange={(e) => setNewBoardMessage(e.target.value)}
                        placeholder="Post to the board..."
                      />
                      <GradientButton
                        onClick={addBoardMessage}
                        gradient="purple"
                      >
                        Post
                      </GradientButton>
                    </div>

                    <div>
                      {userNetwork.boardMessages
                        .slice()
                        .reverse()
                        .map((m, i) => (
                          <div
                            key={i}
                            className="board-message"
                            style={{ marginTop: '.5rem' }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                              }}
                            >
                              <strong>{m.author}</strong>
                              <span className="timestamp">
                                {new Date(m.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <div style={{ marginTop: '.3rem' }}>{m.text}</div>
                          </div>
                        ))}
                      {userNetwork.boardMessages.length === 0 && (
                        <div className="empty-state">No messages yet.</div>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </div>
            )}

            {/* Vault Tab */}
            {activeTab === 'vault' && (
              <div className="tab-content">
                <div className="vault-grid">
                  <GlassCard className="vault-panel">
                    <h3 className="card-title">Vault</h3>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div
                          style={{ fontSize: '.85rem', color: 'var(--muted)' }}
                        >
                          Money
                        </div>
                        <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>
                          💰 {userNetwork.vault.money.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <input
                          type="number"
                          value={depositAmount || ''}
                          onChange={(e) =>
                            setDepositAmount(Number(e.target.value))
                          }
                          className="modal-input"
                          placeholder="Amount"
                        />
                        <div style={{ marginTop: '.4rem' }}>
                          <GradientButton
                            onClick={depositMoneyToVault}
                            gradient="purple"
                          >
                            Deposit
                          </GradientButton>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '.8rem' }}>
                      <div style={{ display: 'flex', gap: '.4rem' }}>
                        <input
                          className="modal-input"
                          value={newItem}
                          onChange={(e) => setNewItem(e.target.value)}
                          placeholder="Add item"
                        />
                        <GradientButton
                          onClick={addItemToVault}
                          gradient="blue"
                        >
                          Add
                        </GradientButton>
                      </div>
                      <div style={{ marginTop: '.6rem' }}>
                        <strong>Items</strong>
                        <div
                          className="vault-list"
                          style={{ marginTop: '.4rem' }}
                        >
                          {userNetwork.vault.items.map((it, i) => (
                            <div key={i}>{it}</div>
                          ))}
                          {userNetwork.vault.items.length === 0 && (
                            <div className="empty-state">No items</div>
                          )}
                        </div>
                      </div>

                      <div style={{ marginTop: '.6rem' }}>
                        <div style={{ display: 'flex', gap: '.4rem' }}>
                          <input
                            className="modal-input"
                            value={newWeapon}
                            onChange={(e) => setNewWeapon(e.target.value)}
                            placeholder="Add weapon"
                          />
                          <GradientButton
                            onClick={addWeaponToVault}
                            gradient="purple"
                          >
                            Add
                          </GradientButton>
                        </div>
                        <div style={{ marginTop: '.4rem' }}>
                          <strong>Weapons</strong>
                          <div
                            className="vault-list"
                            style={{ marginTop: '.4rem' }}
                          >
                            {userNetwork.vault.weapons.map((w, i) => (
                              <div key={i}>{w}</div>
                            ))}
                            {userNetwork.vault.weapons.length === 0 && (
                              <div className="empty-state">No weapons</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>

                  <GlassCard className="vault-panel">
                    <h3 className="card-title">Quick Actions</h3>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '.5rem',
                      }}
                    >
                      <button className="sidebar-btn">Request Funds</button>
                      <button className="sidebar-btn">Allocate Weapons</button>
                      <button className="sidebar-btn">
                        Export Vault Report
                      </button>
                    </div>

                    <div style={{ marginTop: '.8rem' }}>
                      <strong>Vault Health</strong>
                      <div
                        className="notoriety-bar"
                        style={{ marginTop: '.4rem' }}
                      >
                        <div
                          className="notoriety-fill"
                          style={{
                            width: `${Math.min(
                              100,
                              (userNetwork.vault.money / 2000000) * 100
                            )}%`,
                            background: userNetwork.color,
                          }}
                        />
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </div>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <div className="tab-content">
                <GlassCard>
                  <h3 className="card-title">Network Stats</h3>
                  <div className="stats-charts">
                    <div className="vault-panel">
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: '.85rem',
                              color: 'var(--muted)',
                            }}
                          >
                            Notoriety (last 8 ops)
                          </div>
                          <div style={{ fontWeight: 800 }}>
                            {userNetwork.notoriety}
                          </div>
                        </div>
                        <Sparkline
                          values={Array.from({ length: 8 }).map((_, i) =>
                            Math.max(
                              0,
                              userNetwork.notoriety -
                                (7 - i) * 200 +
                                (i % 3) * 80
                            )
                          )}
                        />
                      </div>
                    </div>

                    <div className="vault-panel">
                      <div>
                        <div
                          style={{ fontSize: '.85rem', color: 'var(--muted)' }}
                        >
                          Members & Contributions
                        </div>
                        <div style={{ fontWeight: 800 }}>
                          {userNetwork.members.length} Members
                        </div>
                        <div style={{ marginTop: '.6rem' }}>
                          {userNetwork.members.map((m) => (
                            <div
                              key={m.id}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: '.6rem',
                              }}
                            >
                              <div>{m.name}</div>
                              <div style={{ color: 'var(--muted)' }}>
                                {m.contributions || 0}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="vault-panel">
                      <div>
                        <div
                          style={{ fontSize: '.85rem', color: 'var(--muted)' }}
                        >
                          Vault
                        </div>
                        <div style={{ fontWeight: 800 }}>
                          💰 {userNetwork.vault.money.toLocaleString()}
                        </div>
                        <div style={{ marginTop: '.6rem' }}>
                          Items: {userNetwork.vault.items.length} • Weapons:{' '}
                          {userNetwork.vault.weapons.length}
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            )}
          </main>
        </div>
      )}
    </PageContainer>
  )
}

export default NetworkPage
