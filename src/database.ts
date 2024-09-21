import { env } from './env'
import { Knex, knex as setupKnex } from 'knex'
import 'dotenv/config'

export const config: Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection:
    env.DATABASE_CLIENT === 'sqlite'
      ? {
          filename: env.DATABASE_URL,
        }
      : env.DATABASE_URL,
  useNullAsDefault: true,
  migrations: {
    directory: './db/migrations',
  },
}

export const knex = setupKnex(config)
