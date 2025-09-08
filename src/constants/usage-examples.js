// Usage Examples for Constants
// This file demonstrates how to use the constants across the application

import {
  COLORS,
  SPACING,
  TEXT_STYLES,
  BREAKPOINTS,
  RESPONSIVE_PATTERNS,
  APP_CONSTANTS,
  STATUS,
  ERROR_MESSAGES,
  API_ENDPOINTS
} from './index';

// =============================================================================
// 🎨 THEME USAGE EXAMPLES
// =============================================================================

// Using colors in components
export const ButtonStyles = {
  primary: {
    backgroundColor: COLORS.primary[600],
    color: COLORS.white,
    padding: `${SPACING[3]} ${SPACING[6]}`,
    borderRadius: '6px',
    fontWeight: '500',
    transition: 'all 0.2s ease',

    '&:hover': {
      backgroundColor: COLORS.primary[700],
    },

    '&:focus': {
      outline: 'none',
      boxShadow: `0 0 0 3px ${COLORS.primary[200]}`,
    },
  },

  secondary: {
    backgroundColor: COLORS.white,
    color: COLORS.gray[800],
    border: `1px solid ${COLORS.gray[300]}`,
    padding: `${SPACING[3]} ${SPACING[6]}`,

    '&:hover': {
      backgroundColor: COLORS.gray[50],
      borderColor: COLORS.gray[400],
    },
  },

  danger: {
    backgroundColor: COLORS.error[600],
    color: COLORS.white,

    '&:hover': {
      backgroundColor: COLORS.error[700],
    },
  },
};

// Using spacing in layouts
export const CardStyles = {
  container: {
    padding: SPACING[6],
    margin: SPACING[4],
    borderRadius: '8px',
    backgroundColor: COLORS.white,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },

  header: {
    marginBottom: SPACING[4],
    paddingBottom: SPACING[3],
    borderBottom: `1px solid ${COLORS.gray[200]}`,
  },

  content: {
    marginBottom: SPACING[6],
  },

  footer: {
    paddingTop: SPACING[4],
    borderTop: `1px solid ${COLORS.gray[200]}`,
  },
};

// =============================================================================
// 📝 TYPOGRAPHY USAGE EXAMPLES
// =============================================================================

// Using text styles in components
export const TypographyExamples = {
  // Headings
  pageTitle: {
    ...TEXT_STYLES.h1,
    color: COLORS.gray[900],
    marginBottom: SPACING[6],
  },

  sectionTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.gray[800],
    marginBottom: SPACING[4],
  },

  cardTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.gray[900],
    marginBottom: SPACING[2],
  },

  // Body text
  bodyText: {
    ...TEXT_STYLES.body,
    color: COLORS.gray[700],
    lineHeight: '1.7',
  },

  caption: {
    ...TEXT_STYLES.caption,
    color: COLORS.gray[500],
    fontSize: '0.8125rem',
  },

  // Interactive elements
  link: {
    ...TEXT_STYLES.link,
    color: COLORS.primary[600],

    '&:hover': {
      color: COLORS.primary[700],
    },
  },

  button: {
    ...TEXT_STYLES.buttonPrimary,
    color: COLORS.white,
    backgroundColor: COLORS.primary[600],
  },

  // Status messages
  error: {
    ...TEXT_STYLES.error,
    backgroundColor: COLORS.error[50],
    padding: `${SPACING[2]} ${SPACING[3]}`,
    borderRadius: '4px',
    border: `1px solid ${COLORS.error[200]}`,
  },

  success: {
    ...TEXT_STYLES.success,
    backgroundColor: COLORS.success[50],
    padding: `${SPACING[2]} ${SPACING[3]}`,
    borderRadius: '4px',
    border: `1px solid ${COLORS.success[200]}`,
  },

  // Product pricing
  price: {
    ...TEXT_STYLES.price,
    color: COLORS.primary[600],
  },

  originalPrice: {
    ...TEXT_STYLES.priceSmall,
    color: COLORS.gray[500],
    textDecoration: 'line-through',
    marginRight: SPACING[2],
  },
};

