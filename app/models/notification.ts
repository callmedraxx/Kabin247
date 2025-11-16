import { DateTime } from 'luxon';
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm';
import User from '#models/user';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';

export default class Notification extends BaseModel {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare type: string;

  @column()
  declare title: string;

  @column()
  declare body: string;

  @column()
  declare isRead: boolean;

  @column()
  declare isSystem: boolean;

  @column()
  declare navigate: string | null;

  @column()
  declare userId: number;

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;
}
