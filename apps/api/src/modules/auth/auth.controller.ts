import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../../lib/prisma'
import {
  signAccessToken,
  signRefreshToken,
  storeRefreshToken,
  invalidateRefreshToken,
  validateRefreshToken,
} from '../../lib/jwt'
import { AppError } from '../../middleware/error.middleware'
import { registerSchema, loginSchema } from '@mandi/validators'
import jwt from 'jsonwebtoken'

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const data = registerSchema.parse(req.body)

    const exists = await prisma.user.findFirst({
      where: {
        OR: [
          ...(data.phone ? [{ phone: data.phone }] : []),
          ...(data.email ? [{ email: data.email }] : []),
        ],
      },
    })
    if (exists) return next(new AppError(409, 'User already exists'))

    const passwordHash = await bcrypt.hash(data.password, 12)
    const user = await prisma.user.create({
      data: {
        name: data.name,
        phone: data.phone ?? null,
        email: data.email ?? null,
        passwordHash,
      },
      select: { id: true, name: true, email: true, phone: true, role: true },
    })

    const accessToken = signAccessToken({ userId: user.id, role: user.role })
    const refreshToken = signRefreshToken(user.id)
    await storeRefreshToken(user.id, refreshToken)

    res.status(201).json({ user, accessToken, refreshToken })
  } catch (err) {
    next(err)
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const data = loginSchema.parse(req.body)

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(data.identifier.includes('@') ? [{ email: data.identifier }] : []),
          { phone: data.identifier },
        ],
      },
    })
    if (!user) return next(new AppError(401, 'Invalid credentials'))

    const valid = await bcrypt.compare(data.password, user.passwordHash)
    if (!valid) return next(new AppError(401, 'Invalid credentials'))

    const accessToken = signAccessToken({ userId: user.id, role: user.role })
    const refreshToken = signRefreshToken(user.id)
    await storeRefreshToken(user.id, refreshToken)

    res.json({
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
      accessToken,
      refreshToken,
    })
  } catch (err) {
    next(err)
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) return next(new AppError(400, 'Refresh token required'))

    const payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as { userId: string }

    const valid = await validateRefreshToken(payload.userId, refreshToken)
    if (!valid) return next(new AppError(401, 'Invalid refresh token'))

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true },
    })
    if (!user) return next(new AppError(401, 'User not found'))

    const accessToken = signAccessToken({ userId: user.id, role: user.role })
    res.json({ accessToken })
  } catch (err) {
    // jwt.verify throws JsonWebTokenError / TokenExpiredError — map both to 401
    if (err instanceof Error && (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError')) {
      return next(new AppError(401, 'Invalid or expired token'))
    }
    next(err)
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    await invalidateRefreshToken(req.user!.userId)
    res.json({ message: 'Logged out' })
  } catch (err) {
    next(err)
  }
}
