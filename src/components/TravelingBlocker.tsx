// src/components/TravelingBlocker.tsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useUser'

interface TravelingBlockerProps {
  allowAirport?: boolean // Allow access to airport page while traveling
}

const TravelingBlocker = ({ allowAirport = false }: TravelingBlockerProps) => {
  const navigate = useNavigate()
  const { isTraveling, travelTimeRemaining } = useUser()

  useEffect(() => {
    if (isTraveling && !allowAirport) {
      // Redirect to airport
      navigate('/airport')
    }
  }, [isTraveling, allowAirport, navigate])

  if (!isTraveling || allowAirport) return null

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={{ fontSize: '64px', marginBottom: '1rem' }}>✈️</div>
        <h2 style={styles.title}>YOU ARE TRAVELING</h2>
        <p style={styles.message}>
          You cannot access this page while in flight.
        </p>

        <div style={styles.timer}>
          <div
            style={{ fontSize: '14px', color: '#888', marginBottom: '0.5rem' }}
          >
            ARRIVAL IN
          </div>
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              fontFamily: 'monospace',
              color: '#00d9ff',
            }}
          >
            {formatTime(travelTimeRemaining)}
          </div>
        </div>

        <button
          onClick={() => navigate('/airport')}
          style={styles.button}
          onMouseEnter={(e) => {
            e.currentTarget.style.background =
              'linear-gradient(135deg, #00e5ff 0%, #c040ff 100%)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              'linear-gradient(135deg, #00d9ff 0%, #b829ff 100%)'
          }}
        >
          VIEW FLIGHT STATUS
        </button>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.95)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  } as React.CSSProperties,

  modal: {
    background: '#1a1a1a',
    borderRadius: '12px',
    border: '2px solid #00d9ff',
    padding: '3rem',
    maxWidth: '500px',
    textAlign: 'center' as const,
    boxShadow: '0 0 40px rgba(0, 217, 255, 0.5)',
  } as React.CSSProperties,

  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '0 0 1rem 0',
    color: '#fff',
    textTransform: 'uppercase' as const,
    letterSpacing: '2px',
  } as React.CSSProperties,

  message: {
    fontSize: '16px',
    color: '#888',
    marginBottom: '2rem',
    lineHeight: '1.6',
  } as React.CSSProperties,

  timer: {
    background: '#0a0a0a',
    border: '1px solid #00d9ff',
    borderRadius: '8px',
    padding: '2rem',
    marginBottom: '2rem',
  } as React.CSSProperties,

  button: {
    width: '100%',
    padding: '1.25rem',
    background: 'linear-gradient(135deg, #00d9ff 0%, #b829ff 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  } as React.CSSProperties,
}

export default TravelingBlocker
