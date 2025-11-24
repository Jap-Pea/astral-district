import React from 'react'
import { theme } from '../../styles/theme'

interface GlassCardProps {
  children: React.ReactNode
  gradient?: keyof typeof theme.colors.gradients
  hover?: boolean
  padding?: keyof typeof theme.spacing
  className?: string
  onClick?: () => void
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  gradient,
  hover = true,
  padding = 'xl',
  className = '',
  onClick,
}) => {
  const [isHovered, setIsHovered] = React.useState(false)

  const cardStyle: React.CSSProperties = {
    background: gradient
      ? theme.colors.gradients[gradient]
      : theme.colors.background.card,
    backdropFilter: theme.blur.md,
    WebkitBackdropFilter: theme.blur.md,
    border: `1px solid ${theme.colors.border.default}`,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[padding],
    transition: 'all 0.3s ease',
    cursor: onClick ? 'pointer' : 'default',
    boxShadow: isHovered ? theme.shadows.glow : theme.shadows.md,
    transform: hover && isHovered ? 'translateY(-4px)' : 'translateY(0)',
  }

  return (
    <div
      style={cardStyle}
      className={className}
      onClick={onClick}
      onMouseEnter={() => hover && setIsHovered(true)}
      onMouseLeave={() => hover && setIsHovered(false)}
    >
      {children}
    </div>
  )
}
