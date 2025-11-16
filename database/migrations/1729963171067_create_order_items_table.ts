import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 'order_items';

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
      table
        .integer('menu_item_id')
        .unsigned()
        .references('id')
        .inTable('menu_items')
        .onDelete('SET NULL');
      table.string('name').notNullable();
      table.text('description').nullable();
      table.double('price').defaultTo(0.0).notNullable();
      table.json('variants').nullable();
      table.json('addons').nullable();
      table.json('charges').nullable();
      table.double('variants_amount').defaultTo(0.0).notNullable();
      table.double('addons_amount').defaultTo(0.0).notNullable();
      table.double('tax_amount').defaultTo(0.0).notNullable();
      table.double('charge_amount').defaultTo(0.0).notNullable();
      table.double('discount_amount').defaultTo(0.0).notNullable();
      table.double('total_price').defaultTo(0.0).notNullable();
      table.integer('quantity').defaultTo(0);
      table.double('grand_price').defaultTo(0.0).notNullable();
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now());
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now());
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
