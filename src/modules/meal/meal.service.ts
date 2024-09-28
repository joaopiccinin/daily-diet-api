import { FastifyRequest } from 'fastify'
import { knex } from '../../database'
import { meal } from '../../utils/types'
import { validateIdParam } from '../../utils/validation'
import { CreateAndUpdateMealInput } from './meal.schema'

export async function listMealsService(req: FastifyRequest) {
  const userId = Number(req.user?.id)
  const meals = await knex('meals').where({ user_id: userId }).select('*')
  return meals
}

export async function getMealService(req: FastifyRequest) {
  const id = validateIdParam(req)
  const userId = Number(req.user?.id)
  const meal = await knex('meals').where({ id, user_id: userId }).select('*')
  return meal
}

export async function createMealService(
  req: FastifyRequest<{
    Body: CreateAndUpdateMealInput
  }>,
) {
  const { name, description, date, hour, isInDiet } = req.body

  const userId = req.user?.id

  await knex('meals').insert({
    name,
    description,
    date,
    hour,
    isInDiet,
    user_id: userId,
  })
}

export async function updateMealService(
  req: FastifyRequest<{
    Body: CreateAndUpdateMealInput
  }>,
) {
  const id = validateIdParam(req)

  const userId = req.user?.id

  const { name, description, date, hour, isInDiet } = req.body

  const updatedRows = await knex('meals')
    .where({ id, user_id: userId })
    .update({
      name,
      description,
      date,
      hour,
      isInDiet,
    })

  return updatedRows
}

export async function deleteMealService(req: FastifyRequest) {
  const id = validateIdParam(req)

  const userId = req.user?.id

  const deletedRows = await knex('meals').where({ id, user_id: userId }).del()

  return deletedRows
}

export async function getResumeService(req: FastifyRequest) {
  const userId = Number(req.user?.id)
  const meals = await knex('meals').where({ user_id: userId }).select('*')

  const allMeals = meals.length
  const inDietMeals = meals.filter((meal) => meal.isInDiet).length
  const notInDietMeals = meals.filter((meal) => !meal.isInDiet).length

  await calculateBestInDietMealSequenceService(meals, userId)

  const bestInDietMealSequence = await knex('users')
    .where('id', userId)
    .select('best_in_diet_meal_sequence')
    .first()

  const dietPercentage =
    allMeals > 0 ? ((inDietMeals / allMeals) * 100).toFixed(2) : 0

  const response = {
    allMeals,
    inDietMeals,
    notInDietMeals,
    bestInDietMealSequence,
    dietPercentage,
  }

  return response
}

export async function resetBestInDietMealSequenceService(req: FastifyRequest) {
  const userId = req.user?.id

  await knex('users').where('id', userId).update({
    best_in_diet_meal_sequence: 0,
  })
}

async function calculateBestInDietMealSequenceService(
  meals: meal[],
  userId: number,
) {
  let inDietMealSequence = 0

  const bestInDietMealSequenceResult = await knex('users')
    .where('id', userId)
    .select('best_in_diet_meal_sequence')
    .first()

  let bestInDietMealSequence = bestInDietMealSequenceResult
    ? bestInDietMealSequenceResult.best_in_diet_meal_sequence
    : 0

  for (const meal of meals) {
    if (meal.isInDiet) {
      inDietMealSequence++
      if (inDietMealSequence > bestInDietMealSequence) {
        await knex('users').where('id', userId).update({
          best_in_diet_meal_sequence: inDietMealSequence,
        })

        bestInDietMealSequence = inDietMealSequence
      }
    } else {
      inDietMealSequence = 0
    }
  }
}
