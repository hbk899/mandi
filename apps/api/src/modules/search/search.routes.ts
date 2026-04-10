import { Router } from 'express'
import { search } from './search.controller'

export const searchRouter: Router = Router()

searchRouter.get('/', search)
