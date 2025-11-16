import { DateTime } from 'luxon';
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import User from '#models/user';
import { compose } from '@adonisjs/core/helpers';
import { Filterable } from 'adonis-lucid-filter';
import ReservationFilter from '#models/filters/reservation_filter';

export default class Reservation extends compose(BaseModel, Filterable) {
  static $filter = () => ReservationFilter;

  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare userId: number;

  @column()
  declare reservationDate: DateTime | string | null;

  @column()
  declare reservationNote: string | null;

  @column()
  declare numberOfPeople: number;

  @column()
  declare tableNumber: string;

  @column()
  declare startTime: string;

  @column()
  declare endTime: string;

  @column()
  declare status: 'booked' | 'cancelled' | 'completed';

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>;
}
