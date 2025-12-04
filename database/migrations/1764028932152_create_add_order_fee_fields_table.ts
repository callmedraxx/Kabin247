import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'orders'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.decimal('specialty_item_shopping_fee', 10, 2).defaultTo(0).notNullable()
      table.decimal('service_charge', 10, 2).defaultTo(0).notNullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('specialty_item_shopping_fee')
      table.dropColumn('service_charge')
    })
  }
}