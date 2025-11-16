import { DateTime } from 'luxon';
import { BaseModel, belongsTo, column, hasMany, manyToMany } from '@adonisjs/lucid/orm';
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations';
import { attachment } from '@jrmc/adonis-attachment';
import type { Attachment } from '@jrmc/adonis-attachment/types/attachment';
import Category from '#models/category';
import Charge from '#models/charge';
import Addon from '#models/addon';
import Variant from '#models/variant';
import { Filterable } from 'adonis-lucid-filter';
import { compose } from '@adonisjs/core/helpers';
import MenuItemFilter from '#models/filters/menu_item_filter';
import formatPrecision from '../utils/format_precision.js';
import OrderItem from '#models/order_item';

export default class MenuItem extends compose(BaseModel, Filterable) {
  static $filter = () => MenuItemFilter;

  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare categoryId: number | null;

  @column()
  declare name: string | null;

  @column()
  declare description: string | null;

  @column()
  declare foodType: 'veg' | 'nonVeg' | null;

  @column({
    prepare: (value: number | null) => (value ? formatPrecision(value) : null),
    consume: (value: number | null) => (value ? formatPrecision(value) : null),
  })
  declare price: number | null;

  @column({
    prepare: (value: number | null) => (value ? formatPrecision(value) : null),
    consume: (value: number | null) => (value ? formatPrecision(value) : null),
  })
  declare discount: number | null;

  @column()
  declare discountType: 'percentage' | 'amount' | null;

  @column()
  declare isAvailable: boolean | null;

  @column()
  declare isRecommended: boolean;

  @attachment({
    preComputeUrl: true,
    variants: ['thumbnail'],
  })
  declare image: Attachment | null;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;

  @belongsTo(() => Category)
  declare category: BelongsTo<typeof Category>;

  @manyToMany(() => Charge as any, {
    pivotTable: 'item_charges',
    localKey: 'id',
    pivotForeignKey: 'menu_item_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'charge_id',
    pivotTimestamps: true,
  })
  declare charges: ManyToMany<any>;

  @manyToMany(() => Addon as any, {
    pivotTable: 'item_addons',
    localKey: 'id',
    pivotForeignKey: 'menu_item_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'addon_id',
    pivotTimestamps: true,
  })
  declare addons: ManyToMany<any>;

  @manyToMany(() => Variant, {
    pivotTable: 'item_variants',
    localKey: 'id',
    pivotForeignKey: 'menu_item_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'variant_id',
    pivotTimestamps: true,
  })
  declare variants: ManyToMany<typeof Variant>;

  @hasMany(() => OrderItem)
  declare orderItems: HasMany<typeof OrderItem>;
}
