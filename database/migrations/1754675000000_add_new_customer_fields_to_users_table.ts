import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('company_name', 255).nullable().after('last_name')
      table.string('second_email', 254).nullable().after('email')
      table.string('second_phone_number', 255).nullable().after('phone_number')
      table.text('client_address').nullable().after('address')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('company_name')
      table.dropColumn('second_email')
      table.dropColumn('second_phone_number')
      table.dropColumn('client_address')
    })
  }
}
