import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 'variants';

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.string('name').notNullable();
      table.string('value').notNullable().unique();
      table.boolean('allow_multiple').defaultTo(false);
      table.enum('requirement', ['optional', 'required']).defaultTo('optional');
      table.integer('min').nullable();
      table.integer('max').nullable();
      table.boolean('is_available').defaultTo(true);
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now());
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now());
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
