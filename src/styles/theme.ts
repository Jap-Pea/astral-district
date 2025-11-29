export const theme = {
  colors: {
    // Background colors - deep space blacks and navy
    background: {
      primary: '#000000', // Pure black like deep space
      secondary: '#0a0a15', // Very dark navy
      card: 'rgba(15, 15, 30, 0.6)', // Dark blue-black with transparency
      cardHover: 'rgba(20, 20, 40, 0.7)', // Slightly lighter on hover
    },
    // Gradient colors - nebulas and cosmic phenomena
    gradients: {
      purple: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', // Deep space purple
      purpleBlue:
        'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)', // Dark ocean depths
      pinkPurple: 'linear-gradient(135deg, #141e30 0%, #243b55 100%)', // Midnight blue
      blue: 'linear-gradient(135deg, #000428 0%, #004e92 100%)', // Deep ocean to space
      gold: 'linear-gradient(135deg, #1c1c2e 0%, #2a2a4e 100%)', // Dark slate
      green: 'linear-gradient(135deg, #0a192f 0%, #1a2f3f 100%)', // Deep teal space
    },
    // Text colors - starlight whites and grays
    text: {
      primary: '#e0e0ff', // Slightly blue-tinted white
      secondary: '#8888aa', // Muted blue-gray
      muted: '#555566', // Dark gray with blue tint
    },
    // Accent colors - cosmic highlights
    accent: {
      purple: '#7c3aed', // Deep violet nebula
      pink: '#ec4899', // Keep pink for contrast
      blue: '#0ea5e9', // Bright cyan star
      green: '#06b6d4', // Cyan-green aurora
      red: '#dc2626', // Deep red supernova
      orange: '#f97316', // Solar flare orange
    },
    // Border colors - subtle star glows
    border: {
      default: 'rgba(255, 255, 255, 0.05)', // Very subtle
      hover: 'rgba(14, 165, 233, 0.4)', // Cyan glow
      glow: 'rgba(14, 165, 233, 0.2)', // Soft cyan glow
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '9999px',
  },
  shadows: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.5)',
    md: '0 4px 16px rgba(0, 0, 0, 0.6)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.8)',
    glow: '0 0 30px rgba(14, 165, 233, 0.5)', // Cyan star glow
    glowPink: '0 0 30px rgba(124, 58, 237, 0.5)', // Purple nebula glow
  },
  blur: {
    sm: 'blur(8px)',
    md: 'blur(12px)',
    lg: 'blur(16px)',
  },
}
