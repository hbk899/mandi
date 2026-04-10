import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n'

export default createMiddleware({
  locales,
  defaultLocale,
  // Urdu is default — no prefix for Urdu, /en prefix for English
  localePrefix: 'as-needed',
})

export const config = {
  // Match all paths except static files, api routes, and _next
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
