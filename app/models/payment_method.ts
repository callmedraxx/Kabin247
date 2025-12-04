import { DateTime } from 'luxon';
import { BaseModel, column } from '@adonisjs/lucid/orm';
import { attachment } from '@jrmc/adonis-attachment';
import type { Attachment } from '@jrmc/adonis-attachment/types/attachment';
import { Filterable } from 'adonis-lucid-filter';
import { compose } from '@adonisjs/core/helpers';
import PaymentMethodFilter from './filters/payment_method_filter.js';

export default class PaymentMethod extends compose(BaseModel, Filterable) {
  static $filter = () => PaymentMethodFilter;

  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare name: string;

  @column()
  declare key: string;

  @column()
  declare status: boolean;

  @attachment({
    preComputeUrl: true,
  })
  declare logo: Attachment | null;

  @column()
  declare public: string | null;

  @column()
  declare secret: string | null;

  @column()
  declare webhook: string | null;

  @column()
  declare mode: string | null;

  @column()
  declare currencies: string | null;

  @column()
  declare countries: string | null;

  @column()
  declare extraParams: string | null;

  @column()
  declare config: string | null;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;
}
