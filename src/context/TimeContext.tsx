//src/context/TimeContext.tsx - FIXED VERSION
import React, { useEffect, useRef, useState } from 'react'
import { useUser } from '../hooks/useUser'
import { TimeContext } from './timeCore'

export const TimeProvider: React.FC<{
  children: React.ReactNode
  tickIntervalSec?: number
}> = ({ children, tickIntervalSec = 300 }) => {
  // CHANGED: 300 seconds = 5 minutes
  const { user, updateUser } = useUser()
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const nextTickRef = useRef<number>(0)
  const [nextTickInSec, setNextTickInSec] = useState<number>(tickIntervalSec)

  // Clock (updates every second for UI)
  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  // Global tick (every 5 minutes by default)
  useEffect(() => {
    nextTickRef.current = Date.now() + tickIntervalSec * 1000

    const id = setInterval(() => {
      nextTickRef.current = Date.now() + tickIntervalSec * 1000
      setNextTickInSec(tickIntervalSec)

      if (!user || !updateUser) return

      // CONFIGURABLE DELTAS (per 5-minute tick)
      const energyRegen = 5 // Was 2, increased for better gameplay
      const healthRegen = 3 // Was 1, increased
      const hrDecrease = 5 // Was 2, increased (heartrate drops faster)
      const heatDecrease = 5 // Was 3, increased (heat drops faster)

      const newEnergy = Math.min(
        (user.energy ?? 0) + energyRegen,
        user.maxEnergy ?? user.energy ?? 0
      )

      const newHealth = Math.min(
        (user.health ?? 0) + healthRegen,
        user.maxHealth ?? user.health ?? 0
      )

      const newHeartRate = Math.max((user.heartRate ?? 0) - hrDecrease, 0)
      const newHeat = Math.max((user.heat ?? 0) - heatDecrease, 0)

      updateUser({
        energy: newEnergy,
        health: newHealth,
        heartRate: newHeartRate,
        heat: newHeat,
      })
    }, tickIntervalSec * 1000)

    return () => clearInterval(id)
  }, [tickIntervalSec, user, updateUser])

  return (
    <TimeContext.Provider
      value={{ currentTime, nextTickInSec, tickIntervalSec }}
    >
      {children}
    </TimeContext.Provider>
  )
}
