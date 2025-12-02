// src/context/UserContext.tsx
/**
 * STAT SYSTEM DOCUMENTATION
 * =====================
 *
 * BEGINNER STATS (Level 0):
 * - Health: 500 HP (regen 1 HP per 2 minute)
 * - Money: $0
 * - Energy: 100 (regen 5 energy every 10 minutes)
 * - Heart Rate: 50 BPM (capped at 140 max, decreases 2 every 5 minutes)
 * - Heat: 0 (capped at 100 max, decreases 2 every 5 minutes)
 * - Combat Stats (all starting at 1):
 *   - Strength: 1
 *   - Defense: 1
 *   - Speed: 1
 *   - Dexterity: 1
 */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import type { User } from '../types/user.types'
import type { UserContextType } from './userCore'
import {
  computeInjuryDecision,
  computeArrestDecision,
  computeEscapeRoll,
} from '../utils/decisionHelpers'
import { UserContext } from './userCore'
import { getItemById } from '../services/mockData/items'
import type { InventoryItem } from '../types/item.types'

interface UserProviderProps {
  children: ReactNode
}

// Revive dates after loading user from localStorage
const reviveDate = (v: any): Date => (v instanceof Date ? v : new Date(v))
const reviveUserFromStorage = (raw: any): User => {
  const revived: User = {
    ...raw,
    lastAction: raw.lastAction ? reviveDate(raw.lastAction) : new Date(),
    createdAt: raw.createdAt ? reviveDate(raw.createdAt) : new Date(),
  }

  if (Array.isArray(raw?.inventory)) {
    revived.inventory = raw.inventory.map((inv: any) => ({
      ...inv,
      acquiredAt: reviveDate(inv.acquiredAt),
    })) as InventoryItem[]
  }

  if (raw?.loanHistory) {
    const lh = raw.loanHistory
    revived.loanHistory = {
      ...lh,
      currentLoans: Array.isArray(lh.currentLoans)
        ? lh.currentLoans.map((l: any) => ({
            ...l,
            takenAt: reviveDate(l.takenAt),
            dueDate: reviveDate(l.dueDate),
            paidAt: l.paidAt ? reviveDate(l.paidAt) : undefined,
            paidAmount: typeof l.paidAmount === 'number' ? l.paidAmount : l.paidAmount ? Number(l.paidAmount) : undefined,
          }))
        : [],
      pastLoans: Array.isArray(lh.pastLoans)
        ? lh.pastLoans.map((l: any) => ({
            ...l,
            takenAt: reviveDate(l.takenAt),
            dueDate: reviveDate(l.dueDate),
            paidAt: l.paidAt ? reviveDate(l.paidAt) : undefined,
            paidAmount: typeof l.paidAmount === 'number' ? l.paidAmount : l.paidAmount ? Number(l.paidAmount) : undefined,
          }))
        : [],
    }
  }

  return revived
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const userRef = useRef<User | null>(null)
  const userExists = useMemo(() => !!user, [user])
  
  // Keep ref in sync with state
  useEffect(() => {
    userRef.current = user
  }, [user])
  const [isInJail, setIsInJail] = useState(false)
  const [isInHospital, setIsInHospital] = useState(false)
  const [jailTimeRemaining, setJailTimeRemaining] = useState(0)
  const [hospitalTimeRemaining, setHospitalTimeRemaining] = useState(0)
  const [healthLastTick, setHealthLastTick] = useState<number>(() => Date.now())
  const [devFastTicks, setDevFastTicks] = useState<boolean>(false)
  const [devPanelOpen, setDevPanelOpen] = useState(false)
  const toggleDevSpeed = useCallback(() => setDevFastTicks((v) => !v), [])
  const toggleDevPanel = useCallback(() => setDevPanelOpen((v) => !v), [])

  // Initialize user on mount - CHANGED: Don't create a default user if none exists
  useEffect(() => {
    const loadUser = async () => {
      try {
        const saved = localStorage.getItem('astralUser')
        if (saved) {
          const parsedUser = JSON.parse(saved)
          const revived = reviveUserFromStorage(parsedUser)
          setUser(revived)
          console.log('✅ Loaded existing user:', parsedUser.username)
        } else {
          // No saved user - let NewPlayerGate handle character creation
          console.log('ℹ️ No saved user found - showing character creation')
          setUser(null)
        }
      } catch (error) {
        console.error('❌ Error loading user:', error)
        setUser(null)
      }
      setIsLoading(false)
    }
    loadUser()
  }, [])

  // Persist user to localStorage on change
  useEffect(() => {
    if (user) {
      localStorage.setItem('astralUser', JSON.stringify(user))
    }
  }, [user])

  // Auto-regenerate energy over time (5 energy every 10 minutes)
  useEffect(() => {
    if (!userExists) return

    const energyIntervalMs = devFastTicks ? 5000 : 600000 // 5s dev / 10min prod
    const interval = setInterval(() => {
      setUser((prev) => {
        if (!prev) return prev

        const newEnergy = Math.min(prev.energy + 5, prev.maxEnergy)

        return {
          ...prev,
          energy: newEnergy,
        }
      })
    }, energyIntervalMs)

    return () => clearInterval(interval)
  }, [devFastTicks, userExists])

  // Auto-regenerate health over time (1 HP every 2 minute). While in hospital
  // heal faster. Centralized here so UI mounts/unmounts don't create extra
  // immediate ticks which previously caused accelerated regen.
  useEffect(() => {
    if (!userExists) return

    const healthIntervalMs = devFastTicks ? 5000 : 60000 // 5s dev / 1min prod
    const interval = setInterval(() => {
      setUser((prev) => {
        if (!prev) return prev
        if (prev.health >= prev.maxHealth) return prev

        const healAmount = isInHospital ? 5 : 1
        const newHealth = Math.min(prev.health + healAmount, prev.maxHealth)

        // record last tick time for UI countdowns
        setHealthLastTick(Date.now())

        return {
          ...prev,
          health: newHealth,
        }
      })
    }, healthIntervalMs)

    return () => clearInterval(interval)
  }, [isInHospital, devFastTicks, userExists])

  // Auto-decrease heartRate and heat over time
  useEffect(() => {
    if (!userExists) return

    const hrHeatIntervalMs = devFastTicks ? 5000 : 300000 // 5s dev / 5min prod
    const interval = setInterval(() => {
      setUser((prev) => {
        if (!prev) return prev

        const newHeartRate = Math.max(prev.heartRate - 2, 50)
        const newHeat = Math.max(prev.heat - 2, 0) // drops 2 every 5 min

        return {
          ...prev,
          heartRate: newHeartRate,
          heat: newHeat,
        }
      })
    }, hrHeatIntervalMs)

    return () => clearInterval(interval)
  }, [devFastTicks, userExists])

  // Jail timer countdown
  useEffect(() => {
    if (!isInJail || jailTimeRemaining <= 0) return

    const interval = setInterval(() => {
      setJailTimeRemaining((prev) => {
        const newTime = prev - 1
        if (newTime <= 0) {
          setIsInJail(false)
          return 0
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isInJail, jailTimeRemaining])

  // Hospital timer countdown
  useEffect(() => {
    if (!isInHospital || hospitalTimeRemaining <= 0) return

    const interval = setInterval(() => {
      setHospitalTimeRemaining((prev) => {
        const newTime = prev - 1
        if (newTime <= 0) {
          setIsInHospital(false)
          return 0
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isInHospital, hospitalTimeRemaining])

  // Keyboard shortcut: Ctrl+Shift+D to toggle dev panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault()
        setDevPanelOpen((v) => !v)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const updateUser = useCallback(
    (updates: Partial<User>) => {
      setUser((prev) => {
        if (!prev) {
          // If there's no previous user, create a new one with the updates
          // This allows NewPlayerGate to initialize a new user
          return updates as User
        }

        // Merge updates, then enforce global caps and sane ranges
        const merged: User = {
          ...prev,
          ...updates,
        }

        // Enforce energy cap (game design: energy max is 100 unless purchased later)
        if (merged.maxEnergy === undefined || merged.maxEnergy === null) {
          merged.maxEnergy = prev.maxEnergy
        }
        merged.maxEnergy = Math.min(merged.maxEnergy, 100)

        // Clamp current energy to [0, maxEnergy]
        merged.energy = Math.max(
          0,
          Math.min(merged.energy ?? prev.energy, merged.maxEnergy)
        )

        // Enforce heart rate cap (max 180)
        if (merged.maxHeartRate === undefined || merged.maxHeartRate === null) {
          merged.maxHeartRate = prev.maxHeartRate
        }
        merged.maxHeartRate = Math.min(merged.maxHeartRate, 180)

        // Clamp heartRate to sensible bounds (min 50)
        merged.heartRate = Math.max(
          50,
          Math.min(merged.heartRate ?? prev.heartRate, merged.maxHeartRate)
        )

        // Ensure heat is within bounds
        merged.maxHeat = Math.max(0, merged.maxHeat ?? prev.maxHeat)
        merged.heat = Math.max(
          0,
          Math.min(merged.heat ?? prev.heat, merged.maxHeat)
        )

        return {
          ...merged,
          lastAction: new Date(),
        }
      })
    },
    [setUser]
  )

  const consumeEnergy = useCallback((amount: number): boolean => {
    // Check synchronously before updating using ref
    if (!userRef.current || userRef.current.energy < amount) return false

    setUser((prev) => {
      if (!prev || prev.energy < amount) {
        return prev
      }
      return {
        ...prev,
        energy: prev.energy - amount,
        lastAction: new Date(),
      }
    })
    return true
  }, [])

  const restoreHealth = useCallback((amount: number) => {
    setUser((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        health: Math.min(prev.health + amount, prev.maxHealth),
        lastAction: new Date(),
      }
    })
  }, [])

  const restoreEnergy = useCallback((amount: number) => {
    setUser((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        energy: Math.min(prev.energy + amount, prev.maxEnergy),
        lastAction: new Date(),
      }
    })
  }, [])

  // Dev: reset user completely and clear localStorage
  const resetToBeginner = useCallback(() => {
    localStorage.removeItem('astralUser')
    localStorage.removeItem('suss-life_v1_state')
    setUser(null)
    setIsInHospital(false)
    setIsInJail(false)
    setJailTimeRemaining(0)
    setHospitalTimeRemaining(0)
    setHealthLastTick(Date.now())
    console.log('🗑️ User data cleared - reload page to start fresh')
  }, [
    setIsInHospital,
    setIsInJail,
    setJailTimeRemaining,
    setHospitalTimeRemaining,
    setHealthLastTick,
    setUser,
  ])

  // Dev: scale numeric user stats by multiplier (e.g., 0.5 to halve, 2 to double)
  const scaleAllStats = useCallback(
    (multiplier: number) => {
      if (!user) return

      const clampMin = (v: number, min = 0) =>
        Math.max(min, Math.floor(v * multiplier))

      // Enforce caps: energy cap max 100, heart rate cap max 180
      const scaledMaxEnergy = Math.min(100, clampMin(user.maxEnergy, 1))
      const scaledEnergy = Math.min(scaledMaxEnergy, clampMin(user.energy, 0))
      const scaledMaxHeartRate = Math.min(180, clampMin(user.maxHeartRate, 50))
      const scaledHeartRate = Math.max(
        50,
        Math.min(scaledMaxHeartRate, clampMin(user.heartRate, 50))
      )

      updateUser({
        maxHealth: clampMin(user.maxHealth, 1),
        health: Math.min(clampMin(user.health, 1), clampMin(user.maxHealth, 1)),
        maxEnergy: scaledMaxEnergy,
        energy: scaledEnergy,
        maxHeartRate: scaledMaxHeartRate,
        heartRate: scaledHeartRate,
        maxHeat: clampMin(user.maxHeat, 0),
        heat: clampMin(user.heat, 0),
        money: clampMin(user.money, 0),
        level: Math.max(1, clampMin(user.level, 1)),
        experience: clampMin(user.experience, 0),
        experienceToNext: Math.max(1, clampMin(user.experienceToNext, 1)),
      })
    },
    [user, updateUser]
  )

  const increaseHeartRate = useCallback((amount: number) => {
    setUser((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        heartRate: Math.min(prev.heartRate + amount, prev.maxHeartRate),
        lastAction: new Date(),
      }
    })
  }, [])

  const increaseHeat = useCallback((amount: number) => {
    setUser((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        heat: Math.min(prev.heat + amount, prev.maxHeat),
        lastAction: new Date(),
      }
    })
  }, [])

  const checkInjuryRisk = useCallback((
    currentHeartRate?: number
  ): { injured: boolean; damage: number } => {
    let result = { injured: false, damage: 0 }
    setUser((prev) => {
      if (!prev) return prev

      const heartRate = currentHeartRate ?? prev.heartRate
      // Check if heart rate is above 90% of max (danger zone)
      const dangerThreshold = prev.maxHeartRate * 0.9
      if (heartRate <= dangerThreshold) return prev
      
      const decision = computeInjuryDecision(heartRate, prev.maxHealth, prev.maxHeartRate)
      console.log('Injury check - HR:', heartRate, '/', prev.maxHeartRate, 'Decision:', decision)

      if (decision.injured) {
        const damage = decision.damage
        const newHealth = Math.max(prev.health - damage, 0)
        result = { injured: true, damage }

        if (newHealth < prev.maxHealth * 0.15 || newHealth === 0) {
          // Hospital flag will be set after state update
          result.injured = true
          result.damage = damage
        }

        return {
          ...prev,
          health: newHealth,
          lastAction: new Date(),
        }
      }

      return prev
    })
    return result
  }, [])

  const checkArrestRisk = useCallback((currentHeat?: number): boolean => {
    let arrested = false
    setUser((prev) => {
      if (!prev) return prev

      const heat = currentHeat ?? prev.heat
      console.log('Arrest check - Heat:', heat)

      if (heat <= 75) return prev

      const decision = computeArrestDecision(heat)
      console.log('Arrest decision:', decision)

      if (decision.arrested) {
        console.log(
          'ARRESTED! Sending to jail for',
          decision.jailMinutes,
          'minutes'
        )
        arrested = true
      }

      return prev
    })
    return arrested
  }, [])

  const sendToJail = (duration: number) => {
    setIsInJail(true)
    setJailTimeRemaining(duration * 60)

    if (user) {
      updateUser({ heat: 0 })
    }
  }

  const sendToHospital = (duration: number) => {
    setIsInHospital(true)
    setHospitalTimeRemaining(duration * 60)

    if (user) {
      updateUser({ heartRate: 50 })
    }
  }

  const attemptJailEscape = (): boolean => {
    if (!user || !isInJail) return false

    const heartRateCost = 30
    if (user.heartRate < heartRateCost) return false

    const escapeChance = 40
    const succeeded = computeEscapeRoll(escapeChance)

    if (succeeded) {
      setIsInJail(false)
      setJailTimeRemaining(0)
      updateUser({
        heartRate: Math.min(user.heartRate + heartRateCost, user.maxHeartRate),
        heat: Math.min(user.heat + 25, user.maxHeat),
      })
      return true
    } else {
      setJailTimeRemaining((prev) => prev + 600)
      updateUser({
        heartRate: Math.min(user.heartRate + heartRateCost, user.maxHeartRate),
        heat: Math.min(user.heat + 10, user.maxHeat),
      })
      return false
    }
  }

  const payBail = (amount: number): boolean => {
    if (!user || !isInJail) return false

    if (spendMoney(amount)) {
      setIsInJail(false)
      setJailTimeRemaining(0)
      updateUser({ heat: Math.max(user.heat - 10, 0) })
      return true
    }

    return false
  }

  const applyMedInHospital = (timeReduction: number) => {
    if (!isInHospital) return

    setHospitalTimeRemaining((prev) => Math.max(prev - timeReduction, 0))
  }

  const addMoney = useCallback((amount: number) => {
    setUser((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        money: prev.money + amount,
        lastAction: new Date(),
      }
    })
  }, [])

  const spendMoney = useCallback((amount: number): boolean => {
    let spent = false
    setUser((prev) => {
      if (!prev || prev.money < amount) {
        spent = false
        return prev
      }
      spent = true
      return {
        ...prev,
        money: prev.money - amount,
        lastAction: new Date(),
      }
    })
    return spent
  }, [])

  const addExperience = useCallback((amount: number) => {
    setUser((prev) => {
      if (!prev) return prev

      let newExp = prev.experience + amount
      let newLevel = prev.level
      let expToNext = prev.experienceToNext
      let maxHealth = prev.maxHealth
      let health = prev.health
      const stats = { ...prev.stats }

      while (newExp >= expToNext) {
        newExp -= expToNext
        newLevel++
        expToNext = Math.floor(expToNext * 1.5)

        const healthIncreasePerLevel = 25
        maxHealth += healthIncreasePerLevel
        health = Math.min(health + healthIncreasePerLevel, maxHealth)
        
        stats.strength += 1
        stats.defense += 1
        stats.speed += 1
        stats.dexterity += 1
      }

      return {
        ...prev,
        experience: newExp,
        level: newLevel,
        experienceToNext: expToNext,
        maxHealth,
        health,
        stats,
        lastAction: new Date(),
      }
    })
  }, [])

  const addItemToInventory = (itemId: string, quantity: number): boolean => {
    if (!user) return false

    const item = getItemById(itemId)
    if (!item) return false

    const newInventory = [...user.inventory]
    const existingItemIndex = newInventory.findIndex(
      (inv) => inv.item.id === itemId
    )

    if (existingItemIndex >= 0) {
      if (item.stackable) {
        newInventory[existingItemIndex] = {
          ...newInventory[existingItemIndex],
          quantity: newInventory[existingItemIndex].quantity + quantity,
        }
      } else {
        newInventory.push({
          item,
          quantity,
          equipped: false,
          acquiredAt: new Date(),
        })
      }
    } else {
      newInventory.push({
        item,
        quantity,
        equipped: false,
        acquiredAt: new Date(),
      })
    }

    updateUser({ inventory: newInventory })
    return true
  }

  const removeItemFromInventory = (
    itemId: string,
    quantity: number
  ): boolean => {
    if (!user) return false

    const newInventory = [...user.inventory]
    const existingItemIndex = newInventory.findIndex(
      (inv) => inv.item.id === itemId
    )

    if (existingItemIndex < 0) return false

    const existingItem = newInventory[existingItemIndex]

    if (existingItem.quantity <= quantity) {
      newInventory.splice(existingItemIndex, 1)
    } else {
      newInventory[existingItemIndex] = {
        ...existingItem,
        quantity: existingItem.quantity - quantity,
      }
    }

    updateUser({ inventory: newInventory })
    return true
  }

  const getInventoryItem = (itemId: string): InventoryItem | undefined => {
    if (!user) return undefined
    return user.inventory.find((inv) => inv.item.id === itemId)
  }

  const useItem = (itemId: string): boolean => {
    if (!user) return false

    const invItem = getInventoryItem(itemId)
    if (!invItem || !invItem.item.usable) return false

    const effects = invItem.item.effects
    if (!effects) return false

    if (effects.healthRestore) {
      restoreHealth(effects.healthRestore)
    }
    if (effects.energyRestore) {
      restoreEnergy(effects.energyRestore)
    }
    if (effects.heartRateRestore) {
      const newHeartRate = Math.max(
        50,
        user.heartRate - effects.heartRateRestore
      )
      updateUser({ heartRate: newHeartRate })
    }

    removeItemFromInventory(itemId, 1)
    return true
  }

  const equipItem = (itemId: string): boolean => {
    if (!user) return false

    const invItem = getInventoryItem(itemId)
    if (!invItem) return false
    if (invItem.item.type !== 'weapon' && invItem.item.type !== 'armor')
      return false
    if (invItem.equipped) return false

    const newInventory = user.inventory.map((inv) => {
      if (
        inv.item.type === invItem.item.type &&
        inv.item.id !== itemId &&
        inv.equipped
      ) {
        return { ...inv, equipped: false }
      }
      if (inv.item.id === itemId) {
        return { ...inv, equipped: true }
      }
      return inv
    })

    updateUser({ inventory: newInventory })
    return true
  }

  const unequipItem = (itemId: string): boolean => {
    if (!user) return false

    const invItem = getInventoryItem(itemId)
    if (!invItem || !invItem.equipped) return false

    const newInventory = user.inventory.map((inv) =>
      inv.item.id === itemId ? { ...inv, equipped: false } : inv
    )

    updateUser({ inventory: newInventory })
    return true
  }

  const getFuelCount = useCallback(
    (fuelType: 'ion' | 'fusion' | 'quantum'): number => {
      if (!user) return 0

      const fuelItemIds = {
        ion: 'fuel_ion_propellant',
        fusion: 'fuel_fusion_core',
        quantum: 'fuel_quantum_flux',
      }

      const fuelItem = user.inventory.find(
        (inv) => inv.item.id === fuelItemIds[fuelType]
      )

      return fuelItem?.quantity || 0
    },
    [user]
  )

  const useFuel = useCallback(
    (fuelType: 'ion' | 'fusion' | 'quantum', amount: number): boolean => {
      if (!user) return false

      const currentFuel = getFuelCount(fuelType)
      if (currentFuel < amount) return false

      const fuelItemIds = {
        ion: 'fuel_ion_propellant',
        fusion: 'fuel_fusion_core',
        quantum: 'fuel_quantum_flux',
      }

      const updatedInventory = user.inventory
        .map((inv) => {
          if (inv.item.id === fuelItemIds[fuelType]) {
            return {
              ...inv,
              quantity: inv.quantity - amount,
            }
          }
          return inv
        })
        .filter((inv) => inv.quantity > 0)

      updateUser({ inventory: updatedInventory })
      return true
    },
    [user, getFuelCount, updateUser]
  )

  const [isTraveling, setIsTraveling] = useState(false)
  const [travelTimeRemaining, setTravelTimeRemaining] = useState(0)

  const value: UserContextType = {
    user,
    setUser,
    updateUser,
    consumeEnergy,
    restoreHealth,
    restoreEnergy,
    increaseHeartRate,
    increaseHeat,
    checkInjuryRisk,
    checkArrestRisk,
    addMoney,
    spendMoney,
    addExperience,
    sendToJail,
    sendToHospital,
    attemptJailEscape,
    payBail,
    applyMedInHospital,
    addItemToInventory,
    removeItemFromInventory,
    useItem,
    equipItem,
    unequipItem,
    getInventoryItem,
    isTraveling,
    setIsTraveling,
    getFuelCount,
    useFuel,
    travelTimeRemaining,
    setTravelTimeRemaining,
    resetToBeginner,
    scaleAllStats,
    devFastTicks,
    toggleDevSpeed,
    devPanelOpen,
    toggleDevPanel,
    isInJail,
    isInHospital,
    jailTimeRemaining,
    hospitalTimeRemaining,
    healthLastTick,
    isLoading,
  }

  useEffect(() => {
    const isDev =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1')
    if (!isDev) return

    type DevObj = {
      toggleDevSpeed: () => void
      resetToBeginner: () => void
      scaleAllStats: (n: number) => void
      getDevFastTicks: () => boolean
      setUser: React.Dispatch<React.SetStateAction<User | null>>
    }

    const devObj: DevObj = {
      toggleDevSpeed,
      resetToBeginner,
      scaleAllStats,
      getDevFastTicks: () => devFastTicks,
      setUser,
    }

    const win = window as Window & { __duskDev?: DevObj }
    win.__duskDev = devObj

    const cleanup = () => {
      try {
        delete win.__duskDev
      } catch {
        win.__duskDev = undefined
      }
    }

    window.addEventListener('beforeunload', cleanup)
    return () => {
      cleanup()
      window.removeEventListener('beforeunload', cleanup)
    }
  }, [toggleDevSpeed, resetToBeginner, scaleAllStats, devFastTicks, setUser])

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
