import Order from '#models/order';
import type { HttpContext } from '@adonisjs/core/http';
import Paypal from '#services/payment/paypal';
import notification_service from '#services/notification_service';
import StripePayment from '#services/payment/stripe';
import PaymentMethod from '#models/payment_method';
import transmit from '@adonisjs/transmit/services/main';

export default class PaymentsController {
  private async getMethodConfig(key: string) {
    const methodConfig = await PaymentMethod.query().where('key', key).first();
    if (!methodConfig) {
      throw new Error('Payment method is not active. Please contact support');
    }
    return methodConfig;
  }

  /**
   * @swagger
   * /payments/paypal/success:
   *   get:
   *     summary: Capture PayPal payment (success callback)
   *     tags: [Payments]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: query
   *         name: token
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       302:
   *         description: Redirects to confirmation or orders page
   */
  public async capturePayPalOrder({ request, response, auth }: HttpContext) {
    const { token } = request.qs();
    try {
      const order = await Order.query()
        .whereRaw("JSON_EXTRACT(payment_info, '$.id') = ?", [token])
        .firstOrFail();

      const methodConfig = await this.getMethodConfig('paypal');

      const paypal = new Paypal(methodConfig);

      const pollPaymentStatus = async () => {
        for (let i = 0; i < 5; i++) {
          const capture = await paypal.capturePaypalPayment(token);
          if (capture.status === 'COMPLETED') {
            order
              .merge({
                paymentStatus: true,
                paymentInfo: JSON.stringify(capture.result),
                status: 'processing',
              })
              .save();

            await notification_service.sendNewOrderNotification(auth.user!, order);
            return true;
          }
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        return false;
      };

      const success = await pollPaymentStatus();

      if (!success) {
        await order.merge({ paymentStatus: false, status: 'failed' }).save();
        transmit.broadcast('orders', { success: true });
        return response.redirect('/user/my-orders?status=failed');
      }
      transmit.broadcast('orders', { success: true });
      return response.redirect('/confirm');
    } catch (error) {
      console.error('Error capturing PayPal order:', error);
      return response.redirect('/user/my-orders');
    }
  }

  /**
   * @swagger
   * /payments/paypal/cancel:
   *   get:
   *     summary: Cancel PayPal payment
   *     tags: [Payments]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: query
   *         name: token
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       302:
   *         description: Redirects to orders page
   */
  public async cancelPaypalOrder({ request, response }: HttpContext) {
    const { token } = request.qs();
    try {
      const order = await Order.query()
        .whereRaw("JSON_EXTRACT(payment_info, '$.id') = ?", [token])
        .firstOrFail();
      if (order.status === 'completed' || order.paymentStatus === 'paid') {
        return response.redirect('/user/my-orders');
      }
      await order.merge({ paymentStatus: 'unpaid', status: 'failed' }).save();
      transmit.broadcast('orders', { success: true });
      return response.redirect('/user/my-orders?status=failed');
    } catch (error) {
      console.error('Error canceling paypal order:', error);
      return response.redirect('/user/my-orders');
    }
  }

  /**
   * @swagger
   * /payments/stripe/success:
   *   get:
   *     summary: Retrieve Stripe payment session (success callback)
   *     tags: [Payments]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: query
   *         name: session_id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       302:
   *         description: Redirects to confirmation or orders page
   */
  public async retrieveStripeSession({ request, response, auth }: HttpContext) {
    const { session_id: sessionId } = request.qs();
    try {
      const order = await Order.query()
        .whereRaw("JSON_EXTRACT(payment_info, '$.id') = ?", [sessionId])
        .firstOrFail();

      if (order.status === 'completed' || order.paymentStatus === 'paid') {
        return response.redirect('/user/my-orders');
      }

      const methodConfig = await this.getMethodConfig('stripe');

      const stripe = new StripePayment(methodConfig);

      const pollPaymentStatus = async () => {
        for (let i = 0; i < 5; i++) {
          const session = await stripe.retrieveSession(sessionId);
          if (session.status === 'complete' && session.payment_status === 'paid') {
            order
              .merge({
                paymentStatus: 'paid',
                paymentInfo: JSON.stringify(session),
                status: 'client_confirmed',
              })
              .save();

            await notification_service.sendNewOrderNotification(auth.user!, order);
            return true;
          }
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        return false;
      };

      const success = await pollPaymentStatus();

      if (!success) {
        await order.merge({ paymentStatus: 'unpaid', status: 'failed' }).save();
        transmit.broadcast('orders', { success: true });
        return response.redirect('/user/my-orders');
      }
      transmit.broadcast('orders', { success: true });
      return response.redirect('/confirm');
    } catch (error) {
      return response.redirect('/user/my-orders');
    }
  }

  /**
   * @swagger
   * /payments/stripe/cancel:
   *   get:
   *     summary: Cancel Stripe payment session
   *     tags: [Payments]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: query
   *         name: session_id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       302:
   *         description: Redirects to orders page
   */
  public async cancelStripeSession({ request, response }: HttpContext) {
    const { session_id: sessionId } = request.qs();
    try {
      const order = await Order.query()
        .whereRaw("JSON_EXTRACT(payment_info, '$.id') = ?", [sessionId])
        .firstOrFail();

      if (order.status === 'completed' || order.paymentStatus === 'paid') {
        return response.redirect('/user/my-orders');
      }

      const methodConfig = await this.getMethodConfig('stripe');

      const stripe = new StripePayment(methodConfig);
      const session = await stripe.expireSession(sessionId);
      if (session.status === 'expired' && session.payment_status === 'unpaid') {
        transmit.broadcast('orders', { success: true });
        await order.merge({ paymentStatus: 'unpaid', status: 'failed' }).save();
      }
      transmit.broadcast('orders', { success: true });
      return response.redirect('/user/my-orders?status=failed');
    } catch (error) {
      console.error('Error retrieving Stripe session:', error);
      return response.redirect('/user/my-orders');
    }
  }
}