// =============================================================================
// 📱 RESPONSIVE USAGE EXAMPLES
// =============================================================================

// Using responsive breakpoints in components
export const ResponsiveLayout = {
  container: {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: `0 ${SPACING[4]}`,

    [`@media (min-width: ${BREAKPOINTS.sm})`]: {
      padding: `0 ${SPACING[6]}`,
    },

    [`@media (min-width: ${BREAKPOINTS.lg})`]: {
      padding: `0 ${SPACING[8]}`,
    },
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: SPACING[4],

    [`@media (min-width: ${BREAKPOINTS.sm})`]: {
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: SPACING[6],
    },

    [`@media (min-width: ${BREAKPOINTS.md})`]: {
      gridTemplateColumns: 'repeat(3, 1fr)',
    },

    [`@media (min-width: ${BREAKPOINTS.lg})`]: {
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: SPACING[8],
    },
  },

  flex: {
    display: 'flex',
    flexDirection: 'column',
    gap: SPACING[4],

    [`@media (min-width: ${BREAKPOINTS.md})`]: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  },
};

// Using responsive patterns
export const ResponsiveCard = {
  ...RESPONSIVE_PATTERNS.card,

  // Custom responsive behavior
  image: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',

    [`@media (min-width: ${BREAKPOINTS.md})`]: {
      height: '250px',
    },
  },

  content: {
    padding: SPACING[4],

    [`@media (min-width: ${BREAKPOINTS.sm})`]: {
      padding: SPACING[6],
    },
  },
};

// =============================================================================
// ⚙️ APPLICATION CONSTANTS USAGE EXAMPLES
// =============================================================================

// Using app constants
export const API_CONFIG = {
  baseURL: APP_CONSTANTS.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.REACT_APP_API_KEY,
  },
};

// Using status constants
export const ORDER_STATUS_CONFIG = {
  [STATUS.ORDER_STATUS.PENDING]: {
    label: 'Pending',
    color: COLORS.warning[600],
    backgroundColor: COLORS.warning[50],
  },
  [STATUS.ORDER_STATUS.CONFIRMED]: {
    label: 'Confirmed',
    color: COLORS.primary[600],
    backgroundColor: COLORS.primary[50],
  },
  [STATUS.ORDER_STATUS.SHIPPED]: {
    label: 'Shipped',
    color: COLORS.success[600],
    backgroundColor: COLORS.success[50],
  },
  [STATUS.ORDER_STATUS.DELIVERED]: {
    label: 'Delivered',
    color: COLORS.success[700],
    backgroundColor: COLORS.success[100],
  },
};

// Using error messages
export const FORM_VALIDATION = {
  required: ERROR_MESSAGES.REQUIRED_FIELD,
  email: ERROR_MESSAGES.INVALID_EMAIL,
  password: ERROR_MESSAGES.PASSWORD_TOO_SHORT,
  fileSize: ERROR_MESSAGES.FILE_TOO_LARGE,
};

// Using API endpoints
export const apiRequests = {
  getProducts: () => `${API_CONFIG.baseURL}${API_ENDPOINTS.PRODUCTS.LIST}`,
  getProduct: (id) => `${API_CONFIG.baseURL}${API_ENDPOINTS.PRODUCTS.DETAIL.replace(':id', id)}`,
  login: () => `${API_CONFIG.baseURL}${API_ENDPOINTS.AUTH.LOGIN}`,
  getCart: () => `${API_CONFIG.baseURL}${API_ENDPOINTS.CART.GET}`,
  placeOrder: () => `${API_CONFIG.baseURL}${API_ENDPOINTS.ORDERS.CREATE}`,
};

// =============================================================================
// 🧩 REACT COMPONENT USAGE EXAMPLES
// =============================================================================

// Example of using constants in a React component
import React from 'react';
import { COLORS, SPACING, TEXT_STYLES } from '../constants';

