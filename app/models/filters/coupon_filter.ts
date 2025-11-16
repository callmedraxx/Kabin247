import { BaseModelFilter } from 'adonis-lucid-filter';
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model';
import Coupon from '#models/coupon';
import { DateTime } from 'luxon';

export default class CouponFilter extends BaseModelFilter {
  declare $query: ModelQueryBuilderContract<typeof Coupon>;

  type(value: string): void {
    this.$query.where('type', value);
  }

  validFrom(value: string): void {
    const formattedDate = DateTime.fromISO(value).toISODate();
    if (formattedDate) {
      this.$query.whereRaw('DATE(valid_from) = ?', [formattedDate]);
    }
  }

  validUntil(value: string): void {
    const formattedDate = DateTime.fromISO(value).toISODate();
    if (formattedDate) {
      this.$query.whereRaw('DATE(valid_until) = ?', [formattedDate]);
    }
  }

  available(value: string): void {
    if (value === 'true') {
      this.$query.where('isAvailable', true);
    }

    if (value === 'false') {
      this.$query.where('isAvailable', false);
    }
  }

  search(value: string): void {
    this.$query.where((builder) => {
      builder.where('name', 'LIKE', `%${value}%`).orWhere('code', 'LIKE', `%${value}%`);
    });
  }
}
