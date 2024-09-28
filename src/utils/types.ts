import { JWT } from '@fastify/jwt'

declare module 'fastify' {
  interface FastifyRequest {
    jwt: JWT
  }
  export interface FastifyInstance {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    authenticate: any
  }
}

type UserPayload = {
  id: string
  email: string
  name: string
}
declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: UserPayload
  }
}

export interface meal {
  id: number
  name: string
  description: string
  date: string
  hour: string
  isInDiet: boolean
  user_id: number
}
