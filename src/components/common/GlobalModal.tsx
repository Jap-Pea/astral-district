import { useEffect } from 'react'
import { useModal } from '../../hooks/useModal'

export const GlobalModal = () => {
  const { modal, hideModal } = useModal()

  // Auto-dismiss modal after 3 seconds (adjust as needed)
  useEffect(() => {
    if (!modal) return

    const timer = setTimeout(() => {
      hideModal()
    }, 6000)

    return () => clearTimeout(timer)
  }, [modal, hideModal])

  if (!modal) return null

  const getIconColor = () => {
    switch (modal.type) {
      case 'success':
        return '#4CAF50'
      case 'error':
        return '#f44336'
      case 'warning':
        return '#ff9800'
      case 'info':
        return '#2196F3'
      default:
        return '#888'
    }
  }

  const getBackgroundColor = () => {
    switch (modal.type) {
      case 'success':
        return '#1b5e20'
      case 'error':
        return '#5e1b1b'
      case 'warning':
        return '#664d00'
      case 'info':
        return '#0d3a66'
      default:
        return '#1a1a1a'
    }
  }

  const iconColor = getIconColor()
  const backgroundColor = getBackgroundColor()

  return (
    <>
      <div
        onClick={hideModal}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 99999,
        }}
      />

      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor,
          border: `2px solid ${iconColor}`,
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '500px',
          width: '90%',
          boxShadow: `0 0 20px ${iconColor}40`,
          zIndex: 100000,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ fontSize: '36px', color: iconColor }}>{modal.icon}</div>
          <h2
            style={{
              margin: 0,
              fontSize: '24px',
              color: iconColor,
              fontWeight: 'bold',
              textTransform: 'uppercase',
            }}
          >
            {modal.title}
          </h2>
        </div>

        <p
          style={{
            margin: '0 0 2rem 0',
            fontSize: '16px',
            color: '#aaa',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
          }}
        >
          {modal.message}
        </p>

        <button
          onClick={hideModal}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: iconColor,
            color: '#000',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            textTransform: 'uppercase',
          }}
        >
          Close
        </button>
      </div>
    </>
  )
}

export default GlobalModal
