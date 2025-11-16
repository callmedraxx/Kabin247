import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 'charges';

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.string('name', 255).notNullable();
      table.enum('type', ['tax', 'charge']).defaultTo('charge');
      table.double('amount').defaultTo(0.0).notNullable();
      table.enum('amount_type', ['percentage', 'amount']).defaultTo('percentage');
      table.boolean('is_available').defaultTo(true);

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now());
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now());
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
