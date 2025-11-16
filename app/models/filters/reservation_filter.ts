import { BaseModelFilter } from 'adonis-lucid-filter';
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model';
import Reservation from '#models/reservation';
import { DateTime } from 'luxon';

export default class ReservationFilter extends BaseModelFilter {
  declare $query: ModelQueryBuilderContract<typeof Reservation>;

  tableNumber(value: string): void {
    this.$query.where('tableNumber', value);
  }

  status(value: string): void {
    this.$query.where('status', value);
  }

  reservationDate(value: string): void {
    const formattedDate = DateTime.fromISO(value).toISODate();
    if (formattedDate) {
      this.$query.whereRaw('DATE(reservation_date) = ?', [formattedDate]);
    }
  }

  search(value: string): void {
    this.$query.where((builder) => {
      builder.whereHas('user', (query) => {
        query.where('firstName', 'LIKE', `%${value}%`).orWhere('lastName', 'LIKE', `%${value}%`);
      });
    });
  }
}
