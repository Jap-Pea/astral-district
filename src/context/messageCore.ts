// src/context/messageCore.ts
import { createContext } from 'react'

export interface Message {
  id: string
  from: string // username or "District Commander"
  fromAvatar?: string // optional avatar image
  subject: string
  message: string
  timestamp: Date
  read: boolean
  isSystemMessage?: boolean // true for commander/system messages
}

export interface MessageContextType {
  messages: Message[]
  unreadCount: number
  addMessage: (message: Omit<Message, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteMessage: (id: string) => void
  deleteAll: () => void
}

export const MessageContext = createContext<MessageContextType | undefined>(
  undefined
)
