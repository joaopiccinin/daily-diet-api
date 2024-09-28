import { FastifyInstance } from 'fastify'
import { $ref } from './meal.schema'
import {
  createMeal,
  deleteMeal,
  getMeal,
  getResume,
  listMeals,
  updateMeal,
} from './meal.controller'

export async function mealsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate)

  app.get('/', listMeals)

  app.get('/:id', getMeal)

  app.post(
    '/',
    {
      schema: {
        body: $ref('createAndUpdateMealSchema'),
        response: {
          201: $ref('createAndUpdateMealResponseSchema'),
        },
      },
    },
    createMeal,
  )

  app.put('/:id', updateMeal)

  app.delete('/:id', deleteMeal)

  app.get('/resume', getResume)
}
