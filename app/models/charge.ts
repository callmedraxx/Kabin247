import { DateTime } from 'luxon';
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm';
import type { ManyToMany } from '@adonisjs/lucid/types/relations';
import MenuItem from '#models/menu_item';
import { Filterable } from 'adonis-lucid-filter';
import { compose } from '@adonisjs/core/helpers';
import ChargeFilter from '#models/filters/charge_filter';
import formatPrecision from '../utils/format_precision.js';

export default class Charge extends compose(BaseModel, Filterable) {
  static $filter = () => ChargeFilter;

  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare name: string;

  @column()
  declare type: 'tax' | 'charge';

  @column({
    prepare: (value: number) => (value ? formatPrecision(value) : 0),
    consume: (value: number) => (value ? formatPrecision(value) : 0),
  })
  declare amount: number;

  @column()
  declare amountType: 'percentage' | 'amount';

  @column()
  declare isAvailable: boolean;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;

  @manyToMany(() => MenuItem, {
    pivotTable: 'item_charges',
    localKey: 'id',
    pivotForeignKey: 'charge_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'menu_item_id',
    pivotTimestamps: true,
  })
  declare menuItems: ManyToMany<typeof MenuItem>;
}
