import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 'caterers';

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.string('name', 255).notNullable();
      table.string('email', 255).nullable();
      table.string('phone', 50).nullable();
      table.string('iata_code', 4).nullable();
      table.string('icao_code', 4).nullable();
      table.string('time_zone', 100).nullable();
      table
        .integer('airport_id')
        .unsigned()
        .references('id')
        .inTable('airports')
        .onDelete('SET NULL')
        .nullable();
      table.boolean('is_active').defaultTo(true).notNullable();
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now());
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now());

      // Indexes for faster lookups
      table.index(['iata_code', 'icao_code'], 'caterers_codes_index');
      table.index('airport_id', 'caterers_airport_index');
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
