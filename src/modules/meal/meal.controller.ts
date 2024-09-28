import { FastifyReply, FastifyRequest } from 'fastify'
import { CreateAndUpdateMealInput } from './meal.schema'
import {
  createMealService,
  deleteMealService,
  getMealService,
  getResumeService,
  listMealsService,
  resetBestInDietMealSequenceService,
  updateMealService,
} from './meal.service'

export async function listMeals(req: FastifyRequest, res: FastifyReply) {
  const meals = await listMealsService(req)
  res.status(200).send({ meals })
}

export async function getMeal(req: FastifyRequest, res: FastifyReply) {
  const meal = await getMealService(req)

  if (meal.length === 0) {
    return res.status(404).send('Meal not found')
  }

  res.status(200).send({ meal })
}

export async function createMeal(
  req: FastifyRequest<{
    Body: CreateAndUpdateMealInput
  }>,
  res: FastifyReply,
) {
  try {
    await createMealService(req)
    res.status(201).send('Meal created successfully')
  } catch (error) {
    return res
      .status(500)
      .send({ error: 'An error occurred while creating the meal' })
  }
}

export async function updateMeal(
  req: FastifyRequest<{
    Body: CreateAndUpdateMealInput
  }>,
  res: FastifyReply,
) {
  try {
    const updatedRows = await updateMealService(req)

    if (updatedRows === 0) {
      return res.status(404).send({ error: 'Meal not found' })
    }

    await resetBestInDietMealSequenceService(req)

    return res.status(200).send({ message: 'Meal updated successfully' })
  } catch (error) {
    return res
      .status(500)
      .send({ error: 'An error occurred while updating the meal' })
  }
}

export async function deleteMeal(req: FastifyRequest, res: FastifyReply) {
  try {
    const deletedRows = await deleteMealService(req)

    if (deletedRows === 0) {
      return res.status(404).send({ error: 'Meal not found' })
    }

    await resetBestInDietMealSequenceService(req)

    res.status(200).send({ message: 'Meal deleted successfully' })
  } catch (error) {
    return res
      .status(500)
      .send({ error: 'An error occurred while deleting the meal' })
  }
}

export async function getResume(req: FastifyRequest, res: FastifyReply) {
  try {
    const response = await getResumeService(req)
    res.status(200).send(response)
  } catch (error) {
    return res
      .status(500)
      .send({ error: 'An error occurred while getting the meal resume' })
  }
}
