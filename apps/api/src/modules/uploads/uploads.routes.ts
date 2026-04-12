import { Router } from 'express'
import { getSignedUploadUrl, deleteImage, attachImages } from './uploads.controller'
import { requireAuth } from '../../middleware/auth.middleware'

export const uploadsRouter: Router = Router()

uploadsRouter.get('/sign', requireAuth, getSignedUploadUrl)
uploadsRouter.delete('/:publicId', requireAuth, deleteImage)
uploadsRouter.post('/listings/:listingId/images', requireAuth, attachImages)
