import React from 'react'
import NewPlayerSetup from './NewPlayerSetup'
import type { NewPlayerResult } from './NewPlayerSetup'
import { useUser } from '../hooks/useUser'

export default function NewPlayerGate({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, updateUser } = useUser()

  if (!user) {
    return (
      <NewPlayerSetup
        onComplete={(result: NewPlayerResult) => {
          // Create a new user object with default values and chosen setup
          updateUser({
            username: result.username,
            // Set up initial stats and perks
            level: 1,
            experience: 0,
            experienceToNext: 1000,
            stats: {
              strength: result.perks.strength || 1,
              defense: 1,
              speed: 1,
              dexterity: result.perks.dexterity || 1,
            },
            health: result.perks.maxHealth || 100,
            maxHealth: result.perks.maxHealth || 100,
            energy: 100,
            maxEnergy: 100,
            heartRate: 50,
            maxHeartRate: 140,
            heat: 0,
            maxHeat: 100,
            money: 0,
            points: 0,
            age: 18,
            rank: 'Beginner',
            location: 'Earth',
            trainingCount: 0,
            crimesTally: { total: 0, success: 0, failed: 0, critical: 0 },
            combatTally: {
              attacks: 0,
              defends: 0,
              kills: 0,
              deaths: 0,
              escapes: 0,
            },
            inventory: [],
            lastAction: new Date(),
            createdAt: new Date(),
            // Add any other required fields here
          })
        }}
      />
    )
  }

  return <>{children}</>
}
