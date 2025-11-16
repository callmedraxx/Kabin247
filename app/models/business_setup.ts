import { DateTime } from 'luxon';
import { BaseModel, column } from '@adonisjs/lucid/orm';
import { attachment } from '@jrmc/adonis-attachment';
import type { Attachment } from '@jrmc/adonis-attachment/types/attachment';

export default class BusinessSetup extends BaseModel {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare name: string | null;

  @column()
  declare email: string | null;

  @column()
  declare phone: string | null;

  @column()
  declare address: string | null;

  @column()
  declare country: string | null;

  @column()
  declare timeZone: string;

  @column()
  declare timeFormat: '12_format' | '24_format';

  @column()
  declare maintenanceMode: boolean;

  @column()
  declare dineIn: boolean;

  @column()
  declare delivery: boolean;

  @column()
  declare pickup: boolean;

  @column()
  declare deliveryCharge: number;

  @column()
  declare currencyCode: string;

  @column()
  declare currencySymbolPosition: 'left' | 'right';

  @column()
  declare guestCheckout: boolean;

  @column()
  declare loginOnlyVerifiedEmail: boolean;

  @column()
  declare sortCategories: 'priority_number' | 'alphabetical_order';

  @attachment({ preComputeUrl: true })
  declare logo: Attachment | null;

  @attachment({ preComputeUrl: true })
  declare minimizedLogo: Attachment | null;

  @attachment({ preComputeUrl: true })
  declare favicon: Attachment | null;

  @column()
  declare theme: string | null;

  @column()
  declare companySlogan: string | null;

  @column()
  declare copyrightText: string | null;

  @column()
  declare facebook: string | null;

  @column()
  declare instagram: string | null;

  @column()
  declare twitter: string | null;

  @attachment({ preComputeUrl: true })
  declare aboutUsImage: Attachment | null;

  @column()
  declare aboutUsHeading: string | null;

  @column()
  declare aboutUsDescription: string | null;

  @attachment({ preComputeUrl: true })
  declare contactUsImage: Attachment | null;

  @column()
  declare termsAndConditions: string | null;

  @column()
  declare privacyPolicy: string | null;

  @column()
  declare returnPolicy: string | null;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;
}
