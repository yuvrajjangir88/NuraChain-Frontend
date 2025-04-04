import { createTheme } from '@mui/material/styles';

// Define color palettes for light and dark modes
const lightPalette = {
  primary: {
    main: '#2563eb',
    light: '#60a5fa',
    dark: '#1d4ed8',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#8b5cf6',
    light: '#a78bfa',
    dark: '#7c3aed',
    contrastText: '#ffffff',
  },
  success: {
    main: '#10b981',
    light: '#34d399',
    dark: '#059669',
    contrastText: '#ffffff',
  },
  error: {
    main: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
    contrastText: '#ffffff',
  },
  info: {
    main: '#3b82f6',
    light: '#60a5fa',
    dark: '#2563eb',
    contrastText: '#ffffff',
  },
  background: {
    default: '#f8fafc',
    paper: '#ffffff',
  },
  text: {
    primary: '#1e293b',
    secondary: '#64748b',
    disabled: '#94a3b8',
  },
};

const darkPalette = {
  primary: {
    main: '#3b82f6',
    light: '#60a5fa',
    dark: '#2563eb',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#a78bfa',
    light: '#c4b5fd',
    dark: '#8b5cf6',
    contrastText: '#ffffff',
  },
  success: {
    main: '#34d399',
    light: '#6ee7b7',
    dark: '#10b981',
    contrastText: '#ffffff',
  },
  error: {
    main: '#f87171',
    light: '#fca5a5',
    dark: '#ef4444',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#fbbf24',
    light: '#fcd34d',
    dark: '#f59e0b',
    contrastText: '#ffffff',
  },
  info: {
    main: '#60a5fa',
    light: '#93c5fd',
    dark: '#3b82f6',
    contrastText: '#ffffff',
  },
  background: {
    default: '#0f172a',
    paper: '#1e293b',
  },
  text: {
    primary: '#f8fafc',
    secondary: '#cbd5e1',
    disabled: '#64748b',
  },
};

// Common typography settings
const typography = {
  fontFamily: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.01em',
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: '-0.01em',
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: '-0.01em',
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.2,
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.2,
  },
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
  },
  button: {
    fontSize: '0.875rem',
    fontWeight: 600,
    textTransform: 'none',
    letterSpacing: '0.02em',
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.5,
  },
  overline: {
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
};

