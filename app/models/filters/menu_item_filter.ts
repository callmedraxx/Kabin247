import { BaseModelFilter } from 'adonis-lucid-filter';
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model';
import MenuItem from '#models/menu_item';

export default class MenuItemFilter extends BaseModelFilter {
  declare $query: ModelQueryBuilderContract<typeof MenuItem>;

  if(condition: boolean, callback: (query: ModelQueryBuilderContract<typeof MenuItem>) => void): void {
    if (condition) {
      callback(this.$query);
    }
  }

  discountType(value: string): void {
    this.$query.where('discountType', value);
  }

  category(value: string): void {
    this.$query.where('categoryId', value);
  }

  foodType(value: string): void {
    this.$query.where('foodType', value);
  }

  recommended(value: string): void {
    if (value === 'true') {
      this.$query.where('isRecommended', true);
    }

    if (value === 'false') {
      this.$query.where('isRecommended', false);
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
    this.$query.where('name', 'LIKE', `%${value}%`);
  }
}
