import { Router } from 'express'
import { getProfile, updateProfile, getMyListings, saveToggle, getSaved } from './users.controller'
import { requireAuth } from '../../middleware/auth.middleware'

export const usersRouter = Router()

usersRouter.get('/me', requireAuth, getProfile)
usersRouter.patch('/me', requireAuth, updateProfile)
usersRouter.get('/me/listings', requireAuth, getMyListings)
usersRouter.get('/me/saved', requireAuth, getSaved)
usersRouter.post('/me/saved/:listingId', requireAuth, saveToggle)
