// Theme Constants for E-Commerce Application
// These constants work seamlessly with Tailwind CSS

export const COLORS = {
  // Primary Colors (Green Theme)
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Secondary Colors
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  // Success Colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Warning Colors
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Error/Danger Colors
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Neutral Colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Special Colors
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

export const SPACING = {
  // Spacing scale (in pixels)
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
  40: '160px',
  48: '192px',
  56: '224px',
  64: '256px',
};

export const BORDER_RADIUS = {
  none: '0px',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '24px',
  full: '9999px',
};

export const SHADOWS = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  outline: '0 0 0 3px rgba(34, 197, 94, 0.5)',
};

export const Z_INDEX = {
  auto: 'auto',
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  modal: '1040',
  popover: '1050',
  tooltip: '1060',
  toast: '1070',
};

export const TRANSITIONS = {
  none: 'none',
  all: 'all 0.15s ease-out',
  colors: 'color 0.15s ease-out, background-color 0.15s ease-out, border-color 0.15s ease-out',
  opacity: 'opacity 0.15s ease-out',
  transform: 'transform 0.15s ease-out',
  shadow: 'box-shadow 0.15s ease-out',
  fast: 'all 0.1s ease-out',
  slow: 'all 0.3s ease-out',
  bounce: 'all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

// Theme configuration object
export const THEME = {
  colors: COLORS,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  shadows: SHADOWS,
  zIndex: Z_INDEX,
  transitions: TRANSITIONS,

  // Extended theme properties
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Component specific themes
  components: {
    button: {
      primary: {
        backgroundColor: COLORS.primary[600],
        color: COLORS.white,
        hoverBackgroundColor: COLORS.primary[700],
      },
      secondary: {
        backgroundColor: COLORS.secondary[100],
        color: COLORS.secondary[800],
        hoverBackgroundColor: COLORS.secondary[200],
      },
      danger: {
        backgroundColor: COLORS.error[600],
        color: COLORS.white,
        hoverBackgroundColor: COLORS.error[700],
      },
    },

    input: {
      default: {
        borderColor: COLORS.gray[300],
        focusBorderColor: COLORS.primary[500],
        errorBorderColor: COLORS.error[500],
      },
    },

    card: {
      default: {
        backgroundColor: COLORS.white,
        borderColor: COLORS.gray[200],
        shadow: SHADOWS.md,
      },
    },
  },
};

export default THEME;
