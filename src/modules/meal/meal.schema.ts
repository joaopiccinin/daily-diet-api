import { z } from 'zod'
import { buildJsonSchemas } from 'fastify-zod'

const createAndUpdateMealSchema = z.object({
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

export type CreateAndUpdateMealInput = z.infer<typeof createAndUpdateMealSchema>

const createAndUpdateMealResponseSchema = z.object({
  name: z.string(),
  description: z.string(),
  date: z.string(),
  hour: z.string(),
  isInDiet: z.boolean(),
})

export const { schemas: mealSchemas, $ref } = buildJsonSchemas({
  createAndUpdateMealSchema,
  createAndUpdateMealResponseSchema,
})
