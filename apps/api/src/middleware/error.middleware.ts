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

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    console.error(`[AppError] ${req.method} ${req.path} → ${err.statusCode} ${err.message}`)
    return res.status(err.statusCode).json({ error: err.message })
  }

  if (err instanceof ZodError) {
    const issues = err.errors.map((e) => ({ path: e.path.join('.'), message: e.message }))
    console.error(`[ValidationError] ${req.method} ${req.path}`, JSON.stringify({ body: req.body, issues }, null, 2))
    return res.status(422).json({ error: 'Validation failed', issues })
  }

  console.error(`[UnhandledError] ${req.method} ${req.path}`, err)
  return res.status(500).json({ error: 'Internal server error' })
}
