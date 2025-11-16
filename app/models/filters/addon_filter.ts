import { BaseModelFilter } from 'adonis-lucid-filter';
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model';
import Addon from '#models/addon';

export default class AddonFilter extends BaseModelFilter {
  declare $query: ModelQueryBuilderContract<typeof Addon>;

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
