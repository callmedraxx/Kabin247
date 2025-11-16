import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 'schedules';

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.string('day', 15).notNullable();
      table.boolean('is_open').defaultTo(true);
      table.time('opening_time').nullable();
      table.time('closing_time').nullable();

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now());
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now());
    });

    this.defer(async (db) => {
      await db.table(this.tableName).multiInsert([
        {
          day: 'SATURDAY',
        },
        {
          day: 'SUNDAY',
        },
        {
          day: 'MONDAY',
        },
        {
          day: 'TUESDAY',
        },
        {
          day: 'WEDNESDAY',
        },
        {
          day: 'THRUSDAY',
        },
        {
          day: 'FRIDAY',
        },
      ]);
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
