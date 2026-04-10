/**
 * Mandi Design Tokens — Colors
 *
 * Edit this file to retheme the entire product.
 * These values are mapped to CSS custom properties and Tailwind theme extensions.
 *
 * Primary: Forest Green (agriculture / Pakistan cultural fit)
 * Secondary: Warm Amber (harvest)
 */

export const colors = {
  brand: {
    primary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',  // main brand green
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16',
    },
    secondary: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',  // main amber
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03',
    },
  },
  neutral: {
    0: '#ffffff',
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
    950: '#030712',
  },
  semantic: {
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
} as const

/**
 * CSS custom properties generated from the token set above.
 * Injected into :root in the web app's global CSS.
 */
export const cssVars = `
  --color-primary-50: ${colors.brand.primary[50]};
  --color-primary-100: ${colors.brand.primary[100]};
  --color-primary-500: ${colors.brand.primary[500]};
  --color-primary-600: ${colors.brand.primary[600]};
  --color-primary-700: ${colors.brand.primary[700]};
  --color-secondary-500: ${colors.brand.secondary[500]};
  --color-secondary-600: ${colors.brand.secondary[600]};
  --color-success: ${colors.semantic.success};
  --color-warning: ${colors.semantic.warning};
  --color-error: ${colors.semantic.error};
`
