import { afterAll, beforeAll, describe, it, beforeEach, expect } from 'vitest'
import request from 'supertest'
import { app } from '../../src/app'
import { execSync } from 'child_process'

describe('User tests', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should able to register a new user', async () => {
    const userResponse = await request(app.server)
      .post('/users/register')
      .send({
        email: 'test@test.com',
        password: '123456',
        name: 'Test User',
      })

    expect(userResponse.text).toEqual('User created successfully')
  })

  it('should able to login a user', async () => {
    await request(app.server).post('/users/register').send({
      email: 'test@test.com',
      password: '123456',
      name: 'Test User',
    })

    const loginResponse = await request(app.server).post('/users/login').send({
      email: 'test@test.com',
      password: '123456',
    })

    expect(loginResponse.body.accessToken).toBeDefined()
  })

  it('should logout a user', async () => {
    await request(app.server).post('/users/register').send({
      email: 'test@test.com',
      password: '123456',
      name: 'Test User',
    })
    await request(app.server).post('/users/login').send({
      email: 'test@test.com',
      password: '123456',
    })

    const logoutResponse = await request(app.server)
      .post('/users/logout')
      .expect(200)

    expect(logoutResponse.body.message).toEqual('Logout successful')

    await request(app.server).get('/meals').expect(401)
  })
})
