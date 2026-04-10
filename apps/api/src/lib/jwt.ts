import jwt from 'jsonwebtoken'
import { redis } from './redis'

const ACCESS_TTL = 15 * 60 // 15 minutes
const REFRESH_TTL = 30 * 24 * 60 * 60 // 30 days

export function signAccessToken(payload: { userId: string; role: string }) {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: ACCESS_TTL })
}

export function signRefreshToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, { expiresIn: REFRESH_TTL })
}

export async function storeRefreshToken(userId: string, token: string) {
  await redis.set(`refresh:${userId}`, token, 'EX', REFRESH_TTL)
}

export async function invalidateRefreshToken(userId: string) {
  await redis.del(`refresh:${userId}`)
}

export async function validateRefreshToken(userId: string, token: string): Promise<boolean> {
  const stored = await redis.get(`refresh:${userId}`)
  return stored === token
}
