import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table
      .integer('best_in_diet_meal_sequence')
      .unsigned()
      .notNullable()
      .defaultTo(0)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('best_in_diet_meal_sequence')
  })
}
