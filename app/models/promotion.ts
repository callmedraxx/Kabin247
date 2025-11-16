import { DateTime } from 'luxon';
import { BaseModel, column } from '@adonisjs/lucid/orm';
import { attachment } from '@jrmc/adonis-attachment';
import type { Attachment } from '@jrmc/adonis-attachment/types/attachment';

// Fix: Remove Attachmentable from imports and composition
export default class Promotion extends BaseModel {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare type: 'slider' | 'welcome' | 'message';

  @attachment({ preComputeUrl: true })
  declare sliderImage: Attachment | null;

  @attachment({ preComputeUrl: true })
  declare welcomeImage: Attachment | null;

  @column()
  declare welcomeStatus: boolean;

  @column()
  declare message: string | null;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;
}