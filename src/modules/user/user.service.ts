import { FastifyReply, FastifyRequest } from 'fastify'
import { CreateUserInput, LoginUserInput } from './user.schema'
import { knex } from '../../database'
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

export async function createUserService(
  req: FastifyRequest<{
    Body: CreateUserInput
  }>,
) {
  const { email, password, name } = req.body

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
  return await knex('users').insert({
    email,
    password: hashedPassword,
    name,
  })
}

export async function loginService(
  req: FastifyRequest<{
    Body: LoginUserInput
  }>,
) {
  const { email, password } = req.body
  const user = await knex('users').where({ email }).first()
  const isMatch = user && (await bcrypt.compare(password, user.password))

  if (!user || !isMatch) {
    return false
  }

  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
  }

  const token = req.jwt.sign(payload)

  return token
}

export async function logoutService(req: FastifyRequest, reply: FastifyReply) {
  reply.clearCookie('access_token')
  return reply.send({ message: 'Logout successful' })
}
