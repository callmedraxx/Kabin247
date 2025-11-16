import { DateTime } from 'luxon';
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm';
import { attachment } from '@jrmc/adonis-attachment';
import type { Attachment } from '@jrmc/adonis-attachment/types/attachment';
import type { HasMany } from '@adonisjs/lucid/types/relations';
import MenuItem from '#models/menu_item';
import { Filterable } from 'adonis-lucid-filter';
import { compose } from '@adonisjs/core/helpers';
import CategoryFilter from '#models/filters/category_filter';

export default class Category extends compose(BaseModel, Filterable) {
  static $filter = () => CategoryFilter;
  
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare name: string;

  @column()
  declare priority: number;

  @column()
  declare isAvailable: boolean;

  @attachment({
    preComputeUrl: true,
    variants: ['thumbnail'],
  })
  declare image: Attachment | null;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;

  @hasMany(() => MenuItem)
  declare menuItems: HasMany<typeof MenuItem>;
}
