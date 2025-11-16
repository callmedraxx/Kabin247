import { BaseModelFilter } from 'adonis-lucid-filter';
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model';
import User from '#models/user';

export default class UserFilter extends BaseModelFilter {
  declare $query: ModelQueryBuilderContract<typeof User>;

  suspended(value: string): void {
    if (value === 'true') {
      this.$query.where('isSuspended', true);
    }

    if (value === 'false') {
      this.$query.where('isSuspended', false);
    }
  }

  emailVerified(value: string): void {
    if (value === 'true') {
      this.$query.where('isEmailVerified', true);
    }

    if (value === 'false') {
      this.$query.where('isEmailVerified', false);
    }
  }

  search(value: string): void {
    this.$query.where((builder) => {
      builder
        .where('firstName', 'LIKE', `%${value}%`)
        .orWhere('lastName', 'LIKE', `%${value}%`)
        .orWhere('companyName', 'LIKE', `%${value}%`)
        .orWhere('email', 'LIKE', `%${value}%`)
        .orWhere('secondEmail', 'LIKE', `%${value}%`)
        .orWhere('phoneNumber', 'LIKE', `${value}`)
        .orWhere('secondPhoneNumber', 'LIKE', `${value}`)
        .orWhere('clientAddress', 'LIKE', `%${value}%`);
    });
  }
}
