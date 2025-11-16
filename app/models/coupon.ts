import { DateTime } from 'luxon';
import { BaseModel, column } from '@adonisjs/lucid/orm';
import { Filterable } from 'adonis-lucid-filter';
import { compose } from '@adonisjs/core/helpers';
import CouponFilter from '#models/filters/coupon_filter';
import formatPrecision from '../utils/format_precision.js';

export default class Coupon extends compose(BaseModel, Filterable) {
  static $filter = () => CouponFilter;

  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare name: string;

  @column()
  declare code: string;

  @column()
  declare type: 'default' | 'firstTimeUser';

  @column()
  declare discountType: 'percentage' | 'amount';

  @column({
    prepare: (value: number) => (value ? formatPrecision(value) : 0),
    consume: (value: number) => (value ? formatPrecision(value) : 0),
  })
  declare discount: number;

  @column()
  declare maxUsage: number;

  @column()
  declare minPurchase: number | null;

  @column()
  declare maxDiscount: number | null;

  @column()
  declare usageCount: number;

  @column({
    prepare: (value: number) => (value ? formatPrecision(value) : 0),
    consume: (value: number) => (value ? formatPrecision(value) : 0),
  })
  declare costUsed: number;

  @column()
  declare validFrom: DateTime | string | null;

  @column()
  declare validUntil: DateTime | string | null;

  @column()
  declare isAvailable: boolean;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;
}
