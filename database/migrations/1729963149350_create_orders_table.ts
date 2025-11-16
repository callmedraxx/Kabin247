import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 'orders';

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.string('order_number').notNullable().unique();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('SET NULL');
      table.enum('type', ['dine_in', 'delivery', 'pickup']);
      table.integer('total_quantity').defaultTo(0).notNullable();
      table.double('total').defaultTo(0.0).notNullable();
      table.double('total_tax').defaultTo(0.0).notNullable();
      table.double('total_charges').defaultTo(0.0).notNullable();
      table.double('discount').defaultTo(0.0).notNullable();
      table.double('manual_discount').defaultTo(0.0).notNullable();
      table.double('delivery_charge').defaultTo(0.0).notNullable();
      table.double('grand_total').defaultTo(0.0).notNullable();
      table.enum('payment_type', ['card', 'cash', 'paypal', 'stripe']).defaultTo('cash');
      table.boolean('payment_status').defaultTo(false);
      table.json('payment_info').nullable();
      table.text('customer_note').nullable();
      table
        .enum('status', [
          'pending',
          'processing',
          'ready',
          'on_delivery',
          'completed',
          'canceled',
          'failed',
        ])
        .defaultTo('pending');
      table.timestamp('delivery_date', { useTz: true }).nullable();
      table
        .integer('delivery_man_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL');
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now());
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now());
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
