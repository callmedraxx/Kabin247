import { DateTime } from 'luxon';
import { BaseModel, column } from '@adonisjs/lucid/orm';

export default class Schedule extends BaseModel {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare day: string;

  @column()
  declare isOpen: boolean;

  @column()
  declare openingTime: string | null;

  @column()
  declare closingTime: string | null;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;
}
