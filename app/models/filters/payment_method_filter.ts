import { BaseModelFilter } from 'adonis-lucid-filter';
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model';
import PaymentMethod from '#models/payment_method';

export default class PaymentMethodFilter extends BaseModelFilter {
  declare $query: ModelQueryBuilderContract<typeof PaymentMethod>;

  name(value: string): void {
    this.$query.where('name', value);
  }
}
