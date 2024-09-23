import { FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../../database'

export async function listMeals(req: FastifyRequest, res: FastifyReply) {
  const meals = await knex('meals').select('*')
  res.status(200).send({ meals })
}

export async function createMeal(req: FastifyRequest, res: FastifyReply) {
  const result = mealsBodySchema.safeParse(req.body)

  if (!result.success) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors = result.error.errors.map((err: any) => ({
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
}
