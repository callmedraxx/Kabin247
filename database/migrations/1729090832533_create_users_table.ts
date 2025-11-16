import { BaseSchema } from '@adonisjs/lucid/schema';
import Roles from '../../app/enum/roles.js';

export default class extends BaseSchema {
  protected tableName = 'users';

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable();
      table.string('first_name', 255).notNullable();
      table.string('last_name', 255).nullable();
      table.string('email', 254).notNullable().unique();
      table.string('phone_number', 255).nullable();
      table.string('password').notNullable();
      table.text('address').nullable();
      table
        .integer('role_id')
        .unsigned()
        .references('id')
        .inTable('roles')
        .defaultTo(Roles.CUSTOMER);
      table.boolean('is_email_verified').defaultTo(false);
      table.boolean('is_suspended').defaultTo(false);
      table.boolean('notification_sound').defaultTo(true).notNullable();

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now());
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now());
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
