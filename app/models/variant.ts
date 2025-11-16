import { DateTime } from 'luxon';
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm';
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations';
import VariantOption from '#models/variant_option';
import MenuItem from '#models/menu_item';
import { Filterable } from 'adonis-lucid-filter';
import { compose } from '@adonisjs/core/helpers';
import VariantFilter from '#models/filters/variant_filter';

export default class Variant extends compose(BaseModel, Filterable) {
  static $filter = () => VariantFilter;

  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare name: string;

  @column()
  declare value: string;

  @column()
  declare allowMultiple: boolean;

  @column()
  declare requirement: 'optional' | 'required';

  @column()
  declare min: number | null;

  @column()
  declare max: number | null;

  @column()
  declare isAvailable: boolean;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;

  @hasMany(() => VariantOption)
  declare variantOptions: HasMany<typeof VariantOption>;

  @manyToMany(() => MenuItem, {
    pivotTable: 'item_variants',
    localKey: 'id',
    pivotForeignKey: 'variant_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'menu_item_id',
    pivotTimestamps: true,
  })
  declare menuItems: ManyToMany<typeof MenuItem>;
}
