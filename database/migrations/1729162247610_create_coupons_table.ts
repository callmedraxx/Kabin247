import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 'coupons';

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.string('name', 255).notNullable();
      table.string('code', 255).notNullable();
      table.enum('type', ['default', 'firstTimeUser']).defaultTo('default');
      table.enum('discount_type', ['percentage', 'amount']).defaultTo('percentage');
      table.double('discount').defaultTo(0.0).notNullable();
      table.integer('max_usage').defaultTo(1).notNullable();
      table.double('min_purchase').nullable();
      table.double('max_discount').nullable();
      table.integer('usage_count').defaultTo(0).notNullable();
      table.double('cost_used').defaultTo(0.0).notNullable();
      table.timestamp('valid_from', { useTz: true }).notNullable();
      table.timestamp('valid_until', { useTz: true }).notNullable();
      table.boolean('is_available').notNullable().defaultTo(true);

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now());
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now());
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
