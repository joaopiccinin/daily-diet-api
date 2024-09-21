import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import crypto from 'crypto'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (req: FastifyRequest, res: FastifyReply) => {
    const createUsersBodySchema = z.object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
    })

    const salt = await crypto.randomBytes(16).toString('hex')

    const { name, email, password } = createUsersBodySchema.parse(req.body)
    const hashedPassword = await crypto
      .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
      .toString('hex')

    await knex('users').insert({
      name,
      email,
      password: hashedPassword,
    })

    res.status(201).send({ message: 'User created successfully' })
  })
}
