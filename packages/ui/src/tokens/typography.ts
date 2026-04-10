/**
 * Mandi Design Tokens — Typography
 *
 * Two font stacks:
 * - sans: Latin/English (Inter)
 * - urdu: Noto Nastaliq Urdu — preloaded in Next.js for Urdu UI
 *
 * Urdu Nastaliq requires larger line-height (2+) due to the script's
 * vertical complexity.
 */
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    urdu: ['"Noto Nastaliq Urdu"', 'serif'],
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
    urdu: '2.2',   // Nastaliq script needs extra vertical space
  },
} as const
