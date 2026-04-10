import type { Config } from 'tailwindcss'
import { colors, typography, spacing, borderRadius, shadows, breakpoints } from '@mandi/ui/tokens'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  // RTL support: Tailwind's rtl: variant handles direction-aware utilities
  // Set dir="rtl" on <html> when Urdu locale is active
  theme: {
    screens: breakpoints,
    extend: {
      colors: {
        primary: colors.brand.primary,
        secondary: colors.brand.secondary,
        neutral: colors.neutral,
        success: colors.semantic.success,
        warning: colors.semantic.warning,
        error: colors.semantic.error,
      },
      fontFamily: {
        sans: typography.fontFamily.sans,
        urdu: typography.fontFamily.urdu,
      },
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      lineHeight: {
        ...typography.lineHeight,
      },
      spacing: spacing,
      borderRadius: borderRadius,
      boxShadow: shadows,
    },
  },
  plugins: [],
}

export default config
