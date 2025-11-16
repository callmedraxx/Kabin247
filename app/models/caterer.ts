import { DateTime } from 'luxon';
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm';
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations';
import Airport from '#models/airport';
import Order from '#models/order';

export default class Caterer extends BaseModel {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare name: string;

  @column()
  declare email: string | null;

  @column()
  declare phone: string | null;

  @column()
  declare iataCode: string | null;

  @column()
  declare icaoCode: string | null;

  @column()
  declare timeZone: string | null;

  @column()
  declare airportId: number | null;

  @column()
  declare isActive: boolean;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;

  @belongsTo(() => Airport)
  declare airport: BelongsTo<typeof Airport>;

  @hasMany(() => Order, { foreignKey: 'catererId' })
  declare orders: HasMany<typeof Order>;
}
