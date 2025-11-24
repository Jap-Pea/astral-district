import React, { useState, useEffect } from 'react'

export type RaceKey = 'human' | 'gleek' | 'ortanz'

export type NewPlayerResult = {
  username: string
  race: RaceKey
  perks: Record<string, number>
}

// Props: onComplete receives the chosen username/race and the calculated perks
export default function NewPlayerSetup({
  onComplete,
  initialUsername = '',
}: {
  onComplete: (result: NewPlayerResult) => void
  initialUsername?: string
}) {
  const [username, setUsername] = useState(initialUsername)
  const [race, setRace] = useState<RaceKey | null>(null)
  const [error, setError] = useState<string | null>(null)

  // base stats for preview only (you can replace with your game's real base values)
  const BASE_STATS = {
    health: 100,
    strength: 1,
    defense: 1,
    dexterity: 1,
    speed: 1,
  }

  const RACES: Record<
    RaceKey,
    {
      label: string
      description: string
      perks: (stats: typeof BASE_STATS) => Record<string, number>
    }
  > = {
    human: {
      label: 'Human',
      description: 'Balanced. No major bonuses, reliable and adaptable.',
      perks: (s) => ({
        maxHealth: s.health,
        strength: s.strength,
        dexterity: s.dexterity,
      }),
    },
    gleek: {
      label: 'Gleek',
      description: 'Nimble fighters. +3% Strength and +5% Dexterity.',
      perks: (s) => ({
        maxHealth: s.health,
        strength: Math.round(s.strength * 1.03),
        dexterity: Math.round(s.dexterity * 1.05),
      }),
    },
    ortanz: {
      label: 'Ortanz',
      description: 'Sturdy and resilient. +30% Max Health.',
      perks: (s) => ({
        maxHealth: Math.round(s.health * 1.3),
        strength: s.strength,
        dexterity: s.dexterity,
      }),
    },
  }

  useEffect(() => {
    setError(null)
  }, [username, race])

  function validate() {
    if (!username || username.trim().length < 2) {
      setError('Please enter a name (2+ characters)')
      return false
    }
    if (!race) {
      setError('Pick a race to continue')
      return false
    }
    return true
  }

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    if (!validate() || !race) return

    const perks = RACES[race].perks(BASE_STATS)

    const result: NewPlayerResult = {
      username: username.trim(),
      race,
      perks,
    }

    // call consumer (parent) with the chosen config
    onComplete(result)
  }

  function renderPreview() {
    const selected = race ? RACES[race] : null
    const perks = selected ? selected.perks(BASE_STATS) : null

    return (
      <div className="mt-4 p-3 border rounded bg-gray-900">
        <div className="text-sm text-gray-400">
          Preview (based on base stats)
        </div>
        <div className="mt-2 grid grid-cols-3 gap-3">
          <div>
            <div className="text-xs text-gray-400">Max Health</div>
            <div className="font-bold text-lg">
              {perks ? perks.maxHealth : BASE_STATS.health}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Strength</div>
            <div className="font-bold text-lg">
              {perks ? perks.strength : BASE_STATS.strength}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Dexterity</div>
            <div className="font-bold text-lg">
              {perks ? perks.dexterity : BASE_STATS.dexterity}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-black text-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-2">Create your character</h2>
      <p className="text-sm text-gray-400 mb-4">
        Pick a username and your race. Each race has small perks.
      </p>

      <form onSubmit={handleSubmit}>
        <label className="block text-sm mb-2">Username</label>
        <input
          className="w-full mb-4 px-3 py-2 bg-gray-800 rounded border border-gray-700"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          autoFocus
        />

        <div className="grid grid-cols-3 gap-3">
          {(['human', 'gleek', 'ortanz'] as RaceKey[]).map((r) => {
            const meta = RACES[r]
            const active = race === r
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRace(r)}
                className={`p-3 text-left rounded border ${
                  active
                    ? 'border-yellow-400 bg-yellow-900/20'
                    : 'border-gray-700'
                } focus:outline-none`}
              >
                <div className="font-bold">{meta.label}</div>
                <div className="text-xs text-gray-400">{meta.description}</div>
              </button>
            )
          })}
        </div>

        {renderPreview()}

        {error && <div className="mt-3 text-red-400">{error}</div>}

        <div className="mt-6 flex justify-between items-center">
          <button
            type="button"
            onClick={() => {
              setUsername('')
              setRace(null)
              setError(null)
            }}
            className="px-4 py-2 border border-gray-700 rounded"
          >
            Reset
          </button>

          <button
            type="submit"
            className="px-4 py-2 bg-yellow-500 text-black font-bold rounded"
          >
            Start
          </button>
        </div>
      </form>
    </div>
  )
}
