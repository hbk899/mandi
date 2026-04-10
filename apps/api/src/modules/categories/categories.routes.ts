import { Router } from 'express'
import { getCategories, getCategory } from './categories.controller'

export const categoriesRouter: Router = Router()

categoriesRouter.get('/', getCategories)
categoriesRouter.get('/:slug', getCategory)
