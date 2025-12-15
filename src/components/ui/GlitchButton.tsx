import React from 'react'
import './GlitchButton.css'

interface GlitchButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  style?: React.CSSProperties
}

const GlitchButton: React.FC<GlitchButtonProps> = ({
  children,
  onClick,
  disabled = false,
  type = 'button',
  style,
}) => {
  return (
    <button
      className="glitch-button"
      onClick={onClick}
      disabled={disabled}
      type={type}
      style={style}
      data-text={typeof children === 'string' ? children : ''}
    >
      {children}
    </button>
  )
}

export default GlitchButton
