import { BaseSchema } from '@adonisjs/lucid/schema'

export default class AddDeliveryAirportToOrders extends BaseSchema {
  protected tableName = 'orders'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      // 👇 Add your new column here
      table
        .integer('delivery_airport_id')
        .unsigned()
        .references('id')
        .inTable('airports')
        .onDelete('SET NULL')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('delivery_airport_id')
    })
  }
}
