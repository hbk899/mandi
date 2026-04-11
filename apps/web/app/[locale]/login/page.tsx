'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { useAuth } from '../../../lib/auth'

export default function LoginPage() {
  const locale = useLocale()
  const isUr = locale === 'ur'
  const router = useRouter()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      router.push('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : isUr ? 'ای میل یا پاس ورڈ غلط ہے' : 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-urdu text-primary-700">منڈی</h1>
          <p className="text-neutral-500 text-sm mt-1">{isUr ? 'اپنے اکاؤنٹ میں داخل ہوں' : 'Sign in to your account'}</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                {isUr ? 'ای میل' : 'Email'}
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                {isUr ? 'پاس ورڈ' : 'Password'}
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-error-600 bg-error-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-60"
            >
              {loading ? '...' : isUr ? 'داخل ہوں' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-neutral-500 mt-4">
            {isUr ? 'اکاؤنٹ نہیں؟' : "Don't have an account?"}{' '}
            <Link href="/register" className="text-primary-600 font-medium hover:underline">
              {isUr ? 'رجسٹر کریں' : 'Register'}
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
