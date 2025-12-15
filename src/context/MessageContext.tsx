// src/context/MessageContext.tsx
import { useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { MessageContext } from './messageCore'
import type { Message } from './messageCore'

export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([])

  const addMessage = useCallback(
    (message: Omit<Message, 'id' | 'timestamp' | 'read'>) => {
      const newMessage: Message = {
        ...message,
        id: `msg-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        read: false,
      }
      setMessages((prev) => [newMessage, ...prev])
    },
    []
  )

  const markAsRead = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, read: true } : m))
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setMessages((prev) => prev.map((m) => ({ ...m, read: true })))
  }, [])

  const deleteMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id))
  }, [])

  const deleteAll = useCallback(() => {
    setMessages([])
  }, [])

  const unreadCount = messages.filter((m) => !m.read).length

  return (
    <MessageContext.Provider
      value={{
        messages,
        unreadCount,
        addMessage,
        markAsRead,
        markAllAsRead,
        deleteMessage,
        deleteAll,
      }}
    >
      {children}
    </MessageContext.Provider>
  )
}
