import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 'payment_methods';

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.string('name', 255).notNullable();
      table.string('key', 255).notNullable().unique();
      table.boolean('status').defaultTo(false);
      table.json('logo').nullable();
      table.text('public').nullable();
      table.text('secret').nullable();
      table.text('webhook').nullable();
      table.text('mode').nullable();
      table.json('currencies').nullable();
      table.json('countries').nullable();
      table.json('extra_params').nullable();
      table.json('config').nullable();
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now());
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now());
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
