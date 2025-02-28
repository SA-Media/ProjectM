export const theme = {
  colors: {
    primary: {
      yellow: '#E3F31A',
      teal: '#7AC9C0',
      dark: '#1A1A1A',
    },
    secondary: {
      yellow: '#F9F92C',
      teal: '#6BECDB',
      dark: '#242628',
    },
    background: {
      light: '#FFFFFF',
      dark: '#1A1A1A',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#4A4A4A',
      light: '#FFFFFF',
    },
    error: '#E53E3E',
    warning: '#F6AD55',
    success: '#38A169',
    border: {
      light: '#e2e8f0',
      medium: '#cbd5e0',
      dark: '#718096',
    }
  },
  typography: {
    fontFamily: {
      heading: 'var(--font-heading)',
      body: 'var(--font-body)',
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      bold: 700,
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
    }
  },
  spacing: {
    xs: '0.25rem',  // 4px
    sm: '0.5rem',   // 8px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
  },
  borderRadius: {
    sm: '0.25rem',  // 4px
    md: '0.5rem',   // 8px
    lg: '1rem',     // 16px
    full: '9999px', // Circular
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  }
}; 