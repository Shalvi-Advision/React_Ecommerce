// Responsive Constants for E-Commerce Application
// Breakpoints, container sizes, and responsive utilities

export const BREAKPOINTS = {
  // Mobile First Breakpoints (in pixels)
  xs: '475px',     // Extra small devices
  sm: '640px',     // Small devices (phones)
  md: '768px',     // Medium devices (tablets)
  lg: '1024px',    // Large devices (small laptops)
  xl: '1280px',    // Extra large devices (desktops)
  '2xl': '1536px', // 2X large devices (large desktops)

  // Named breakpoints for better readability
  mobile: '640px',
  tablet: '768px',
  laptop: '1024px',
  desktop: '1280px',
  'desktop-lg': '1536px',
};

export const CONTAINER_SIZES = {
  // Container max-widths for different breakpoints
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  full: '100%',
};

export const SPACING_RESPONSIVE = {
  // Responsive spacing scale
  'space-xs': {
    default: '8px',
    sm: '12px',
    md: '16px',
    lg: '20px',
  },
  'space-sm': {
    default: '12px',
    sm: '16px',
    md: '20px',
    lg: '24px',
  },
  'space-md': {
    default: '16px',
    sm: '20px',
    md: '24px',
    lg: '32px',
  },
  'space-lg': {
    default: '24px',
    sm: '32px',
    md: '40px',
    lg: '48px',
  },
  'space-xl': {
    default: '32px',
    sm: '40px',
    md: '48px',
    lg: '64px',
  },
  'space-2xl': {
    default: '48px',
    sm: '64px',
    md: '80px',
    lg: '96px',
  },
};

export const GRID_COLUMNS = {
  // CSS Grid columns for different breakpoints
  default: 1,
  sm: 2,
  md: 3,
  lg: 4,
  xl: 5,
  '2xl': 6,
};

export const FLEX_DIRECTIONS = {
  // Responsive flex directions
  column: {
    default: 'column',
    md: 'row',
  },
  'column-reverse': {
    default: 'column-reverse',
    md: 'row-reverse',
  },
};

export const TEXT_SIZES_RESPONSIVE = {
  // Responsive text sizes
  heading: {
    default: '1.5rem', // 24px
    sm: '2rem',        // 32px
    md: '2.5rem',      // 40px
    lg: '3rem',        // 48px
  },
  subheading: {
    default: '1.125rem', // 18px
    sm: '1.25rem',       // 20px
    md: '1.5rem',        // 24px
    lg: '1.875rem',      // 30px
  },
  body: {
    default: '0.875rem', // 14px
    sm: '1rem',          // 16px
  },
  caption: {
    default: '0.75rem',  // 12px
    sm: '0.875rem',      // 14px
  },
};

// Media query helpers
export const MEDIA_QUERIES = {
  xs: `(min-width: ${BREAKPOINTS.xs})`,
  sm: `(min-width: ${BREAKPOINTS.sm})`,
  md: `(min-width: ${BREAKPOINTS.md})`,
  lg: `(min-width: ${BREAKPOINTS.lg})`,
  xl: `(min-width: ${BREAKPOINTS.xl})`,
  '2xl': `(min-width: ${BREAKPOINTS['2xl']})`,

  // Mobile-first approach
  mobile: `(max-width: ${BREAKPOINTS.sm})`,
  tablet: `(min-width: ${BREAKPOINTS.sm}) and (max-width: ${BREAKPOINTS.lg})`,
  desktop: `(min-width: ${BREAKPOINTS.lg})`,

  // Orientation
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',

  // Touch devices
  touch: '(hover: none) and (pointer: coarse)',
  mouse: '(hover: hover) and (pointer: fine)',

  // High DPI displays
  retina: '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',
};

// Common responsive patterns
export const RESPONSIVE_PATTERNS = {
  // Hide/show elements
  hidden: {
    default: 'block',
    md: 'none',
  },
  'hidden-md': {
    default: 'none',
    md: 'block',
  },

  // Grid layouts
  grid: {
    default: 'grid-cols-1',
    sm: 'grid-cols-2',
    md: 'grid-cols-3',
    lg: 'grid-cols-4',
  },

  // Flex layouts
  flex: {
    default: 'flex-col',
    md: 'flex-row',
  },

  // Text alignment
  textAlign: {
    default: 'text-left',
    md: 'text-center',
  },

  // Padding patterns
  padding: {
    default: 'p-4',
    sm: 'p-6',
    md: 'p-8',
  },

  // Margin patterns
  margin: {
    default: 'm-4',
    sm: 'm-6',
    md: 'm-8',
  },
};

