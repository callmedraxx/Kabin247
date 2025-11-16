import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 'order_charges';

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table
        .integer('order_id')
        .unsigned()
        .references('id')
        .inTable('orders')
        .onDelete('CASCADE')
        .notNullable();
      table.string('name').notNullable();
      table.enum('type', ['tax', 'charge']).defaultTo('charge');
      table.double('amount').defaultTo(0.0).notNullable();
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now());
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now());
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
