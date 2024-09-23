import { FastifyReply, FastifyRequest } from 'fastify'
import { CreateUserInput, LoginUserInput } from './user.schema'
import { knex } from '../../database'
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

export async function createUser(
  req: FastifyRequest<{
    Body: CreateUserInput
  }>,
  reply: FastifyReply,
) {
  const { email, password, name } = req.body

  const user = await knex('users').where({ email }).first()

  if (user) {
    return reply.status(400).send({ message: 'User already exists' })
  }

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
    const user = await knex('users').insert({
      email,
      password: hashedPassword,
      name,
    })
    return reply.code(201).send(user)
  } catch (e) {
    return reply.code(500).send(e)
  }
}

export async function login(
  req: FastifyRequest<{
    Body: LoginUserInput
  }>,
  reply: FastifyReply,
) {
  const { email, password } = req.body

  const user = await knex('users').where({ email }).first()

  const isMatch = user && (await bcrypt.compare(password, user.password))
  if (!user || !isMatch) {
    return reply.code(401).send({
      message: 'Invalid email or password',
    })
  }
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
  }

  const token = req.jwt.sign(payload)
  reply.setCookie('access_token', token, {
    path: '/',
    httpOnly: true,
    secure: true,
  })

  return { accessToken: token }
}

export async function logout(req: FastifyRequest, reply: FastifyReply) {
  reply.clearCookie('access_token')
  return reply.send({ message: 'Logout successful' })
}
