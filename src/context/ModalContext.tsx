import { useState } from 'react'
import type { ReactNode } from 'react'
import { ModalContext } from './modalCore'
import type { ModalMessage } from './modalCore'

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modal, setModal] = useState<ModalMessage | null>(null)

  const showModal = (m: ModalMessage) => setModal(m)
  const hideModal = () => setModal(null)

  return (
    <ModalContext.Provider value={{ modal, showModal, hideModal }}>
      {children}
    </ModalContext.Provider>
  )
}

export default ModalContext
