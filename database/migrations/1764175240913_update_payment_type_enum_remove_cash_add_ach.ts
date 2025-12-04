import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 'orders';

  async up() {
    // Remove 'cash' and add 'ach' to the payment_type enum
    // First, update any existing 'cash' values to 'card' as default
    this.schema.raw(`
      UPDATE \`${this.tableName}\` 
      SET \`payment_type\` = 'card' 
      WHERE \`payment_type\` = 'cash'
    `);
    
    // Then alter the enum
    this.schema.raw(`
      ALTER TABLE \`${this.tableName}\` 
      MODIFY COLUMN \`payment_type\` ENUM('card', 'ach', 'paypal', 'stripe') DEFAULT 'card' NOT NULL
    `);
  }

  async down() {
    // Revert: remove 'ach' and add back 'cash'
    // First update any 'ach' values to 'card'
    this.schema.raw(`
      UPDATE \`${this.tableName}\` 
      SET \`payment_type\` = 'card' 
      WHERE \`payment_type\` = 'ach'
    `);
    
    // Then revert the enum
    this.schema.raw(`
      ALTER TABLE \`${this.tableName}\` 
      MODIFY COLUMN \`payment_type\` ENUM('card', 'cash', 'paypal', 'stripe') DEFAULT 'cash' NOT NULL
    `);
  }
}

