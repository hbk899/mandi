import { Router } from 'express'
import { search } from './search.controller'

export const searchRouter = Router()

searchRouter.get('/', search)
