import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 'orders';

  async up() {
    // Add 'qe_serv_hub' to the order type enum
    this.schema.raw(`
      ALTER TABLE \`${this.tableName}\` 
      MODIFY COLUMN \`type\` ENUM('dine_in', 'delivery', 'pickup', 'qe_serv_hub') NOT NULL
    `);
  }

  async down() {
    // Revert to original enum values
    this.schema.raw(`
      ALTER TABLE \`${this.tableName}\` 
      MODIFY COLUMN \`type\` ENUM('dine_in', 'delivery', 'pickup') NOT NULL
    `);
  }
}

