import { DateTime } from 'luxon';
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm';
import type { ManyToMany } from '@adonisjs/lucid/types/relations';
import MenuItem from '#models/menu_item';
import { compose } from '@adonisjs/core/helpers';
import { Filterable } from 'adonis-lucid-filter';
import AddonFilter from '#models/filters/addon_filter';
import formatPrecision from '../utils/format_precision.js';
import { attachment } from '@jrmc/adonis-attachment';
import type { Attachment } from '@jrmc/adonis-attachment/types/attachment';

export default class Addon extends compose(BaseModel, Filterable) {
  static $filter = () => AddonFilter;

  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare name: string;

  @attachment({
    preComputeUrl: true,
    variants: ['thumbnail', 'orginal'],
  })
  declare image: Attachment | null;

  @column({
    prepare: (value: number) => (value ? formatPrecision(value) : 0),
    consume: (value: number) => (value ? formatPrecision(value) : 0),
  })
  declare price: number;

  @column()
  declare isAvailable: boolean;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;

  @manyToMany(() => MenuItem, {
    pivotTable: 'item_addons',
    localKey: 'id',
    pivotForeignKey: 'addon_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'menu_item_id',
    pivotTimestamps: true,
  })
  declare menuItems: ManyToMany<typeof MenuItem>;
}
