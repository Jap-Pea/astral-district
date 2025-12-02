import React, { type ReactNode } from 'react'
import { theme } from '../../styles/theme'

interface StatCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  color?: keyof typeof theme.colors.accent
  tooltip?: string
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  color = 'purple',
  tooltip,
}) => {
  const cardStyle: React.CSSProperties = {
    background: theme.colors.background.card,
    backdropFilter: theme.blur.md,
    WebkitBackdropFilter: theme.blur.md,
    border: `1px solid ${theme.colors.border.default}`,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    textAlign: 'center',
  }

  return (
    <div style={cardStyle} className="stat-card-tooltip-container">
      {icon && (
        <div style={{ fontSize: '32px', marginBottom: theme.spacing.sm }}>
          {icon}
        </div>
      )}
      <div
        style={{
          fontSize: '12px',
          color: theme.colors.text.secondary,
          marginBottom: theme.spacing.xs,
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: theme.colors.accent[color],
          position: 'relative',
        }}
      >
        <span>{value}</span>
        {tooltip && (
          <span
            className="stat-card-tooltip"
            style={{
              visibility: 'hidden',
              background: '#222',
              color: '#fff',
              borderRadius: 4,
              padding: '4px 8px',
              position: 'absolute',
              left: '50%',
              top: '-32px',
              transform: 'translateX(-50%)',
              fontSize: 12,
              zIndex: 10,
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px #0006',
            }}
          >
            {tooltip}
          </span>
        )}
      </div>
      <style>{`
        .stat-card-tooltip-container:hover .stat-card-tooltip {
          visibility: visible;
        }
      `}</style>
    </div>
  )
}
