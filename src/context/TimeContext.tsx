import React, { useEffect, useRef, useState } from 'react'
import { useUser } from '../hooks/useUser'
import { TimeContext } from './timeCore'

export const TimeProvider: React.FC<{
  children: React.ReactNode
  tickIntervalSec?: number
}> = ({ children, tickIntervalSec = 10 }) => {
  const { user, updateUser } = useUser()
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const nextTickRef = useRef<number>(0)
  const [nextTickInSec, setNextTickInSec] = useState<number>(tickIntervalSec)

  // clock (every second)
  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  // global tick (every tickIntervalSec seconds)
  useEffect(() => {
    nextTickRef.current = Date.now() + tickIntervalSec * 1000
    const id = setInterval(() => {
      nextTickRef.current = Date.now() + tickIntervalSec * 1000
      setNextTickInSec(tickIntervalSec)

      if (!user || !updateUser) return

      // Configurable per-tick deltas (tweak as desired)
      const energyRegen = 2 // energy gained per tick
      const healthRegen = 1 // health gained per tick
      const hrDecrease = 2 // heartRate decrease per tick
      const heatDecrease = 3 // heat decrease per tick

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
// Note: useTime hook is provided from `src/hooks/useTime.ts` to keep this file
// focused on the provider implementation.
