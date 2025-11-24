export interface DevPanelProps {
  isOpen: boolean
  onClose: () => void
  toggleDevSpeed: () => void
  devFastTicks: boolean
  resetToBeginner: () => void
  scaleAllStats: (multiplier: number) => void
  addMoney: (amount: number) => void
}

export const DevPanel = ({
  isOpen,
  onClose,
  toggleDevSpeed,
  devFastTicks,
  resetToBeginner,
  scaleAllStats,
  addMoney,
}: DevPanelProps) => {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 9998,
        }}
      />

      {/* Dev Panel */}
      <div
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          backgroundColor: '#1a1a1a',
          border: '3px solid #00ff00',
          borderRadius: '8px',
          padding: '1.5rem',
          maxWidth: '350px',
          boxShadow: '0 0 30px #00ff0050',
          zIndex: 9999,
          fontFamily: 'monospace',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            borderBottom: '2px solid #00ff00',
            paddingBottom: '0.75rem',
          }}
        >
          <div
            style={{ fontSize: '18px', fontWeight: 'bold', color: '#00ff00' }}
          >
            DEV MODE
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#00ff00',
              color: '#000',
              border: 'none',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
            }}
          >
            ✕ Close
          </button>
        </div>

        {/* Dev Fast Ticks Toggle */}
        <div style={{ marginBottom: '1rem' }}>
          <button
            onClick={toggleDevSpeed}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: devFastTicks ? '#00ff00' : '#333',
              color: devFastTicks ? '#000' : '#00ff00',
              border: '2px solid #00ff00',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
              marginBottom: '0.5rem',
            }}
          >
            {devFastTicks ? '⚡ FAST TICKS: ON' : '⏱️ Fast Ticks: OFF'}
          </button>
          <div
            style={{
              fontSize: '11px',
              color: '#888',
              paddingLeft: '0.5rem',
            }}
          >
            Compress timers to 5s for testing
          </div>
        </div>

        {/* Reset Stats */}
        <div style={{ marginBottom: '1rem' }}>
          <button
            onClick={resetToBeginner}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#ff6600',
              color: '#fff',
              border: '2px solid #ff6600',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px',
              marginBottom: '0.5rem',
            }}
          >
            🔄 Reset to Beginner
          </button>
          <div
            style={{
              fontSize: '11px',
              color: '#888',
              paddingLeft: '0.5rem',
            }}
          >
            Reset stats & state to fresh start
          </div>
        </div>

        {/* Stat Scale Buttons */}
        <div style={{ marginBottom: '1rem' }}>
          <div
            style={{
              fontSize: '12px',
              color: '#00ff00',
              marginBottom: '0.5rem',
              fontWeight: 'bold',
            }}
          >
            Scale All Stats:
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
            }}
          >
            <button
              onClick={() => scaleAllStats(0.5)}
              style={{
                padding: '0.5rem',
                backgroundColor: '#333',
                color: '#ff6666',
                border: '1px solid #ff6666',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '12px',
              }}
            >
              ÷2
            </button>
            <button
              onClick={() => scaleAllStats(0.9)}
              style={{
                padding: '0.5rem',
                backgroundColor: '#333',
                color: '#ffaa66',
                border: '1px solid #ffaa66',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '12px',
              }}
            >
              -10%
            </button>
            <button
              onClick={() => scaleAllStats(1.1)}
              style={{
                padding: '0.5rem',
                backgroundColor: '#333',
                color: '#66ff66',
                border: '1px solid #66ff66',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '12px',
              }}
            >
              +10%
            </button>
            <button
              onClick={() => scaleAllStats(2)}
              style={{
                padding: '0.5rem',
                backgroundColor: '#333',
                color: '#66ff66',
                border: '1px solid #66ff66',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '12px',
              }}
            >
              ×2
            </button>
          </div>
        </div>

        {/* Add Money */}
        <div style={{ marginBottom: '1rem' }}>
          <div
            style={{
              fontSize: '12px',
              color: '#00ff00',
              marginBottom: '0.5rem',
              fontWeight: 'bold',
            }}
          >
            Add Money:
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
            }}
          >
            <button
              onClick={() => addMoney(1000)}
              style={{
                padding: '0.5rem',
                backgroundColor: '#333',
                color: '#4CAF50',
                border: '1px solid #4CAF50',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '12px',
              }}
            >
              +$1K
            </button>
            <button
              onClick={() => addMoney(10000)}
              style={{
                padding: '0.5rem',
                backgroundColor: '#333',
                color: '#4CAF50',
                border: '1px solid #4CAF50',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '12px',
              }}
            >
              +$10K
            </button>
            <button
              onClick={() => addMoney(100000)}
              style={{
                padding: '0.5rem',
                backgroundColor: '#333',
                color: '#4CAF50',
                border: '1px solid #4CAF50',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '12px',
              }}
            >
              +$100K
            </button>
            <button
              onClick={() => addMoney(1000000)}
              style={{
                padding: '0.5rem',
                backgroundColor: '#333',
                color: '#4CAF50',
                border: '1px solid #4CAF50',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '12px',
              }}
            >
              +$1M
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div
          style={{
            fontSize: '10px',
            color: '#666',
            borderTop: '1px solid #333',
            paddingTop: '0.75rem',
            lineHeight: '1.4',
          }}
        >
          Press{' '}
          <kbd style={{ backgroundColor: '#333', padding: '2px 4px' }}>
            Ctrl+Shift+D
          </kbd>{' '}
          to toggle this panel
        </div>
      </div>
    </>
  )
}
