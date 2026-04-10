import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import bcrypt from 'bcryptjs'
import app from '../app'
import { prisma } from '../lib/prisma'
import { redis } from '../lib/redis'

const mockPrismaUser = prisma.user as Record<string, ReturnType<typeof vi.fn>>
const mockRedis = redis as unknown as Record<string, ReturnType<typeof vi.fn>>

const testUser = {
  id: 'cltest123456789',
  name: 'Test User',
  phone: '03001234567',
  email: 'test@example.com',
  passwordHash: '',
  role: 'user',
}

beforeEach(async () => {
  testUser.passwordHash = await bcrypt.hash('password123', 10)
})

describe('POST /api/v1/auth/register', () => {
  it('creates a new user with phone', async () => {
    mockPrismaUser.findFirst.mockResolvedValue(null)
    mockPrismaUser.create.mockResolvedValue({
      id: 'cltest123456789',
      name: 'Ali Hassan',
      email: null,
      phone: '03001234567',
      role: 'user',
    })
    mockRedis.set.mockResolvedValue('OK')

    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Ali Hassan',
      phone: '03001234567',
      password: 'password123',
    })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('accessToken')
    expect(res.body).toHaveProperty('refreshToken')
    expect(res.body.user.name).toBe('Ali Hassan')
  })

  it('creates a new user with email', async () => {
    mockPrismaUser.findFirst.mockResolvedValue(null)
    mockPrismaUser.create.mockResolvedValue({
      id: 'cltest123456789',
      name: 'Ali Hassan',
      email: 'ali@example.com',
      phone: null,
      role: 'user',
    })

    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Ali Hassan',
      email: 'ali@example.com',
      password: 'password123',
    })

    expect(res.status).toBe(201)
    expect(res.body.user.email).toBe('ali@example.com')
  })

  it('returns 409 when user already exists', async () => {
    mockPrismaUser.findFirst.mockResolvedValue(testUser)

    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Ali Hassan',
      phone: '03001234567',
      password: 'password123',
    })

    expect(res.status).toBe(409)
    expect(res.body.error).toBe('User already exists')
  })

  it('returns 422 on missing name', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      phone: '03001234567',
      password: 'password123',
    })

    expect(res.status).toBe(422)
    expect(res.body).toHaveProperty('issues')
  })

  it('returns 422 on invalid phone format', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Ali Hassan',
      phone: '12345',
      password: 'password123',
    })

    expect(res.status).toBe(422)
  })

  it('returns 422 when neither phone nor email provided', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Ali Hassan',
      password: 'password123',
    })

    expect(res.status).toBe(422)
  })

  it('returns 422 on short password', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Ali Hassan',
      phone: '03001234567',
      password: 'short',
    })

    expect(res.status).toBe(422)
  })
})

describe('POST /api/v1/auth/login', () => {
  it('returns tokens on valid credentials', async () => {
    mockPrismaUser.findFirst.mockResolvedValue(testUser)

    const res = await request(app).post('/api/v1/auth/login').send({
      identifier: '03001234567',
      password: 'password123',
    })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('accessToken')
    expect(res.body).toHaveProperty('refreshToken')
    expect(res.body.user).toMatchObject({ id: testUser.id, name: testUser.name })
  })

  it('returns tokens when logging in with email', async () => {
    mockPrismaUser.findFirst.mockResolvedValue(testUser)

    const res = await request(app).post('/api/v1/auth/login').send({
      identifier: 'test@example.com',
      password: 'password123',
    })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('accessToken')
  })

  it('returns 401 when user not found', async () => {
    mockPrismaUser.findFirst.mockResolvedValue(null)

    const res = await request(app).post('/api/v1/auth/login').send({
      identifier: '03009999999',
      password: 'password123',
    })

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Invalid credentials')
  })

  it('returns 401 on wrong password', async () => {
    mockPrismaUser.findFirst.mockResolvedValue(testUser)

    const res = await request(app).post('/api/v1/auth/login').send({
      identifier: '03001234567',
      password: 'wrongpassword',
    })

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Invalid credentials')
  })

  it('returns 422 on empty body', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({})
    expect(res.status).toBe(422)
  })
})

describe('POST /api/v1/auth/refresh', () => {
  it('returns 400 when no refreshToken provided', async () => {
    const res = await request(app).post('/api/v1/auth/refresh').send({})
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Refresh token required')
  })

  it('returns 401 on invalid/expired refresh token', async () => {
    const res = await request(app).post('/api/v1/auth/refresh').send({
      refreshToken: 'not.a.valid.jwt',
    })
    expect(res.status).toBe(401)
  })
})

describe('POST /api/v1/auth/logout', () => {
  it('returns 401 without Authorization header', async () => {
    const res = await request(app).post('/api/v1/auth/logout')
    expect(res.status).toBe(401)
  })
})
