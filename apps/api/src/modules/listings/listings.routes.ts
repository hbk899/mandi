import { Router } from 'express'
import {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  markSold,
} from './listings.controller'
import { requireAuth } from '../../middleware/auth.middleware'

export const listingsRouter: Router = Router()

listingsRouter.get('/', getListings)
listingsRouter.get('/:id', getListing)
listingsRouter.post('/', requireAuth, createListing)
listingsRouter.patch('/:id', requireAuth, updateListing)
listingsRouter.delete('/:id', requireAuth, deleteListing)
listingsRouter.post('/:id/sold', requireAuth, markSold)
