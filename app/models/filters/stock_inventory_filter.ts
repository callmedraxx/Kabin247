import { BaseModelFilter } from 'adonis-lucid-filter';
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model';
import StockInventory from '#models/stock_inventory';

export default class StockInventoryFilter extends BaseModelFilter {
  declare $query: ModelQueryBuilderContract<typeof StockInventory>;

  category(value: string): void {
    this.$query.where('category', value);
  }

  isActive(value: string): void {
    if (value === 'true') {
      this.$query.where('isActive', true);
    }

    if (value === 'false') {
      this.$query.where('isActive', false);
    }
  }

  search(value: string): void {
    this.$query.where('name', 'LIKE', `%${value}%`);
  }
}

