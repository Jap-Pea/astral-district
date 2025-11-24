import React from 'react'
import { theme } from '../../styles/theme'

interface PageContainerProps {
  children: React.ReactNode
}

export const PageContainer: React.FC<PageContainerProps> = ({ children }) => {
  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: `
      radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.15) 0%, transparent 50%),
      ${theme.colors.background.primary}
    `,
    color: theme.colors.text.primary,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    padding: theme.spacing['2xl'],
  }

  return <div style={containerStyle}>{children}</div>
}
