import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'stock_inventories'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable()
      table.text('description').nullable()
      table.string('category').nullable() // e.g., 'ingredients', 'beverages', 'supplies'
      table.string('unit').notNullable().defaultTo('piece') // e.g., 'kg', 'liter', 'piece', 'box'
      table.double('quantity').defaultTo(0).notNullable()
      table.double('minimum_quantity').defaultTo(0).notNullable() // reorder threshold
      table.double('unit_cost').defaultTo(0).notNullable() // cost per unit
      table.double('total_value').defaultTo(0).notNullable() // quantity * unit_cost
      table.string('supplier').nullable() // supplier name
      table.string('location').nullable() // storage location
      table.date('expiry_date').nullable() // for perishable items
      table.date('last_restocked_date').nullable()
      table.boolean('is_active').defaultTo(true)
      table.text('notes').nullable() // additional notes

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}