// Device-specific constants
export const DEVICES = {
  mobile: {
    maxWidth: '640px',
    padding: '16px',
    fontSize: '14px',
  },
  tablet: {
    minWidth: '641px',
    maxWidth: '1024px',
    padding: '24px',
    fontSize: '16px',
  },
  desktop: {
    minWidth: '1025px',
    padding: '32px',
    fontSize: '16px',
  },
};

// Component-specific responsive configurations
export const COMPONENT_RESPONSIVE = {
  // Header
  header: {
    height: {
      default: '64px',
      md: '80px',
    },
    logo: {
      size: {
        default: '32px',
        md: '40px',
      },
    },
  },

  // Navigation
  nav: {
    item: {
      padding: {
        default: '8px 12px',
        md: '12px 16px',
      },
    },
  },

  // Cards
  card: {
    padding: {
      default: '16px',
      sm: '20px',
      md: '24px',
    },
    margin: {
      default: '8px',
      sm: '12px',
      md: '16px',
    },
  },

  // Buttons
  button: {
    size: {
      default: 'sm',
      sm: 'md',
      lg: 'lg',
    },
    padding: {
      default: '8px 16px',
      sm: '12px 20px',
      lg: '16px 24px',
    },
  },

  // Forms
  form: {
    input: {
      width: {
        default: '100%',
        sm: 'auto',
      },
    },
    label: {
      display: {
        default: 'block',
        sm: 'inline-block',
      },
    },
  },

  // Modals
  modal: {
    width: {
      default: '95vw',
      sm: '85vw',
      md: '75vw',
      lg: '50vw',
      xl: '40vw',
    },
    padding: {
      default: '16px',
      sm: '24px',
      md: '32px',
    },
  },

  // Tables
  table: {
    fontSize: {
      default: '12px',
      sm: '14px',
    },
    padding: {
      default: '8px',
      sm: '12px',
    },
  },
};

// Utility functions for responsive design
export const getResponsiveValue = (values, breakpoint = 'default') => {
  return values[breakpoint] || values.default || values;
};

export const createResponsiveClass = (baseClass, responsiveConfig) => {
  let classes = baseClass;

  Object.entries(responsiveConfig).forEach(([breakpoint, value]) => {
    if (breakpoint === 'default') {
      classes += ` ${value}`;
    } else {
      classes += ` ${breakpoint}:${value}`;
    }
  });

  return classes.trim();
};

// Screen size detection utilities
export const SCREEN_SIZES = {
  isMobile: () => window.innerWidth < parseInt(BREAKPOINTS.sm),
  isTablet: () => window.innerWidth >= parseInt(BREAKPOINTS.sm) && window.innerWidth < parseInt(BREAKPOINTS.lg),
  isDesktop: () => window.innerWidth >= parseInt(BREAKPOINTS.lg),
  isLargeDesktop: () => window.innerWidth >= parseInt(BREAKPOINTS.xl),

  getCurrentBreakpoint: () => {
    const width = window.innerWidth;
    if (width < parseInt(BREAKPOINTS.sm)) return 'mobile';
    if (width < parseInt(BREAKPOINTS.md)) return 'tablet';
    if (width < parseInt(BREAKPOINTS.lg)) return 'small-desktop';
    if (width < parseInt(BREAKPOINTS.xl)) return 'desktop';
    return 'large-desktop';
  },
};

// Responsive design patterns
export const RESPONSIVE_DESIGN_PATTERNS = {
  // Mobile-first grid
  gridAutoFit: (minWidth) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}, 1fr))`,
  }),

  // Container query pattern
  containerQuery: (maxWidth) => ({
    maxWidth: maxWidth,
    margin: '0 auto',
    padding: '0 16px',
  }),

  // Fluid typography
  fluidTypography: (minSize, maxSize, minWidth, maxWidth) => ({
    fontSize: `clamp(${minSize}, ${minSize} + (${maxSize} - ${minSize}) * ((100vw - ${minWidth}) / (${maxWidth} - ${minWidth})), ${maxSize})`,
  }),
};

// Responsive configuration object
export const RESPONSIVE = {
  breakpoints: BREAKPOINTS,
  containerSizes: CONTAINER_SIZES,
  spacing: SPACING_RESPONSIVE,
  gridColumns: GRID_COLUMNS,
  flexDirections: FLEX_DIRECTIONS,
  textSizes: TEXT_SIZES_RESPONSIVE,
  mediaQueries: MEDIA_QUERIES,
  patterns: RESPONSIVE_PATTERNS,
  devices: DEVICES,
  components: COMPONENT_RESPONSIVE,
  utilities: {
    getResponsiveValue,
    createResponsiveClass,
    screenSizes: SCREEN_SIZES,
    designPatterns: RESPONSIVE_DESIGN_PATTERNS,
  },
};

export default RESPONSIVE;
