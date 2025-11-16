import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 'menu_items';

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table
        .integer('category_id')
        .unsigned()
        .references('id')
        .inTable('categories')
        .onDelete('SET NULL');
      table.string('name').notNullable();
      table.text('description').nullable();
      table.enum('food_type', ['veg', 'nonVeg']);
      table.double('price').defaultTo(0.0).notNullable();
      table.double('discount').defaultTo(0.0).notNullable();
      table.enum('discount_type', ['percentage', 'amount']).defaultTo('percentage');
      table.boolean('is_available').defaultTo(true);
      table.boolean('is_recommended').defaultTo(false);
      table.json('image').nullable();

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now());
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now());
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
