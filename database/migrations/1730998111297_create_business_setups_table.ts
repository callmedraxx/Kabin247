import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 'business_setups';

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.string('name');
      table.string('email', 255);
      table.string('phone', 255);
      table.text('address');
      table.string('country', 255).defaultTo('US').notNullable();
      table.string('time_zone', 255).defaultTo('UTC+06:00');
      table.enum('time_format', ['12_format', '24_format']).defaultTo('12_format').notNullable();
      table.boolean('maintenance_mode').defaultTo(false).notNullable();
      table.boolean('dine_in').defaultTo(true).notNullable();
      table.boolean('delivery').defaultTo(true).notNullable();
      table.boolean('pickup').defaultTo(true).notNullable();
      table.double('delivery_charge').defaultTo(0.0).notNullable();
      table.string('currency_code').defaultTo('USD').notNullable();
      table.enum('currency_symbol_position', ['left', 'right']).defaultTo('right').notNullable();
      table.boolean('guest_checkout').defaultTo(false).notNullable();
      table.boolean('login_only_verified_email').defaultTo(false).notNullable();
      table
        .enum('sort_categories', ['priority_number', 'alphabetical_order'])
        .defaultTo('priority_number')
        .notNullable();
      table.json('logo');
      table.json('minimized_logo');
      table.json('favicon');
      table.string('theme');
      table.text('company_slogan');
      table.text('copyright_text');
      table.string('facebook');
      table.string('instagram');
      table.string('twitter');
      table.json('about_us_image');
      table.text('about_us_heading');
      table.text('about_us_description');
      table.json('contact_us_image');
      table.text('terms_and_conditions');
      table.text('privacy_policy');
      table.text('return_policy');
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now());
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now());
    });

    this.defer(async (db) => {
      await db.table(this.tableName).insert({});
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
