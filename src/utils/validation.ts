import { z } from 'zod'
import { FastifyRequest } from 'fastify'

const getMealsParamsSchema = z.object({
  id: z.coerce.number(),
})

export function validateIdParam(req: FastifyRequest) {
  const { id } = getMealsParamsSchema.parse(req.params)
  return id
}
