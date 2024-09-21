import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.increments('id').primary()
    table.string('name').notNullable()
    table.string('description').notNullable()
    table.date('date').notNullable()
    table.time('hour').notNullable()
    table.integer('user_id').unsigned().notNullable()
    table.boolean('isInDiet').notNullable()

    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}
