import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'airports'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name', 255).notNullable()
      table.string('fbo_name', 255).nullable()
      table.string('fbo_email', 255).nullable()
      table.string('fbo_phone', 50).nullable()
      table.string('iata_code', 4).nullable()
      table.string('icao_code', 4).nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}