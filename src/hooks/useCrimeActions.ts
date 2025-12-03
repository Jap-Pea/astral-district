// src/hooks/useCrimeActions.ts
import { useUser } from './useUser'
import { useModal } from './useModal'
import type { Crime, CrimeResult } from '../types/crime.types'
import { attemptCrime } from '../services/mockData/crimes'

export const useCrimeActions = () => {
  const {
    user,
    consumeEnergy,
    addMoney,
    addExperience,
    increaseHeartRate,
    increaseHeat,
    checkArrestRisk,
    checkInjuryRisk,
    updateUser,
    sendToJail,
    sendToHospital,
  } = useUser()
  const { showModal } = useModal()

  const commitCrime = async (
    crime: Crime,
    setIsCommitting: (v: boolean) => void,
    setResult: (r: CrimeResult | null) => void
  ) => {
    if (!user) return

    const energyCost = crime.energyCost
    if (user.energy < energyCost) {
      showModal({
        title: 'Not Enough Energy',
        message: `You need ${crime.energyCost} energy to commit this crime.\n\nCurrent: ${user.energy}/${user.maxEnergy}`,
        type: 'error',
        icon: '⚡',
      })
      return
    }

    setIsCommitting(true)
    setResult(null)

    if (!consumeEnergy(energyCost)) {
      setIsCommitting(false)
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 1500))

    const crimeResult = attemptCrime(crime)
    setResult(crimeResult)

    if (crimeResult.injured && crimeResult.healthLost > 0) {
      const newHealth = Math.max(user.health - crimeResult.healthLost, 0)
      updateUser({ health: newHealth })
      if (newHealth === 0 || newHealth < user.maxHealth * 0.15) {
        setTimeout(() => {
          showModal({
            title: newHealth === 0 ? 'Critical Injury' : 'Injured',
            message:
              newHealth === 0
                ? "💀 You're critically injured! Going to hospital..."
                : "🏥 You're badly injured! Going to hospital...",
            type: newHealth === 0 ? 'error' : 'warning',
            icon: newHealth === 0 ? '🩺' : '🏥',
          })
          sendToHospital(15)
        }, 2500)
        setIsCommitting(false)
        return
      }
    }

    const hrIncrease = crime.heartRateCost
    const heatIncrease = Math.floor(crime.requiredLevel / 6) + 2
    increaseHeartRate(hrIncrease)
    increaseHeat(heatIncrease)

    const newHeartRate = Math.min(user.heartRate + hrIncrease, user.maxHeartRate)
    const newHeat = Math.min(user.heat + heatIncrease, user.maxHeat)

    setTimeout(() => {
      const injuryCheck = checkInjuryRisk(newHeartRate)
      if (injuryCheck.injured) {
        const projectedHealth = Math.max(user.health - injuryCheck.damage, 0)
        showModal({
          title: projectedHealth <= 0 ? 'Heart Attack' : 'Injury',
          message:
            projectedHealth <= 0
              ? '💀 Heart attack! Going to hospital...'
              : `⚠️ Your heart rate is dangerously high! You took ${injuryCheck.damage} damage!`,
          type: projectedHealth <= 0 ? 'error' : 'warning',
          icon: projectedHealth <= 0 ? '💀' : '⚠️',
        })
        if (projectedHealth <= 0 || projectedHealth < user.maxHealth * 0.15) {
          sendToHospital(15)
          setIsCommitting(false)
          return
        }
      }

      const arrested = checkArrestRisk(newHeat)
      if (arrested) {
        setTimeout(() => {
          showModal({
            title: 'Arrested',
            message: "🚔 The police caught you! You're going to jail.",
            type: 'error',
            icon: '🚔',
          })
          sendToJail(30)
          setIsCommitting(false)
        }, 500)
      }

      // Rewards
      if (crimeResult.success) {
        addMoney(crimeResult.moneyEarned)
        addExperience(crimeResult.experienceEarned)
      } else {
        addExperience(crimeResult.experienceEarned)
      }

      setIsCommitting(false)
    }, 100)
  }

  return { user, commitCrime }
}
