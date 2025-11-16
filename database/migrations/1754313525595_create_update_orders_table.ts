import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 'orders';

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('note').nullable();
      table.string('packaging_note').nullable();
      table.string('reheat_method').nullable();
      table.string('tail_number').nullable();
      table.string('delivery_time').nullable();
      table.string('priority').nullable();

      // drop old timestamp column before adding string version
      table.dropColumn('delivery_date');
    });

    this.schema.alterTable(this.tableName, (table) => {
      table.string('delivery_date').nullable();
    });
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns(
        'note',
        'packaging_note',
        'reheat_method',
        'tail_number',
        'delivery_time',
        'priority',
        'delivery_date'
      );
    });

    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('delivery_date', { useTz: true }).nullable();
    });
  }
}
