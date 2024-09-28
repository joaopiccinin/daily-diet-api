import { afterAll, beforeAll, describe, it, beforeEach, expect } from 'vitest'
import { app } from '../../src/app'
import request, { Response } from 'supertest'
import { execSync } from 'child_process'

async function createUser() {
  return await request(app.server).post('/users/register').send({
    email: 'test@test.com',
    password: '123456',
    name: 'Test User',
  })
}

async function loginUser() {
  return await request(app.server).post('/users/login').send({
    email: 'test@test.com',
    password: '123456',
  })
}

async function createMeal(userResponse: Response, loginResponse: Response) {
  const cookies = loginResponse.headers['set-cookie']
  return await request(app.server)
    .post('/meals')
    .set('Cookie', cookies)
    .send({
      name: 'Test Meal',
      description: 'Test Meal Description',
      date: '2023-01-01',
      hour: '12:00',
      isInDiet: true,
      user_id: userResponse.body.id,
    })
    .expect(201)
}

describe('Meal tests', () => {
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

  describe('Successful tests', () => {
    it('should able to create a new meal', async () => {
      const userResponse = await createUser()
      const loginResponse = await loginUser()

      await createMeal(userResponse, loginResponse)
    })

    it('should able to get a meal', async () => {
      const userResponse = await createUser()
      const loginResponse = await loginUser()

      const cookies = loginResponse.headers['set-cookie']

      await createMeal(userResponse, loginResponse)

      const mealResponse = await request(app.server)
        .get('/meals/1')
        .set('Cookie', cookies)
        .expect(200)

      const meal = mealResponse.body.meal[0]

      expect(meal).toEqual(
        expect.objectContaining({
          name: 'Test Meal',
          description: 'Test Meal Description',
          date: '2023-01-01',
          hour: '12:00',
          id: expect.any(Number),
          isInDiet: 1,
          user_id: expect.any(Number),
        }),
      )
    })

    it('should able to list meals', async () => {
      const userResponse = await createUser()
      const loginResponse = await loginUser()

      const cookies = loginResponse.headers['set-cookie']

      await createMeal(userResponse, loginResponse)

      const listMealsResponse = await request(app.server)
        .get('/meals')
        .set('Cookie', cookies)
        .expect(200)

      expect(listMealsResponse.body.meals).toEqual([
        expect.objectContaining({
          name: 'Test Meal',
          description: 'Test Meal Description',
          date: '2023-01-01',
          hour: '12:00',
          id: expect.any(Number),
          isInDiet: 1,
          user_id: expect.any(Number),
        }),
      ])
    })

    it('should able to update a meal', async () => {
      const userResponse = await createUser()
      const loginResponse = await loginUser()

      const cookies = loginResponse.headers['set-cookie']

      await createMeal(userResponse, loginResponse)

      await request(app.server)
        .get('/meals/1')
        .set('Cookie', cookies)
        .expect(200)

      await request(app.server)
        .put('/meals/1')
        .set('Cookie', cookies)
        .send({
          name: 'Updated Meal',
          description: 'Updated Meal Description',
          date: '2023-01-02',
          hour: '12:00',
          isInDiet: true,
          user_id: userResponse.body.id,
        })
        .expect(200)

      const updatedMealResponse = await request(app.server)
        .get('/meals/1')
        .set('Cookie', cookies)
        .expect(200)

      expect(updatedMealResponse.body.meal[0]).toEqual(
        expect.objectContaining({
          name: 'Updated Meal',
          description: 'Updated Meal Description',
          date: '2023-01-02',
          hour: '12:00',
          id: expect.any(Number),
          isInDiet: 1,
          user_id: expect.any(Number),
        }),
      )
    })

    it('should able to delete a meal', async () => {
      const userResponse = await createUser()
      const loginResponse = await loginUser()

      const cookies = loginResponse.headers['set-cookie']

      await createMeal(userResponse, loginResponse)

      await request(app.server)
        .delete('/meals/1')
        .set('Cookie', cookies)
        .expect(200)

      await request(app.server)
        .get('/meals/1')
        .set('Cookie', cookies)
        .expect(404)
    })
  })

  describe('Error tests', () => {
    it('should not able to create, update, get, delete or list a meal without login', async () => {
      await request(app.server)
        .post('/meals')
        .send({
          name: 'Test Meal',
          description: 'Test Meal Description',
          date: '2023-01-01',
          hour: '12:00',
          isInDiet: true,
        })
        .expect(401)

      await request(app.server)
        .put('/meals/1')
        .send({
          name: 'Test Meal',
          description: 'Test Meal Description',
          date: '2023-01-01',
          hour: '12:00',
          isInDiet: true,
        })
        .expect(401)

      await request(app.server).delete('/meals/1').expect(401)

      await request(app.server).get('/meals/1').expect(401)

      await request(app.server).get('/meals').expect(401)
    })

    it('should not able to create a new meal with invalid date or hour', async () => {
      const userResponse = await createUser()
      const loginResponse = await loginUser()

      const cookies = loginResponse.headers['set-cookie']

      await request(app.server)
        .post('/meals')
        .set('Cookie', cookies)
        .send({
          name: 'Test Meal',
          description: 'Test Meal Description',
          date: '01/01/2023',
          hour: '25:30',
          isInDiet: true,
          user_id: userResponse.body.id,
        })
        .expect(400)
    })
  })
})
