export const lightTheme = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    success: '#34C759',
    warning: '#FF9500',
    danger: '#FF3B30',
    background: '#FFFFFF',
    surface: '#F2F2F7',
    text: {
      primary: '#000000',
      secondary: '#3C3C43',
      disabled: '#C7C7CC'
    },
    border: '#C6C6C8'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '16px',
    full: '9999px'
  },
  typography: {
    h1: {
      fontSize: '24px',
      fontWeight: 'bold'
    },
    h2: {
      fontSize: '20px',
      fontWeight: 'bold'
    },
    body: {
      fontSize: '16px',
      fontWeight: 'normal'
    },
    small: {
      fontSize: '14px',
      fontWeight: 'normal'
    }
  }
};

export const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    background: '#000000',
    surface: '#1C1C1E',
    text: {
      primary: '#FFFFFF',
      secondary: '#EBEBF5',
      disabled: '#3A3A3C'
    },
    border: '#38383A'
  }
}; 