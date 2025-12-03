// src/hooks/useEnergy.ts
import { useUser } from './useUser'

export const useEnergy = () => {
  const { user, consumeEnergy, restoreEnergy } = useUser()

  const canAfford = (amount: number) => {
    if (!user) return false
    return user.energy >= amount
  }

  const energyPct = () => {
    if (!user) return 0
    return Math.round((user.energy / user.maxEnergy) * 100)
  }

  return { user, consumeEnergy, restoreEnergy, canAfford, energyPct }
}
