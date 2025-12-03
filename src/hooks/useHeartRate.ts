// src/hooks/useHeartRate.ts
import { useUser } from './useUser'

export const useHeartRate = () => {
  const { user, increaseHeartRate, checkInjuryRisk } = useUser()

  const hrPct = () => {
    if (!user) return 0
    return Math.round((user.heartRate / user.maxHeartRate) * 100)
  }

  const isInDanger = () => {
    if (!user) return false
    return user.heartRate >= user.maxHeartRate * 0.9
  }

  const dangerThreshold = () => {
    if (!user) return 0
    return Math.floor(user.maxHeartRate * 0.9)
  }

  return { user, increaseHeartRate, checkInjuryRisk, hrPct, isInDanger, dangerThreshold }
}
