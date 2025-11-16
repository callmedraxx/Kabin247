import { BaseModelFilter } from 'adonis-lucid-filter';
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model';
import Category from '#models/category';

export default class CategoryFilter extends BaseModelFilter {
  declare $query: ModelQueryBuilderContract<typeof Category>;

  priority(value: string): void {
    this.$query.where('priority', value);
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
