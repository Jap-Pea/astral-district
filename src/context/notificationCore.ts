// src/context/notificationCore.ts
import { createContext } from 'react'

export interface Notification {
  id: string
  type: 'docking' | 'travel' | 'alert' | 'info' | 'success' | 'error'
  title: string
  message: string
  action?: {
    label: string
    callback: () => void
  }
  timestamp: Date
  read: boolean
}

export interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (
    notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
  ) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotification: (id: string) => void
  clearAll: () => void
}

export const NotificationContext = createContext<
  NotificationContextType | undefined
>(undefined)
