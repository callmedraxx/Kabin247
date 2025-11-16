import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 'settings';

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.string('key').notNullable();
      table.boolean('status').defaultTo(false);
      table.string('value_1').nullable();
      table.string('value_2').nullable();
      table.text('value_3').nullable();
      table.text('value_4').nullable();
      table.text('value_5').nullable();
      table.json('value_6').nullable();
      table.json('file').nullable();
      table.json('file_2').nullable();
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now());
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now());
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
