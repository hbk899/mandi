import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message })
  }

  if (err instanceof ZodError) {
    return res.status(422).json({
      error: 'Validation failed',
      issues: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
    })
  }

  console.error(err)
  return res.status(500).json({ error: 'Internal server error' })
}
