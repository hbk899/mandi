'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { api } from './api'

interface User {
  id: string
  name: string
  email: string
  phone: string
  role: string
  profileImageUrl: string | null
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  isLoggedIn: boolean
}

interface RegisterData {
  name: string
  email: string
  phone: string
  password: string
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, token: null, isLoading: true })

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('mandi_token')
    if (!token) { setState(s => ({ ...s, isLoading: false })); return }

    api.get<User>('/users/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(user => setState({ user, token, isLoading: false }))
      .catch(() => { localStorage.removeItem('mandi_token'); setState({ user: null, token: null, isLoading: false }) })
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ user: User; accessToken: string }>('/auth/login', { identifier: email, password })
    localStorage.setItem('mandi_token', res.accessToken)
    setState({ user: res.user, token: res.accessToken, isLoading: false })
  }, [])

  const register = useCallback(async (data: RegisterData) => {
    const res = await api.post<{ user: User; accessToken: string }>('/auth/register', data)
    localStorage.setItem('mandi_token', res.accessToken)
    setState({ user: res.user, token: res.accessToken, isLoading: false })
  }, [])

  const logout = useCallback(async () => {
    const token = localStorage.getItem('mandi_token')
    if (token) await api.post('/auth/logout', {}, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {})
    localStorage.removeItem('mandi_token')
    setState({ user: null, token: null, isLoading: false })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, isLoggedIn: !!state.user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
