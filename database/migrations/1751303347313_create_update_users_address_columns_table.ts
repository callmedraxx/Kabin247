import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('address')
        .unsigned()
        .nullable()
        .alter(); // Change column type

      table
        .foreign('address')
        .references('id')
        .inTable('airports')
        .onDelete('SET NULL')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('address').nullable().alter()
      table.dropForeign(['address'])
    })
  }
}
