// Root layout — next-intl middleware handles locale detection and redirect.
// All actual UI lives in app/[locale]/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
