import errorHandler from '#exceptions/error_handler';
import Order from '#models/order';
import type { HttpContext } from '@adonisjs/core/http';
import StripePayment from '#services/payment/stripe';
import Paypal from '#services/payment/paypal';
import PaymentMethod from '#models/payment_method';

export default class WebhooksController {
  async stripe({ logger, request, response }: HttpContext) {
    try {
      const sig = request.header('stripe-signature');
      const reqBody = request.body();
      const sessionId = reqBody.data.object.id;
      const body = request.raw();

      if (!body) {
        throw new Error('Raw body not found!');
      }

      const order = await Order.query()
        .whereRaw("JSON_EXTRACT(payment_info, '$.id') = ?", [sessionId])
        .firstOrFail();

      if (order.paymentStatus === 'paid' || order.status === 'completed') {
        return response.json({ success: true, message: 'Already payment completed' });
      }

      const methodConfig = await PaymentMethod.query().where('key', 'stripe').first();
      if (!methodConfig) {
        throw new Error('Payment method is not active. Please contact support');
      }

      const stripe = new StripePayment(methodConfig);
      const event = await stripe.webhookConstructEvent(body, sig || '', methodConfig.webhook || '');

      if (event.type === 'checkout.session.completed') {
        const session = await stripe.retrieveSession(sessionId);
        if (session.status === 'complete' && session.payment_status === 'paid') {
          order
            .merge({
              paymentStatus: 'paid',
              paymentInfo: JSON.stringify(session),
            })
            .save();
          return response.json({ success: true });
        }
      }
      return response.abort({ success: false, message: 'Failed' });
    } catch (error) {
      errorHandler(error, response, logger, 'Stripe Webhook Error');
    }
  }

  async paypal({ logger, request, response }: HttpContext) {
    try {
      const payload = request.body();
      const transmissionID = request.header('paypal-transmission-id');
      const transmissionTime = request.header('paypal-transmission-time');
      const certURL = request.header('paypal-cert-url');
      const authAlgo = request.header('paypal-auth-algo');
      const transmissionSig = request.header('paypal-transmission-sig');

      const order = await Order.query()
        .whereRaw("JSON_EXTRACT(payment_info, '$.id') = ?", [payload.resource.id])
        .firstOrFail();

      if (order.paymentStatus === 'paid' || order.status === 'completed') {
        return response.json({ success: true, message: 'Already payment completed' });
      }

      const methodConfig = await PaymentMethod.query().where('key', 'paypal').first();
      if (!methodConfig) {
        throw new Error('Payment method is not active. Please contact support');
      }

      const body = {
        transmission_id: transmissionID,
        transmission_time: transmissionTime,
        cert_url: certURL,
        auth_algo: authAlgo,
        transmission_sig: transmissionSig,
        webhook_id: methodConfig.webhook,
        webhook_event: payload,
      };

      const paypal = new Paypal(methodConfig);
      const responseData = await paypal.verifyWebhookSignature(body);

      if (responseData.verification_status !== 'SUCCESS') {
        return response.abort({
          success: false,
          message: 'Paypal Webhook Error, payload verification failure.',
        });
      }

      if (payload.event_type === 'CHECKOUT.ORDER.APPROVED') {
        order
          .merge({
            paymentStatus: 'paid',
            paymentInfo: JSON.stringify({ ...payload.resource }),
          })
          .save();
        return response.json({ success: true });
      }
      return response.abort({ success: false, message: 'Failed' });
    } catch (error) {
      errorHandler(error, response, logger, 'Paypal Webhook Error');
    }
  }
}
