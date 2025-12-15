// src/utils/timeFormatters.ts

/**
 * Formats a date for the game's futuristic time display
 * Shows time in HH:MM:SS | DD/MM/YYYY format
 * Year starts at 2187 (162 years in the future from 2025)
 */
export const formatGameTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = 2187 + (date.getFullYear() - 2025)

  return `${hours}:${minutes}:${seconds} | ${day}/${month}/${year}`
}
