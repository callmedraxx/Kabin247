import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { compose } from '@adonisjs/core/helpers'
import { Filterable } from 'adonis-lucid-filter'
import formatPrecision from '../utils/format_precision.js'
import StockInventoryFilter from './filters/stock_inventory_filter.js'

export default class StockInventory extends compose(BaseModel, Filterable) {
  static $filter = () => StockInventoryFilter;
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare category: string | null

  @column()
  declare unit: string

  @column({
    prepare: (value: number) => (value ? formatPrecision(value) : 0),
    consume: (value: number) => (value ? formatPrecision(value) : 0),
  })
  declare quantity: number

  @column({
    prepare: (value: number) => (value ? formatPrecision(value) : 0),
    consume: (value: number) => (value ? formatPrecision(value) : 0),
  })
  declare minimumQuantity: number

  @column({
    prepare: (value: number) => (value ? formatPrecision(value) : 0),
    consume: (value: number) => (value ? formatPrecision(value) : 0),
  })
  declare unitCost: number

  @column({
    prepare: (value: number) => (value ? formatPrecision(value) : 0),
    consume: (value: number) => (value ? formatPrecision(value) : 0),
  })
  declare totalValue: number

  @column()
  declare supplier: string | null

  @column()
  declare location: string | null

  @column.date()
  declare expiryDate: DateTime | null

  @column.date()
  declare lastRestockedDate: DateTime | null

  @column()
  declare isActive: boolean

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
