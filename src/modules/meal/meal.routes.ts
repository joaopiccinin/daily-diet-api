import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../../database'
import { z } from 'zod'
import { $ref, CreateAndUpdateMealInput } from './meal.schema'

export async function mealsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [app.authenticate],
    },
    async (req, res) => {
      const meals = await knex('meals').select('*')

      res.status(200).send({ meals })
    },
  )

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
    async (
      res: FastifyReply,
      req: FastifyRequest<{
        Body: CreateAndUpdateMealInput
      }>,
    ) => {
      const result = mealsBodySchema.safeParse(req.body)

      if (!result.success) {
        const errors = result.error.errors.map((err) => ({
          field: err.path[0],
          message: err.message,
        }))
        return res.status(400).send({ errors })
      }

      await knex('meals').insert({
        name: result.data.name,
        description: result.data.description,
        date: result.data.date,
        hour: result.data.hour,
        user_id: result.data.user_id,
        isInDiet: result.data.isInDiet,
      })

      res.status(201).send('Meal created successfully')
    },
  )

  app.get('/:id', async (req, res) => {
    const getMealsParamsSchema = z.object({
      id: z.coerce.number(),
    })

    const { id } = getMealsParamsSchema.parse(req.params)

    const meal = await knex('meals').where({ id }).select('*')

    if (meal.length === 0) {
      return res.status(404).send('Meal not found')
    }

    res.status(200).send({ meal })
  })

  app.put('/:id', async (req, res) => {
    const getMealsParamsSchema = z.object({
      id: z.coerce.number(),
    })

    const mealsBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'Invalid date format. Expected YYYY-MM-DD.',
      }),
      hour: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
        message: 'Invalid hour format. Expected HH:mm.',
      }),
      isInDiet: z.boolean(),
    })

    const result = mealsBodySchema.safeParse(req.body)

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path[0],
        message: err.message,
      }))
      return res.status(400).send({ errors })
    }

    const { id } = getMealsParamsSchema.parse(req.params)

    await knex('meals').where({ id }).update({
      name: result.data.name,
      description: result.data.description,
      date: result.data.date,
      hour: result.data.hour,
      isInDiet: result.data.isInDiet,
    })

    res.status(200).send('Meal updated successfully')
  })

  app.delete('/:id', async (req, res) => {
    const getMealsParamsSchema = z.object({
      id: z.coerce.number(),
    })

    const { id } = getMealsParamsSchema.parse(req.params)

    await knex('meals').where({ id }).del()

    res.status(200).send('Meal deleted successfully')
  })

  app.get('/resume', async (req, res) => {
    const meals = await knex('meals').select('*')
    const allMeals = meals.length
    const inDietMeals = meals.filter((meal) => meal.isInDiet).length
    const notInDietMeals = meals.filter((meal) => !meal.isInDiet).length
    let inDietMealSequence = 0
    const bestInDietMealSequenceResult = await knex('users')
      .select('best_in_diet_meal_sequence')
      .first()

    let bestInDietMealSequence = bestInDietMealSequenceResult
      ? bestInDietMealSequenceResult.best_in_diet_meal_sequence
      : 0

    for (const meal of meals) {
      if (meal.isInDiet) {
        inDietMealSequence++
        if (inDietMealSequence > bestInDietMealSequence) {
          await knex('users').where('id', meal.user_id).update({
            best_in_diet_meal_sequence: inDietMealSequence,
          })

          bestInDietMealSequence = inDietMealSequence
        }
      } else {
        inDietMealSequence = 0
      }
    }
    bestInDietMealSequence = await knex('users')
      .select('best_in_diet_meal_sequence')
      .first()

    const dietPercentage =
      allMeals > 0 ? ((inDietMeals / allMeals) * 100).toFixed(2) : 0

    res.status(200).send({
      allMeals,
      inDietMeals,
      notInDietMeals,
      bestInDietMealSequence,
      dietPercentage,
    })
  })
}
