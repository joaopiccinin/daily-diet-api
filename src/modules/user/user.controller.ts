import { FastifyReply, FastifyRequest } from 'fastify'
import { CreateUserInput, LoginUserInput } from './user.schema'
import { knex } from '../../database'
import { createUserService, loginService, logoutService } from './user.service'

export async function createUser(
  req: FastifyRequest<{
    Body: CreateUserInput
  }>,
  reply: FastifyReply,
) {
  try {
    const { email } = req.body
    const userExists = await knex('users').where({ email }).first()
    if (userExists) {
      return reply.status(400).send({ message: 'User already exists' })
    }

    const userIsCreated = await createUserService(req)

    if (!userIsCreated) {
      return reply
        .status(500)
        .send({ message: 'An error occurred while creating the user' })
    }

    return reply.code(201).send('User created successfully')
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
  try {
    const accessToken = await loginService(req)

    if (!accessToken) {
      return reply.code(401).send({
        message: 'Invalid email or password',
      })
    }

    reply.setCookie('access_token', accessToken, {
      path: '/',
      httpOnly: true,
      secure: true,
    })

    return { accessToken }
  } catch (error) {
    return reply.code(500).send(error)
  }
}

export async function logout(req: FastifyRequest, reply: FastifyReply) {
  await logoutService(req, reply)
}
