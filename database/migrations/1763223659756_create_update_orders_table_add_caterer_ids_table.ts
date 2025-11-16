import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 'orders';

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Add caterer_id column
      table
        .integer('caterer_id')
        .unsigned()
        .references('id')
        .inTable('caterers')
        .onDelete('SET NULL')
        .nullable()
        .after('delivery_man_id');
    });
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('caterer_id');
    });
  }
}
