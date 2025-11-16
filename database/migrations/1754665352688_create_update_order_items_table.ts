import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'order_items'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Modify price columns to handle larger numbers
      table.decimal('price', 20, 2).alter()
      table.decimal('total_price', 20, 2).alter()
      table.decimal('grand_price', 20, 2).alter()
      table.decimal('addons_amount', 20, 2).alter()
      table.decimal('variants_amount', 20, 2).alter()
      table.decimal('tax_amount', 20, 2).alter()
      table.decimal('charge_amount', 20, 2).alter()
      table.decimal('discount_amount', 20, 2).alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      // Revert back to original precision
      table.decimal('price', 10, 2).alter()
      table.decimal('total_price', 10, 2).alter()
      table.decimal('grand_price', 10, 2).alter()
      table.decimal('addons_amount', 10, 2).alter()
      table.decimal('variants_amount', 10, 2).alter()
      table.decimal('tax_amount', 10, 2).alter()
      table.decimal('charge_amount', 10, 2).alter()
      table.decimal('discount_amount', 10, 2).alter()
    })
  }
}
