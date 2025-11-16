import { DateTime } from 'luxon';
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import Variant from '#models/variant';
import formatPrecision from '../utils/format_precision.js';

export default class VariantOption extends BaseModel {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare variantId: number;

  @column()
  declare name: string;

  @column({
    prepare: (value: number) => (value ? formatPrecision(value) : 0),
    consume: (value: number) => (value ? formatPrecision(value) : 0),
  })
  declare price: number;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;

  @belongsTo(() => Variant)
  declare variant: BelongsTo<typeof Variant>;
}
