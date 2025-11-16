import Order from '#models/order';
import PaymentMethod from '#models/payment_method';
import Stripe from 'stripe';
import convertStripeCurrency from '../../utils/convert_stripe_currency.js';
import useBranding from '#services/use_branding';

class StripePayment {
  stripe: Stripe;
  constructor(stripeConfig: PaymentMethod) {
    this.stripe = new Stripe(stripeConfig.secret || '');
  }

  async createSession(order: Order) {
    try {
      const branding = await useBranding();
      if (!branding?.siteUrl) {
        throw new Error('Base URL configuration error');
      }
      const session = await this.stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: branding.business.currencyCode?.toLowerCase(),
              product_data: {
                name: order.orderNumber,
              },
              unit_amount: convertStripeCurrency(branding.business.currencyCode, order.grandTotal),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        metadata: {
          orderNumber: order.orderNumber,
        },
        success_url: `${branding.siteUrl}/payments/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${branding.siteUrl}/payments/stripe/cancel?session_id={CHECKOUT_SESSION_ID}`,
      });

      return session;
    } catch (error) {
      throw new Error(error);
    }
  }

  async retrieveSession(sessionId: string) {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      return session;
    } catch (error) {
      throw new Error(error);
    }
  }
  async expireSession(sessionId: string) {
    try {
      const session = await this.stripe.checkout.sessions.expire(sessionId);
      return session;
    } catch (error) {
      throw new Error(error);
    }
  }
  async webhookConstructEvent(body: string, sig: string, secret: string) {
    try {
      const event = this.stripe.webhooks.constructEvent(body, sig, secret);
      return event;
    } catch (error) {
      throw new Error(error);
    }
  }
}

export default StripePayment;
