import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import morgan from 'morgan'
import { rateLimit } from 'express-rate-limit'

import { authRouter } from './modules/auth/auth.routes'
import { listingsRouter } from './modules/listings/listings.routes'
import { categoriesRouter } from './modules/categories/categories.routes'
import { usersRouter } from './modules/users/users.routes'
import { searchRouter } from './modules/search/search.routes'
import { uploadsRouter } from './modules/uploads/uploads.routes'
import { errorHandler } from './middleware/error.middleware'
import { notFound } from './middleware/notFound.middleware'

const app = express()

// Security & utility middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
  })
)
app.use(compression())
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Global rate limiter
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
)

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API routes
const v1 = express.Router()
v1.use('/auth', authRouter)
v1.use('/listings', listingsRouter)
v1.use('/categories', categoriesRouter)
v1.use('/users', usersRouter)
v1.use('/search', searchRouter)
v1.use('/uploads', uploadsRouter)

app.use('/api/v1', v1)

// Error handling (must be last)
app.use(notFound)
app.use(errorHandler)

export default app
