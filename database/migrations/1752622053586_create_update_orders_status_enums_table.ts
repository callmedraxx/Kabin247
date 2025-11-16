import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 'orders';

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .enum('status', [
          'quote_pending',
          'quote_sent',
          'awaiting_vendor_quote',
          'awaiting_vendor_confirmation',
          'vendor_confirmed',
          'awaiting_client_confirmation',
          'client_confirmed',
          'out_for_delivery',
          'completed',
          'cancelled_not_billable',
          'cancelled_billable',
        ])
        .defaultTo('quote_pending') // Set default to quote_pending
        .alter(); // Alter the existing column
    });
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .enum('status', [
          'pending',
          'processing',
          'ready',
          'on_delivery',
          'completed',
          'canceled',
          'failed',
        ])
        .defaultTo('pending') // Set default back to pending
        .alter(); // Revert the column to the original state
    });
  }
}
