import { useContext } from 'react'
import { TimeContext } from '../context/timeCore'

export const useTime = () => {
  const ctx = useContext(TimeContext)
  if (!ctx) throw new Error('useTime must be used within TimeProvider')
  return ctx
}
