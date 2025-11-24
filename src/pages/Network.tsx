// src/pages/Network.tsx
import React, { useEffect, useMemo, useState } from 'react'
import { PageContainer } from '../components/ui/PageContainer'
import { GlassCard } from '../components/ui/GlassCard'
import { GradientButton } from '../components/ui/GradientButton'

interface User {
  id: number
  name: string
  isApproved?: boolean // can post on the message board
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
  createdAt: number // timestamp to compute ageDays
  ageDays: number
  rank: number
  notoriety: number
  members: User[]
  organizedCrimes: string[]
  vault: Vault
  boardMessages: { author: string; text: string; timestamp: number }[]
  logo?: string
}

type TabKey = 'overview' | 'members' | 'crimes' | 'board' | 'vault'

// Crime definitions with notoriety values and difficulty
const crimeDefs: {
  name: string
  notorietyGain: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
}[] = [
  { name: 'Bank Heist', notorietyGain: 1200, difficulty: 'Hard' },
  { name: 'Smuggling', notorietyGain: 400, difficulty: 'Medium' },
  { name: 'Armored Truck Robbery', notorietyGain: 800, difficulty: 'Hard' },
  { name: 'Cyber Theft', notorietyGain: 600, difficulty: 'Medium' },
  { name: 'Warehouse Raid', notorietyGain: 300, difficulty: 'Easy' },
]

// Helpers
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
      { id: 1, name: 'PlayerOne', isApproved: true },
      { id: 2, name: 'PlayerTwo' },
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
  },
  {
    id: 2,
    name: 'Iron Web',
    boss: 'SteelQueen',
    createdAt: now() - 300 * 24 * 60 * 60 * 1000,
    ageDays: 300,
    rank: 1,
    notoriety: 9000,
    members: [{ id: 3, name: 'PlayerThree', isApproved: true }],
    organizedCrimes: ['Armored Truck Robbery'],
    vault: { money: 1000000, items: ['Ammo'], weapons: ['Rifle'] },
    boardMessages: [
      {
        author: 'SteelQueen',
        text: 'Keep your eyes open!',
        timestamp: now() - 1 * 24 * 60 * 60 * 1000,
      },
    ],
    logo: '🕸️',
  },
]

