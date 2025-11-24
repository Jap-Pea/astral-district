import { createContext } from 'react'

export type TimeContextValue = {
  currentTime: Date
  nextTickInSec: number
  tickIntervalSec: number
}

export const TimeContext = createContext<TimeContextValue | undefined>(
  undefined
)
