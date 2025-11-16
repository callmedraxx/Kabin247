import { DateTime } from 'luxon';
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import Order from '#models/order';
import { Filterable } from 'adonis-lucid-filter';
import { compose } from '@adonisjs/core/helpers';
import formatPrecision from '../utils/format_precision.js';
import MenuItem from '#models/menu_item';

export default class OrderItem extends compose(BaseModel, Filterable) {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare orderId: number;

  @column()
  declare menuItemId: number;

  @column()
  declare name: string;

  @column()
  declare description: string;

  @column({
    prepare: (value: number) => (value ? formatPrecision(value) : 0),
    consume: (value: number) => (value ? formatPrecision(value) : 0),
  })
  declare price: number;

  @column()
  declare variants: any | null;

  @column()
  declare addons: any | null;

  @column()
  declare charges: any | null;

  @column({
    prepare: (value: number) => (value ? formatPrecision(value) : 0),
    consume: (value: number) => (value ? formatPrecision(value) : 0),
  })
  declare addonsAmount: number;

  @column({
    prepare: (value: number) => (value ? formatPrecision(value) : 0),
    consume: (value: number) => (value ? formatPrecision(value) : 0),
  })
  declare variantsAmount: number;

  @column({
    prepare: (value: number) => (value ? formatPrecision(value) : 0),
    consume: (value: number) => (value ? formatPrecision(value) : 0),
  })
  declare taxAmount: number;

  @column({
    prepare: (value: number) => (value ? formatPrecision(value) : 0),
    consume: (value: number) => (value ? formatPrecision(value) : 0),
  })
  declare chargeAmount: number;

  @column({
    prepare: (value: number) => (value ? formatPrecision(value) : 0),
    consume: (value: number) => (value ? formatPrecision(value) : 0),
  })
  declare discountAmount: number;

  @column({
    prepare: (value: number) => (value ? formatPrecision(value) : 0),
    consume: (value: number) => (value ? formatPrecision(value) : 0),
  })
  declare totalPrice: number;

  @column()
  declare quantity: number;

  @column({
    prepare: (value: number) => (value ? formatPrecision(value) : 0),
    consume: (value: number) => (value ? formatPrecision(value) : 0),
  })
  declare grandPrice: number;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;

  @belongsTo(() => Order)
  declare order: BelongsTo<typeof Order>;

  @belongsTo(() => MenuItem)
  declare menuItem: BelongsTo<typeof MenuItem>;
}
