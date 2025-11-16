import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 'translations';

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.string('code', 255).notNullable();
      table.string('key', 255).notNullable();
      table.string('value', 255).notNullable();

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now());
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now());
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
