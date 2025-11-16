import axios from 'axios';
import Order from '#models/order';
import PaymentMethod from '#models/payment_method';
import formatPrecision from '../../utils/format_precision.js';
import useBranding from '#services/use_branding';

class Paypal {
  clientId: string;
  clientSecret: string;
  paypalBaseUrl: string;

  constructor(paypalConfig: PaymentMethod) {
    this.clientId = paypalConfig.public || '';
    this.clientSecret = paypalConfig.secret || '';
    this.paypalBaseUrl =
      paypalConfig.mode === 'sandbox'
        ? 'https://api-m.sandbox.paypal.com'
        : 'https://api-m.paypal.com';
  }

  async generateAccessToken() {
    try {
      const response = await axios({
        url: this.paypalBaseUrl + '/v1/oauth2/token',
        method: 'post',
        data: 'grant_type=client_credentials',
        auth: {
          username: this.clientId,
          password: this.clientSecret,
        },
      });
      return response.data.access_token;
    } catch (error) {
      throw new Error(error);
    }
  }

  async createPaypalOrder(order: Order) {
    try {
      const branding = await useBranding();
      if (!branding?.siteUrl) {
        throw new Error('Base URL configuration error');
      }
      const accessToken = await this.generateAccessToken();
      const response = await axios({
        url: this.paypalBaseUrl + '/v2/checkout/orders',
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + accessToken,
        },
        data: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              reference_id: order.orderNumber,
              amount: {
                currency_code: branding.business.currencyCode?.toUpperCase(),
                value: formatPrecision(order.grandTotal),
              },
            },
          ],
          application_context: {
            return_url: branding.siteUrl + `/payments/paypal/success`,
            cancel_url: branding.siteUrl + `/payments/paypal/cancel`,
            shipping_preference: 'NO_SHIPPING',
            user_action: 'PAY_NOW',
            brand_name: branding.business?.name || '',
          },
        }),
      });
      return response.data;
    } catch (error) {
      throw new Error(error);
    }
  }

  async capturePaypalPayment(paypalOrderId: string) {
    try {
      const accessToken = await this.generateAccessToken();
      const response = await axios({
        url: this.paypalBaseUrl + `/v2/checkout/orders/${paypalOrderId}/capture`,
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + accessToken,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error);
    }
  }

  async verifyWebhookSignature(body: Record<string, any>) {
    try {
      const accessToken = await this.generateAccessToken();
      const response = await axios({
        url: this.paypalBaseUrl + '/v1/notifications/verify-webhook-signature',
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + accessToken,
        },
        data: JSON.stringify(body),
      });
      return response.data;
    } catch (error) {
      throw new Error(error);
    }
  }
}

export default Paypal;
