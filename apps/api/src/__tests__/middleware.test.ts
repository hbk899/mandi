import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../app'

describe('Health check', () => {
  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body).toHaveProperty('timestamp')
  })
})

describe('404 handler', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/v1/does-not-exist')
    expect(res.status).toBe(404)
    expect(res.body).toHaveProperty('error')
  })

  it('includes the method and path in the error message', async () => {
    const res = await request(app).get('/api/v1/no-such-route')
    expect(res.body.error).toMatch(/GET/)
    expect(res.body.error).toMatch(/no-such-route/)
  })

  it('handles POST to unknown route', async () => {
    const res = await request(app).post('/api/v1/unknown')
    expect(res.status).toBe(404)
  })
})

describe('Auth middleware', () => {
  it('returns 401 when Authorization header is missing', async () => {
    const res = await request(app).post('/api/v1/auth/logout')
    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Unauthorized')
  })

  it('returns 401 when token is malformed', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', 'Bearer not.a.real.token')
    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Invalid or expired token')
  })

  it('returns 401 when Bearer prefix is missing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', 'some-token-without-bearer')
    expect(res.status).toBe(401)
  })
})
