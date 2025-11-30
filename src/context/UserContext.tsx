// src/context/UserContext.tsx
/**
 * STAT SYSTEM DOCUMENTATION
 * =====================
 *
 * BEGINNER STATS (Level 0):
 * - Health: 500 HP (regen 1 HP per 1 minute)
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
import { useState, useEffect, useCallback } from 'react'
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

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
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
          setUser(parsedUser)
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
    if (!user) return

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
  }, [user, devFastTicks])

  // Auto-regenerate health over time (1 HP every 1 minute). While in hospital
  // heal faster. Centralized here so UI mounts/unmounts don't create extra
  // immediate ticks which previously caused accelerated regen.
  useEffect(() => {
    if (!user) return

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
  }, [user, isInHospital, devFastTicks])

  // Auto-decrease heartRate and heat over time
  useEffect(() => {
    if (!user) return

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
  }, [user, devFastTicks])

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

  const consumeEnergy = (amount: number): boolean => {
    if (!user || user.energy < amount) return false

    updateUser({ energy: user.energy - amount })
    return true
  }

  const restoreHealth = (amount: number) => {
    if (!user) return

    const newHealth = Math.min(user.health + amount, user.maxHealth)
    updateUser({ health: newHealth })
  }

  const restoreEnergy = (amount: number) => {
    if (!user) return

    const newEnergy = Math.min(user.energy + amount, user.maxEnergy)
    updateUser({ energy: newEnergy })
  }

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

  const increaseHeartRate = (amount: number) => {
    if (!user) return

    const newHeartRate = Math.min(user.heartRate + amount, user.maxHeartRate)
    updateUser({ heartRate: newHeartRate })
  }

  const increaseHeat = (amount: number) => {
    if (!user) return

    const newHeat = Math.min(user.heat + amount, user.maxHeat)
    updateUser({ heat: newHeat })
  }

  const checkInjuryRisk = (
    currentHeartRate?: number
  ): { injured: boolean; damage: number } => {
    if (!user) return { injured: false, damage: 0 }

    const heartRate = currentHeartRate ?? user.heartRate
    if (heartRate <= 150) return { injured: false, damage: 0 }
    const decision = computeInjuryDecision(heartRate, user.maxHealth)
    console.log('Injury check - HR:', heartRate, 'Decision:', decision)

    if (decision.injured) {
      const damage = decision.damage
      const newHealth = Math.max(user.health - damage, 0)
      updateUser({ health: newHealth })

      if (newHealth < user.maxHealth * 0.15 || newHealth === 0) {
        sendToHospital(15)
      }

      return { injured: true, damage }
    }

    return { injured: false, damage: 0 }
  }

  const checkArrestRisk = (currentHeat?: number): boolean => {
    if (!user) return false

    const heat = currentHeat ?? user.heat
    console.log('Arrest check - Heat:', heat)

    if (heat <= 75) return false

    const decision = computeArrestDecision(heat)
    console.log('Arrest decision:', decision)

    if (decision.arrested) {
      console.log(
        'ARRESTED! Sending to jail for',
        decision.jailMinutes,
        'minutes'
      )
      sendToJail(decision.jailMinutes)
      return true
    }

    return false
  }

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

  const addMoney = (amount: number) => {
    if (!user) return

    updateUser({ money: user.money + amount })
  }

  const spendMoney = (amount: number): boolean => {
    if (!user || user.money < amount) return false

    updateUser({ money: user.money - amount })
    return true
  }

  const addExperience = (amount: number) => {
    if (!user) return

    let newExp = user.experience + amount
    let newLevel = user.level
    let expToNext = user.experienceToNext

    while (newExp >= expToNext) {
      newExp -= expToNext
      newLevel++
      expToNext = Math.floor(expToNext * 1.5)

      const healthIncreasePerLevel = 25
      const levelUpBonus = {
        maxHealth: user.maxHealth + healthIncreasePerLevel,
        health: Math.min(
          user.health + healthIncreasePerLevel,
          user.maxHealth + healthIncreasePerLevel
        ),
        stats: {
          strength: user.stats.strength + 1,
          defense: user.stats.defense + 1,
          speed: user.stats.speed + 1,
          dexterity: user.stats.dexterity + 1,
        },
      }

      updateUser(levelUpBonus)
    }

    updateUser({
      experience: newExp,
      level: newLevel,
      experienceToNext: expToNext,
    })
  }

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
