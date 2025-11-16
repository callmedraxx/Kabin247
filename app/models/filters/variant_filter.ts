import { BaseModelFilter } from 'adonis-lucid-filter';
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model';
import Variant from '#models/variant';

export default class VariantFilter extends BaseModelFilter {
  declare $query: ModelQueryBuilderContract<typeof Variant>;

  allowMultiple(value: string): void {
    if (value === 'true') {
      this.$query.where('allowMultiple', true);
    }

    if (value === 'false') {
      this.$query.where('allowMultiple', false);
    }
  }

  requirement(value: string): void {
    this.$query.where('requirement', value);
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
