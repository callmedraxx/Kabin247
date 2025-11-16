import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'order_items'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Make these columns nullable
      table.string('name').nullable().alter()
      table.text('description').nullable().alter()
      table.decimal('price', 10, 2).nullable().alter()
      table.integer('quantity').nullable().alter()
      table.decimal('total_price', 10, 2).nullable().alter()
      table.decimal('grand_price', 10, 2).nullable().alter()
      table.decimal('addons_amount', 10, 2).nullable().alter()
      table.decimal('variants_amount', 10, 2).nullable().alter()
      table.decimal('tax_amount', 10, 2).nullable().alter()
      table.decimal('charge_amount', 10, 2).nullable().alter()
      table.decimal('discount_amount', 10, 2).nullable().alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      // Revert columns back to not null
      table.string('name').notNullable().alter()
      table.text('description').notNullable().alter()
      table.decimal('price', 10, 2).notNullable().alter()
      table.integer('quantity').notNullable().alter()
      table.decimal('total_price', 10, 2).notNullable().alter()
      table.decimal('grand_price', 10, 2).notNullable().alter()
      table.decimal('addons_amount', 10, 2).notNullable().alter()
      table.decimal('variants_amount', 10, 2).notNullable().alter()
      table.decimal('tax_amount', 10, 2).notNullable().alter()
      table.decimal('charge_amount', 10, 2).notNullable().alter()
      table.decimal('discount_amount', 10, 2).notNullable().alter()
    })
  }
}
