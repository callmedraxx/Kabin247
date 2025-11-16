import PaymentMethod from '#models/payment_method';
import { BaseSeeder } from '@adonisjs/lucid/seeders';
import {
  paypalSupportedCountry,
  paypalSupportedCurrency,
  stripeSupportedCountry,
  stripeSupportedCurrency,
} from '../../app/utils/payment_method_data.js';

export default class extends BaseSeeder {
  async run() {
    await PaymentMethod.createMany([
      {
        key: 'paypal',
        name: 'Paypal',
        status: true,
        public: process.env.PAYPAL_CLIENT_ID || '',
        secret: process.env.PAYPAL_CLIENT_SECRET || '',
        webhook: process.env.PAYPAL_WEBHOOK_ID || '',
        countries: JSON.stringify(paypalSupportedCountry),
        currencies: JSON.stringify(paypalSupportedCurrency),
        mode: 'sandbox',
        config: JSON.stringify({
          fields: [
            { label: 'Client ID', name: 'public', required: true, type: 'text' },
            { label: 'Client Secret', name: 'secret', required: true, type: 'text' },
            { label: 'Webhook Id', name: 'webhook', required: true, type: 'text' },
            {
              label: 'Sandbox Mode',
              name: 'mode',
              required: true,
              type: 'radio_group',
              options: [
                {
                  label: 'Sandbox',
                  value: 'sandbox',
                },
                {
                  label: 'Live',
                  value: 'live',
                },
              ],
            },
          ],
        }),
      },
      {
        key: 'stripe',
        name: 'Stripe',
        status: true,
        public: process.env.STRIPE_PUBLIC_KEY || '',
        secret: process.env.STRIPE_SECRET_KEY || '',
        webhook: process.env.STRIPE_WEBHOOK_SECRET || '',
        countries: JSON.stringify(stripeSupportedCountry),
        currencies: JSON.stringify(stripeSupportedCurrency),
        config: JSON.stringify({
          fields: [
            { label: 'Public Key', name: 'public', required: true, type: 'text' },
            { label: 'Secret Key', name: 'secret', required: true, type: 'text' },
            { label: 'Webhook Secret', name: 'webhook', required: true, type: 'text' },
          ],
        }),
      },
    ]);
  }
}
