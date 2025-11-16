import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 'reservations';

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.timestamp('reservation_date', { useTz: true }).notNullable();
      table.text('reservation_note').nullable();
      table.integer('number_of_people').defaultTo(1).notNullable();
      table.string('table_number', 255).notNullable();
      table.string('start_time').notNullable();
      table.string('end_time').notNullable();
      table.enum('status', ['booked', 'cancelled', 'completed']).defaultTo('booked');
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now());
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now());
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
