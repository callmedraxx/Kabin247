import { DateTime } from 'luxon';
import { BaseModel, column } from '@adonisjs/lucid/orm';
import { attachment } from '@jrmc/adonis-attachment';
import type { Attachment } from '@jrmc/adonis-attachment/types/attachment';

export default class Setting extends BaseModel {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare key: string;

  @column()
  declare status: boolean;

  @column()
  declare value1: string | null;

  @column()
  declare value2: string | null;

  @column()
  declare value3: string | null;

  @column()
  declare value4: string | null;

  @column()
  declare value5: string | null;

  @column()
  declare value6: any | null;

  @attachment({ preComputeUrl: true })
  declare file: Attachment | null;

  @attachment({ preComputeUrl: true })
  declare file2: Attachment | null;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;
}
