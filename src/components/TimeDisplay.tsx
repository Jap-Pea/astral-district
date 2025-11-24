import React from 'react'
import { useTime } from '../hooks/useTime'

export const TimeDisplay: React.FC<{ style?: React.CSSProperties }> = ({
  style,
}) => {
  const { currentTime, nextTickInSec } = useTime()

  return (
    <div
      style={{
        display: 'center',
        gap: 8,
        alignItems: 'center',
        color: '#fff',
        fontSize: 13,
        ...style,
      }}
    >
      <div title="Local time">{currentTime.toLocaleTimeString()}</div>
      <div style={{ opacity: 0.8, fontSize: 12 }}>
        | next tick in {nextTickInSec}s
      </div>
    </div>
  )
}

export default TimeDisplay
