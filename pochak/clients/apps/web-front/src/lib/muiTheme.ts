import { createTheme } from '@mui/material/styles';

/**
 * Pochak MUI Theme — M3 inspired dark sports OTT theme
 * 기존 Tailwind 디자인 토큰과 동기화
 */
const pochakTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#10b95c',
      light: '#42d67f',
      dark: '#0d8d47',
      contrastText: '#08110c',
    },
    secondary: {
      main: '#202020',
      contrastText: '#F0F0F0',
    },
    error: {
      main: '#FF1744',
    },
    warning: {
      main: '#FFAB00',
    },
    info: {
      main: '#448AFF',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#F0F0F0',
      secondary: '#8A8A8A',
      disabled: '#555555',
    },
    divider: 'rgba(255,255,255,0.08)',
    action: {
      hover: 'rgba(255,255,255,0.06)',
      selected: 'rgba(16,185,92,0.12)',
      disabledBackground: 'rgba(255,255,255,0.04)',
    },
  },
  typography: {
    fontFamily: '"Pretendard", "Pretendard Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: 'inherit',
          fontWeight: 500,
          letterSpacing: '-0.01em',
          borderRadius: 9999,
          transition: 'all 0.15s ease',
        },
        sizeSmall: {
          height: 28,
          fontSize: '12px',
        },
        sizeMedium: {
          height: 32,
          fontSize: '13px',
        },
        /* ── Filled (selected) ── */
        filled: {
          '&.MuiChip-colorPrimary': {
            backgroundColor: 'rgba(16,185,92,0.15)',
            color: '#42d67f',
            border: '1px solid rgba(16,185,92,0.3)',
            '&:hover': {
              backgroundColor: 'rgba(16,185,92,0.22)',
            },
          },
          '&.MuiChip-colorDefault': {
            backgroundColor: '#242424',
            color: '#F0F0F0',
            border: '1px solid rgba(255,255,255,0.1)',
            '&:hover': {
              backgroundColor: '#2c2c2c',
            },
          },
          '&.MuiChip-colorError': {
            backgroundColor: 'rgba(255,23,68,0.12)',
            color: '#ff8da2',
            border: '1px solid rgba(255,23,68,0.25)',
          },
          '&.MuiChip-colorWarning': {
            backgroundColor: 'rgba(255,171,0,0.12)',
            color: '#ffc85a',
            border: '1px solid rgba(255,171,0,0.25)',
          },
        },
        /* ── Outlined (unselected / filter default) ── */
        outlined: {
          borderColor: 'rgba(255,255,255,0.1)',
          color: '#8A8A8A',
          '&:hover': {
            borderColor: 'rgba(255,255,255,0.2)',
            backgroundColor: 'rgba(255,255,255,0.04)',
            color: '#F0F0F0',
          },
        },
        /* ── Delete icon ── */
        deleteIcon: {
          color: 'rgba(255,255,255,0.4)',
          '&:hover': {
            color: 'rgba(255,255,255,0.7)',
          },
        },
        icon: {
          fontSize: 16,
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          fontFamily: 'inherit',
          fontWeight: 500,
          fontSize: '13px',
          letterSpacing: '-0.01em',
          textTransform: 'none',
          borderRadius: 9999,
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#8A8A8A',
          padding: '4px 14px',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderColor: 'rgba(255,255,255,0.2)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(16,185,92,0.15)',
            color: '#42d67f',
            borderColor: 'rgba(16,185,92,0.3)',
            '&:hover': {
              backgroundColor: 'rgba(16,185,92,0.22)',
            },
          },
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          gap: 6,
        },
        grouped: {
          borderRadius: '9999px !important',
          border: '1px solid rgba(255,255,255,0.1) !important',
          '&:not(:first-of-type)': {
            marginLeft: 0,
          },
        },
      },
    },
  },
});

export default pochakTheme;