export const ProductCard = ({ product }) => {
  const cardStyle = {
    backgroundColor: COLORS.white,
    borderRadius: '8px',
    padding: SPACING[4],
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    border: `1px solid ${COLORS.primary[100]}`,

    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 8px 25px ${COLORS.primary[100]}`,
      borderColor: COLORS.primary[200],
    },
  };

  const titleStyle = {
    ...TEXT_STYLES.h4,
    color: COLORS.gray[900],
    marginBottom: SPACING[2],
  };

  const priceStyle = {
    ...TEXT_STYLES.price,
    color: COLORS.primary[600], // Now uses green instead of blue
  };

  return (
    <div style={cardStyle}>
      <img
        src={product.image}
        alt={product.name}
        style={{
          width: '100%',
          height: '200px',
          objectFit: 'cover',
          borderRadius: '4px',
          marginBottom: SPACING[3],
          border: `1px solid ${COLORS.primary[50]}`,
        }}
      />
      <h3 style={titleStyle}>{product.name}</h3>
      <p style={priceStyle}>${product.price}</p>
      <button
        style={{
          backgroundColor: COLORS.primary[600],
          color: COLORS.white,
          padding: `${SPACING[2]} ${SPACING[4]}`,
          borderRadius: '6px',
          border: 'none',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease',
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = COLORS.primary[700]}
        onMouseOut={(e) => e.target.style.backgroundColor = COLORS.primary[600]}
      >
        Add to Cart
      </button>
    </div>
  );
};

// Example of responsive component
export const ResponsiveGrid = ({ children }) => {
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: SPACING[4],
    width: '100%',

    [`@media (min-width: ${BREAKPOINTS.sm})`]: {
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: SPACING[6],
    },

    [`@media (min-width: ${BREAKPOINTS.md})`]: {
      gridTemplateColumns: 'repeat(3, 1fr)',
    },

    [`@media (min-width: ${BREAKPOINTS.lg})`]: {
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: SPACING[8],
    },
  };

  return <div style={gridStyle}>{children}</div>;
};

// =============================================================================
// 🎨 TAILWIND CSS INTEGRATION EXAMPLES
// =============================================================================

// Using constants with Tailwind CSS classes
export const TailwindIntegration = {
  // Color classes
  primaryButton: `bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg`,
  secondaryButton: `bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-lg`,

  // Spacing classes
  card: `p-4 md:p-6 lg:p-8 m-4 rounded-lg shadow-md`,
  container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`,

  // Typography classes
  heading: `text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight`,
  body: `text-base text-gray-700 leading-relaxed`,
  caption: `text-sm text-gray-500`,

  // Responsive classes
  responsiveGrid: `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8`,
  responsiveFlex: `flex flex-col md:flex-row items-start md:items-center gap-4`,
};

// =============================================================================
// 🔧 UTILITY FUNCTIONS USING CONSTANTS
// =============================================================================

// Utility function for creating responsive styles
export const createResponsiveStyle = (property, values) => {
  const style = {};

  Object.entries(values).forEach(([breakpoint, value]) => {
    if (breakpoint === 'default') {
      style[property] = value;
    } else {
      style[`@media (min-width: ${BREAKPOINTS[breakpoint]})`] = {
        [property]: value,
      };
    }
  });

  return style;
};

// Utility function for status styling
export const getStatusStyle = (status) => {
  const statusConfig = ORDER_STATUS_CONFIG[status];
  return {
    color: statusConfig.color,
    backgroundColor: statusConfig.backgroundColor,
    padding: `${SPACING[1]} ${SPACING[2]}`,
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };
};

// Utility function for error styling
export const getErrorStyle = (hasError) => {
  if (!hasError) return {};

  return {
    borderColor: COLORS.error[500],
    boxShadow: `0 0 0 1px ${COLORS.error[500]}`,
  };
};

// Export all examples
export const USAGE_EXAMPLES = {
  ButtonStyles,
  CardStyles,
  TypographyExamples,
  ResponsiveLayout,
  ResponsiveCard,
  API_CONFIG,
  ORDER_STATUS_CONFIG,
  FORM_VALIDATION,
  apiRequests,
  TailwindIntegration,
  createResponsiveStyle,
  getStatusStyle,
  getErrorStyle,
};
