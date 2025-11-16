import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 'notifications';

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.string('type').notNullable();
      table.string('title').notNullable();
      table.string('body').notNullable();
      table.boolean('is_read').defaultTo(false);
      table.boolean('is_system').defaultTo(false);
      table.string('navigate').nullable();
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .notNullable();

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now());
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now());
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
