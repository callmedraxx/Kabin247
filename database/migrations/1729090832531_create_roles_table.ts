import { BaseSchema } from '@adonisjs/lucid/schema';
import Roles from '../../app/enum/roles.js';

export default class extends BaseSchema {
  protected tableName = 'roles';

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.string('name', 50).notNullable();
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now());
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now());
    });

    this.defer(async (db) => {
      await db.table(this.tableName).multiInsert([
        {
          id: Roles.ADMIN,
          name: 'Admin',
        },
        {
          id: Roles.MANAGER,
          name: 'Manager',
        },
        {
          id: Roles.POS,
          name: 'POS',
        },
        {
          id: Roles.DISPLAY,
          name: 'Display',
        },
        {
          id: Roles.KITCHEN,
          name: 'Kitchen',
        },
        {
          id: Roles.CUSTOMER,
          name: 'Customer',
        },
        {
          id: Roles.DELIVERY,
          name: 'Delivery',
        },
      ]);
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