const availableCrimes = crimeDefs.map((c) => c.name)

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

  const currentUserId = 999 // example logged-in user
  const currentUserName = 'You'

  // Keep ageDays somewhat dynamic (optional: increment daily)
  useEffect(() => {
    const interval = setInterval(() => {
      setNetworks((prev) =>
        prev.map((n) => {
          const age = Math.floor((now() - n.createdAt) / (24 * 60 * 60 * 1000))
          return { ...n, ageDays: age }
        })
      )
    }, 60 * 1000) // update every minute for demo
    return () => clearInterval(interval)
  }, [])

  // Recompute notoriety and ranks when crimes change
  useEffect(() => {
    setNetworks((prev) => {
      // Recompute notoriety for each network from crimes
      const recomputed = prev.map((n) => ({
        ...n,
        notoriety: computeNotoriety(n.organizedCrimes),
      }))
      // Compute ranks by notoriety (descending)
      const sorted = [...recomputed].sort((a, b) => b.notoriety - a.notoriety)
      const withRanks = recomputed.map((n) => ({
        ...n,
        rank: sorted.findIndex((x) => x.id === n.id) + 1,
      }))
      return withRanks
    })
  }, [networks.map((n) => n.organizedCrimes.join('|')).join('||')]) // dependency on crimes

  const createNetwork = () => {
    if (userNetworkId) return
    const newNetwork: Network = {
      id: networks.length + 1,
      name: 'New Network',
      boss: currentUserName,
      createdAt: now(),
      ageDays: 0,
      rank: networks.length + 1,
      notoriety: 0,
      members: [{ id: currentUserId, name: currentUserName, isApproved: true }],
      organizedCrimes: [],
      vault: { money: 1000000, items: [], weapons: [] }, // 1,000,000 start
      boardMessages: [],
      logo: '🚀',
    }
    setNetworks((prev) => [...prev, newNetwork])
    setUserNetworkId(newNetwork.id)
    setActiveTab('overview')
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
                { id: currentUserId, name: currentUserName, isApproved: false },
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
    // Prevent boss leaving without transfer (simple guard)
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
    // Placeholder: plumb into your messaging system
    alert(`Message sent to ${selectedMember.name}: "${messageToMember.trim()}"`)
    setMessageToMember('')
  }

  // Derived table of top networks for comparison (rank and notoriety)
  const leaderboard = useMemo(() => {
    return [...networks].sort((a, b) => b.notoriety - a.notoriety).slice(0, 5)
  }, [networks])

  return (
    <PageContainer>
      <h1 className="text-3xl font-bold mb-6">Network HQ</h1>

      {!userNetwork && (
        <div className="mb-6 flex gap-3">
          <GradientButton onClick={createNetwork}>
            Create Network (1,000,000)
          </GradientButton>
        </div>
      )}

      {!userNetwork && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Networks to Join</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {networks.map((n) => (
              <GlassCard key={n.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <span>{n.logo || '🛡️'}</span> {n.name}
                  </h3>
                  <span className="text-sm px-2 py-1 bg-gray-100 rounded">
                    Rank #{n.rank}
                  </span>
                </div>
                <p>Boss: {n.boss}</p>
                <p>Age: {n.ageDays} days</p>
                <p>Notoriety: {n.notoriety}</p>
                <p>Members: {n.members.length}</p>
                <p>
                  Organized Crimes: {n.organizedCrimes.join(', ') || 'None'}
                </p>
                <div className="mt-3">
                  <GradientButton onClick={() => joinNetwork(n.id)}>
                    Join this Network
                  </GradientButton>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {userNetwork && (
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-3 bg-gray-900 text-white p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{userNetwork.logo || '🏴'}</span>
              <h2 className="text-xl font-bold">{userNetwork.name}</h2>
            </div>
            <p>Boss: {userNetwork.boss}</p>
            <p>Age: {userNetwork.ageDays} days</p>
            <p>Rank: #{userNetwork.rank}</p>
            <div className="mt-2">
              <div className="flex items-center justify-between">
                <span>Notoriety</span>
                <span>{userNetwork.notoriety}</span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded mt-1">
                <div
                  className="h-2 bg-red-500 rounded"
                  style={{
                    width: `${Math.min(
                      100,
                      (userNetwork.notoriety /
                        Math.max(1, leaderboard[0]?.notoriety || 1)) *
                        100
                    )}%`,
                  }}
                />
              </div>
            </div>
            <p className="mt-2">Members: {userNetwork.members.length}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {userNetwork.boss === currentUserName ? (
                <>
                  <GradientButton onClick={() => setActiveTab('members')}>
                    Manage Members
                  </GradientButton>
                  <GradientButton onClick={() => setActiveTab('board')}>
                    Post to Board
                  </GradientButton>
                </>
              ) : (
                <>
                  <GradientButton onClick={() => setActiveTab('board')}>
                    Open Board
                  </GradientButton>
                  <GradientButton onClick={leaveNetwork}>
                    Leave Network
                  </GradientButton>
                </>
              )}
            </div>

            {/* Leaderboard snippet */}
            <div className="mt-6">
              <h4 className="font-semibold mb-2">Top Networks</h4>
              <ul className="text-sm space-y-1">
                {leaderboard.map((n) => (
                  <li key={n.id} className="flex justify-between">
                    <span>
                      #{n.rank} {n.name}
                    </span>
                    <span>{n.notoriety}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-12 lg:col-span-9">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 border-b mb-4">
              {(
                ['overview', 'members', 'crimes', 'board', 'vault'] as TabKey[]
              ).map((tab) => (
                <button
                  key={tab}
                  className={`px-4 py-2 font-semibold ${
                    activeTab === tab ? 'border-b-2 border-blue-500' : ''
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab[0].toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Overview */}
            {activeTab === 'overview' && (
              <GlassCard className="p-4 mb-4">
                <h3 className="font-bold mb-2">Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold">Network</p>
                    <p>Name: {userNetwork.name}</p>
                    <p>Boss: {userNetwork.boss}</p>
                    <p>Age: {userNetwork.ageDays} days</p>
                    <p>
                      Rank: #{userNetwork.rank} of {networks.length}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold">Stats</p>
                    <p>Notoriety: {userNetwork.notoriety}</p>
                    <p>Members: {userNetwork.members.length}</p>
                    <p>Crimes: {userNetwork.organizedCrimes.length}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="font-semibold mb-1">Recent Crimes</p>
                  <div className="flex flex-wrap gap-2">
                    {userNetwork.organizedCrimes.slice(-6).map((c, i) => (
                      <span
                        key={`${c}-${i}`}
                        className="px-2 py-1 text-sm bg-gray-100 rounded"
                      >
                        {c}
                      </span>
                    ))}
                    {userNetwork.organizedCrimes.length === 0 && (
                      <span className="text-sm text-gray-500">None</span>
                    )}
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Members */}
            {activeTab === 'members' && (
              <GlassCard className="p-4 mb-4">
                <h3 className="font-bold mb-2">Members</h3>
                <ul className="space-y-2">
                  {userNetwork.members.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-center justify-between"
                    >
                      <div
                        className="cursor-pointer hover:underline"
                        onClick={() => openMemberProfile(m)}
                      >
                        {m.name} {m.id === currentUserId ? '(You)' : ''}{' '}
                        {m.isApproved ? '— Approved' : '— Pending'}
                      </div>
                      <div className="flex gap-2">
                        {userNetwork.boss === currentUserName &&
                          m.id !== currentUserId &&
                          !m.isApproved && (
                            <GradientButton onClick={() => approveMember(m.id)}>
                              Approve
                            </GradientButton>
                          )}
                        {userNetwork.boss === currentUserName &&
                          m.id !== currentUserId && (
                            <GradientButton
                              onClick={() => transferLeadership(m.id)}
                            >
                              Make Boss
                            </GradientButton>
                          )}
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-4">
                  <GradientButton
                    onClick={leaveNetwork}
                    disabled={userNetwork.boss === currentUserName}
                  >
                    Leave Network
                  </GradientButton>
                </div>

                {/* Member profile modal */}
                {selectedMember && (
                  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-md rounded p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">
                          Profile: {selectedMember.name}
                        </h4>
                        <button
                          className="text-sm"
                          onClick={() => setSelectedMember(null)}
                        >
                          Close
                        </button>
                      </div>
                      <p>
                        Status:{' '}
                        {selectedMember.isApproved ? 'Approved' : 'Pending'}
                      </p>
                      <div className="mt-3">
                        <p className="font-semibold mb-1">Message</p>
                        <textarea
                          className="w-full border rounded p-2"
                          rows={3}
                          placeholder={`Write a message to ${selectedMember.name}...`}
                          value={messageToMember}
                          onChange={(e) => setMessageToMember(e.target.value)}
                        />
                        <div className="mt-2 flex gap-2">
                          <GradientButton onClick={sendMessageToMember}>
                            Send
                          </GradientButton>
                          <GradientButton
                            onClick={() => setSelectedMember(null)}
                          >
                            Close
                          </GradientButton>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </GlassCard>
            )}

            {/* Crimes */}
            {activeTab === 'crimes' && (
              <GlassCard className="p-4 mb-4">
                <h3 className="font-bold mb-3">Organize Crimes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {crimeDefs.map((crime) => {
                    const selected = selectedCrimes.includes(crime.name)
                    return (
                      <button
                        key={crime.name}
                        onClick={() => toggleCrimeSelection(crime.name)}
                        className={`text-left p-3 rounded border transition ${
                          selected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{crime.name}</span>
                          <span className="text-sm">{crime.difficulty}</span>
                        </div>
                        <p className="text-sm mt-1">
                          Notoriety +{crime.notorietyGain}
                        </p>
                      </button>
                    )
                  })}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm">
                    Selected: {selectedCrimes.length} — Planned Notoriety Gain:{' '}
                    {selectedCrimes.reduce(
                      (sum, c) => sum + (getCrimeByName(c)?.notorietyGain || 0),
                      0
                    )}
                  </div>
                  <GradientButton
                    onClick={organizeCrimes}
                    disabled={selectedCrimes.length === 0}
                  >
                    Add Selected Crimes
                  </GradientButton>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Crime History</h4>
                  <div className="flex flex-wrap gap-2">
                    {userNetwork.organizedCrimes.length > 0 ? (
                      userNetwork.organizedCrimes.map((c, i) => (
                        <span
                          key={`${c}-${i}`}
                          className="px-2 py-1 text-sm bg-gray-100 rounded"
                        >
                          {c}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No crimes yet.</p>
                    )}
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Board */}
            {activeTab === 'board' && (
              <GlassCard className="p-4 mb-4">
                <h3 className="font-bold mb-2">Network Board</h3>
                {userNetwork.boardMessages.length ? (
                  <ul className="space-y-2">
                    {userNetwork.boardMessages.map((msg, i) => (
                      <li key={i} className="border rounded p-2">
                        <div className="text-sm text-gray-500">
                          {msg.author} •{' '}
                          {new Date(msg.timestamp).toLocaleString()}
                        </div>
                        <div>{msg.text}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No messages yet.</p>
                )}

                {(userNetwork.boss === currentUserName ||
                  userNetwork.members.some(
                    (m) => m.id === currentUserId && m.isApproved
                  )) && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      className="border p-2 flex-1 rounded"
                      placeholder="Write a message..."
                      value={newBoardMessage}
                      onChange={(e) => setNewBoardMessage(e.target.value)}
                    />
                    <GradientButton onClick={addBoardMessage}>
                      Post
                    </GradientButton>
                  </div>
                )}
              </GlassCard>
            )}

            {/* Vault */}
            {activeTab === 'vault' && (
              <GlassCard className="p-4 mb-4">
                <h3 className="font-bold mb-2">Vault</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold mb-1">Money</p>
                    <p className="text-lg">
                      💰 ${userNetwork.vault.money.toLocaleString()}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <input
                        type="number"
                        min={0}
                        className="border p-2 rounded w-full"
                        placeholder="Amount to deposit"
                        value={depositAmount || ''}
                        onChange={(e) =>
                          setDepositAmount(Number(e.target.value))
                        }
                      />
                      <GradientButton
                        onClick={depositMoneyToVault}
                        disabled={!depositAmount || depositAmount <= 0}
                      >
                        Deposit
                      </GradientButton>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold mb-1">Items</p>
                    <div className="grid grid-cols-2 gap-2">
                      {userNetwork.vault.items.length > 0 ? (
                        userNetwork.vault.items.map((item, i) => (
                          <div
                            key={`${item}-${i}`}
                            className="bg-white border p-2 rounded text-center"
                          >
                            {item}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">None</p>
                      )}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        className="border p-2 rounded flex-1"
                        placeholder="Add an item"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                      />
                      <GradientButton
                        onClick={addItemToVault}
                        disabled={!newItem.trim()}
                      >
                        Add
                      </GradientButton>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold mb-1">Weapons</p>
                    <div className="grid grid-cols-2 gap-2">
                      {userNetwork.vault.weapons.length > 0 ? (
                        userNetwork.vault.weapons.map((weapon, i) => (
                          <div
                            key={`${weapon}-${i}`}
                            className="bg-white border p-2 rounded text-center"
                          >
                            {weapon}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">None</p>
                      )}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        className="border p-2 rounded flex-1"
                        placeholder="Add a weapon"
                        value={newWeapon}
                        onChange={(e) => setNewWeapon(e.target.value)}
                      />
                      <GradientButton
                        onClick={addWeaponToVault}
                        disabled={!newWeapon.trim()}
                      >
                        Add
                      </GradientButton>
                    </div>
                  </div>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  )
}

export default NetworkPage