// Create theme function that uses the current mode
export const createAppTheme = (mode) => {
  return createTheme({
    palette: {
      mode: mode ? 'dark' : 'light',
      ...(mode ? darkPalette : lightPalette),
    },
    typography,
    shape: {
      borderRadius: 12,
    },
    shadows: [
      'none',
      '0px 2px 4px rgba(0, 0, 0, 0.05)',
      '0px 4px 8px rgba(0, 0, 0, 0.05)',
      '0px 8px 16px rgba(0, 0, 0, 0.05)',
      '0px 12px 24px rgba(0, 0, 0, 0.05)',
      '0px 16px 32px rgba(0, 0, 0, 0.05)',
      '0px 20px 40px rgba(0, 0, 0, 0.05)',
      '0px 24px 48px rgba(0, 0, 0, 0.05)',
      '0px 28px 56px rgba(0, 0, 0, 0.05)',
      '0px 32px 64px rgba(0, 0, 0, 0.05)',
      '0px 36px 72px rgba(0, 0, 0, 0.05)',
      '0px 40px 80px rgba(0, 0, 0, 0.05)',
      '0px 44px 88px rgba(0, 0, 0, 0.05)',
      '0px 48px 96px rgba(0, 0, 0, 0.05)',
      '0px 52px 104px rgba(0, 0, 0, 0.05)',
      '0px 56px 112px rgba(0, 0, 0, 0.05)',
      '0px 60px 120px rgba(0, 0, 0, 0.05)',
      '0px 64px 128px rgba(0, 0, 0, 0.05)',
      '0px 68px 136px rgba(0, 0, 0, 0.05)',
      '0px 72px 144px rgba(0, 0, 0, 0.05)',
      '0px 76px 152px rgba(0, 0, 0, 0.05)',
      '0px 80px 160px rgba(0, 0, 0, 0.05)',
      '0px 84px 168px rgba(0, 0, 0, 0.05)',
      '0px 88px 176px rgba(0, 0, 0, 0.05)',
      '0px 92px 184px rgba(0, 0, 0, 0.05)',
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: 'background-color 0.3s ease, color 0.3s ease',
            scrollBehavior: 'smooth',
          },
          '*::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: mode ? '#4b5563' : '#cbd5e1',
            borderRadius: '4px',
          },
          '*::-webkit-scrollbar-track': {
            backgroundColor: mode ? '#1e293b' : '#f1f5f9',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '10px 20px',
            boxShadow: 'none',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            },
          },
          contained: {
            '&:hover': {
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
            },
          },
          outlined: {
            borderWidth: '2px',
            '&:hover': {
              borderWidth: '2px',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: mode 
              ? '0 10px 30px rgba(0, 0, 0, 0.3)'
              : '0 10px 30px rgba(0, 0, 0, 0.08)',
            overflow: 'visible',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: mode 
                ? '0 20px 40px rgba(0, 0, 0, 0.4)'
                : '0 20px 40px rgba(0, 0, 0, 0.12)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            transition: 'all 0.3s ease',
          },
          elevation1: {
            boxShadow: mode 
              ? '0 4px 20px rgba(0, 0, 0, 0.2)'
              : '0 4px 20px rgba(0, 0, 0, 0.05)',
          },
          elevation2: {
            boxShadow: mode 
              ? '0 8px 30px rgba(0, 0, 0, 0.25)'
              : '0 8px 30px rgba(0, 0, 0, 0.08)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: mode 
              ? '0 4px 20px rgba(0, 0, 0, 0.3)'
              : '0 4px 20px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            backgroundColor: mode 
              ? 'rgba(15, 23, 42, 0.8)'
              : 'rgba(255, 255, 255, 0.8)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: mode 
              ? 'linear-gradient(to bottom, #0f172a, #1e293b)'
              : 'linear-gradient(to bottom, #ffffff, #f8fafc)',
            borderRight: 'none',
            boxShadow: mode 
              ? '4px 0 20px rgba(0, 0, 0, 0.3)'
              : '4px 0 20px rgba(0, 0, 0, 0.05)',
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '4px 8px',
            transition: 'all 0.2s ease',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            transition: 'all 0.2s ease',
            '&.Mui-selected': {
              backgroundColor: mode 
                ? 'rgba(59, 130, 246, 0.2)'
                : 'rgba(59, 130, 246, 0.1)',
              '&:hover': {
                backgroundColor: mode 
                  ? 'rgba(59, 130, 246, 0.3)'
                  : 'rgba(59, 130, 246, 0.2)',
              },
            },
            '&:hover': {
              backgroundColor: mode 
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.04)',
              transform: 'translateX(5px)',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              transition: 'all 0.2s ease',
              '&.Mui-focused': {
                boxShadow: mode 
                  ? '0 0 0 3px rgba(59, 130, 246, 0.3)'
                  : '0 0 0 3px rgba(59, 130, 246, 0.2)',
              },
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: mode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
          head: {
            fontWeight: 600,
            backgroundColor: mode ? '#1e293b' : '#f8fafc',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: 'background-color 0.2s ease',
            '&:hover': {
              backgroundColor: mode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: mode ? '#1e293b' : '#334155',
            color: '#ffffff',
            fontSize: '0.75rem',
            fontWeight: 500,
            borderRadius: 6,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            padding: '8px 12px',
          },
          arrow: {
            color: mode ? '#1e293b' : '#334155',
          },
        },
      },
    },
  });
};
