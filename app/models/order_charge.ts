import { DateTime } from 'luxon';
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm';
import formatPrecision from '../utils/format_precision.js';
import Order from '#models/order';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';

export default class OrderCharge extends BaseModel {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare orderId: number;

  @column()
  declare name: string;

  @column()
  declare type: 'tax' | 'charge';

  @column({
    prepare: (value: number) => (value ? formatPrecision(value) : 0),
    consume: (value: number) => (value ? formatPrecision(value) : 0),
  })
  declare amount: number;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;

  @belongsTo(() => Order)
  declare order: BelongsTo<typeof Order>;
}
