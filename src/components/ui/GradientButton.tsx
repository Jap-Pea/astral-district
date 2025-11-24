import React from 'react'
import { theme } from '../../styles/theme'

interface GradientButtonProps {
  children: React.ReactNode
  gradient?: keyof typeof theme.colors.gradients
  onClick?: () => void
  disabled?: boolean
  fullWidth?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  children,
  gradient = 'purple',
  onClick,
  disabled = false,
  fullWidth = false,
  size = 'md',
}) => {
  const [isHovered, setIsHovered] = React.useState(false)

  const sizeStyles = {
    sm: { padding: '0.5rem 1rem', fontSize: '14px' },
    md: { padding: '0.75rem 1.5rem', fontSize: '16px' },
    lg: { padding: '1rem 2rem', fontSize: '18px' },
  }

  const buttonStyle: React.CSSProperties = {
    ...sizeStyles[size],
    background: disabled ? '#333' : theme.colors.gradients[gradient],
    border: 'none',
    borderRadius: theme.borderRadius.md,
    color: theme.colors.text.primary,
    fontWeight: 'bold',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? '100%' : 'auto',
    transition: 'all 0.2s ease',
    transform: !disabled && isHovered ? 'scale(1.05)' : 'scale(1)',
    boxShadow: !disabled && isHovered ? theme.shadows.glow : 'none',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  }

  return (
    <button
      style={buttonStyle}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => !disabled && setIsHovered(false)}
    >
      {children}
    </button>
  )
}
