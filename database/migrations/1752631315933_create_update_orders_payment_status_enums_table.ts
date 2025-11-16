import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 'orders';

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Alter the payment_status column to enum with new values
      table
        .enum('payment_status', ['unpaid', 'payment_requested', 'paid'])
        .defaultTo('unpaid')
        .alter();
    });
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      // Revert payment_status column back to its original state (if needed)
      table
        .boolean('payment_status')
        .defaultTo(false)
        .alter();
    });
  }
}
