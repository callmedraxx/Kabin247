import { BaseModelFilter } from 'adonis-lucid-filter';
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model';
import Charge from '#models/charge';

export default class ChargeFilter extends BaseModelFilter {
  declare $query: ModelQueryBuilderContract<typeof Charge>;

  type(value: string): void {
    this.$query.where('type', value);
  }

  amountType(value: string): void {
    this.$query.where('amountType', value);
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
    this.$query.where('name', 'LIKE', `%${value}%`);
  }
}
