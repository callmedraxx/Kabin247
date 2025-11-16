import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'menu_items'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('name').nullable().alter()
      table.text('description').nullable().alter()
      table.enum('food_type', ['veg', 'nonVeg']).nullable().alter()
      table.decimal('price', 10, 2).nullable().alter()
      table.decimal('discount', 10, 2).nullable().alter()
      table.enum('discount_type', ['percentage', 'amount']).nullable().alter()
      table.boolean('is_available').nullable().alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('name').notNullable().alter()
      table.text('description').notNullable().alter()
      table.enum('food_type', ['veg', 'nonVeg']).notNullable().alter()
      table.decimal('price', 10, 2).notNullable().alter()
      table.decimal('discount', 10, 2).notNullable().alter()
      table.enum('discount_type', ['percentage', 'amount']).notNullable().alter()
      table.boolean('is_available').notNullable().alter()
    })
  }
}
