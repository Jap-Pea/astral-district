// ...existing code...
import { createContext } from 'react'

export interface ModalMessage {
  title: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  icon?: string
}

export interface ModalContextType {
  modal: ModalMessage | null
  showModal: (m: ModalMessage) => void
  hideModal: () => void
}

export const ModalContext = createContext<ModalContextType | undefined>(
  undefined
)
