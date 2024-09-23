import fastify, { FastifyReply, FastifyRequest } from 'fastify'
import { mealsRoutes } from '../src/modules/meal/meal.routes'
import { userRoutes } from './modules/user/user.routes'
import { userSchemas } from './modules/user/user.schema'
import fjwt, { FastifyJWT } from '@fastify/jwt'
import fCookie from '@fastify/cookie'
import { env } from './env'

export const app = fastify()

app.register(fjwt, { secret: env.JWT_SECRET })

app.register(fCookie, {
  secret: env.COOKIE_SECRET,
  hook: 'preHandler',
})

for (const schema of [...userSchemas]) {
  app.addSchema(schema)
}

app.addHook('preHandler', (req, res, next) => {
  req.jwt = app.jwt
  return next()
})

app.decorate(
  'authenticate',
  async (req: FastifyRequest, reply: FastifyReply) => {
    const token = req.cookies.access_token
    if (!token) {
      return reply.status(401).send({ message: 'Authentication required' })
    }
    const decoded = req.jwt.verify<FastifyJWT['user']>(token)
    req.user = decoded
  },
)

app.register(userRoutes, {
  prefix: '/users',
})

app.register(mealsRoutes, {
  prefix: '/meals',
})
