import Setting from '#models/setting';
import { BaseSeeder } from '@adonisjs/lucid/seeders';

export default class extends BaseSeeder {
  async run() {
    await Setting.createMany([
      {
        key: 'branding',
        value1: 'http://localhost:8000',
        value5: JSON.stringify([
          {
            code: 'en',
            name: 'English',
          },
          {
            code: 'fr',
            name: 'French',
          },
        ]),
      },
      {
        key: 'theme',
        value5: JSON.stringify({ default: {} }),
      },
      {
        key: 'cash',
        status: true,
      },
      {
        key: 'card',
        status: true,
      },
      {
        key: 'digital',
        status: true,
      },
    ]);
  }
}
