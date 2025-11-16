import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 'promotions';

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.enum('type', ['slider', 'welcome', 'message']).defaultTo('slider').notNullable();
      table.json('slider_image').nullable();
      table.json('welcome_image').nullable();
      table.boolean('welcome_status').defaultTo(false);
      table.text('message').nullable();
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now());
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now());
    });
    this.defer(async (db) => {
      await db.table(this.tableName).multiInsert([
        { type: 'welcome', welcome_image: null },
        { type: 'message', message: null },
      ]);
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
