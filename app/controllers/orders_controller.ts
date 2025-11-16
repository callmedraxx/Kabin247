import errorHandler from '#exceptions/error_handler';
import Order from '#models/order';
import {
  bulkCustomUpdateValidator,
  customUpdateValidator,
  orderCalculationValidator,
  orderUpdateValidator,
  orderValidator,
} from '#validators/order';
import type { HttpContext } from '@adonisjs/core/http';
import { DateTime } from 'luxon';
import Roles from '../enum/roles.js';
import BusinessSetup from '#models/business_setup';
import notification_service from '#services/notification_service';
import { stringify } from 'csv-stringify/sync';
import Setting from '#models/setting';
import Paypal from '#services/payment/paypal';
import StripePayment from '#services/payment/stripe';
import PaymentMethod from '#models/payment_method';
import transmit from '@adonisjs/transmit/services/main';
import mail from '@adonisjs/mail/services/main';

type OrderItemType = {
  id: number;
  name?: string | null;
  description?: string | null;
  price: number;
  quantity: number;
  total?: number;
  subTotal?: number;
  discount?: number;
  discountType?: 'amount' | 'percentage';
  image?: {
    url?: string;
  } | null;
  addons?: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    image?: {
      url?: string;
    } | null;
  }>;
  variants?: Array<{
    id: number;
    name: string;
    price?: number;
    option: Array<{
      id: number;
      name: string;
      price: number;
      variantId: number;
    }>;
  }>;
};

export default class OrdersController {
  /**
   * @swagger
   * /api/user/orders:
   *   get:
   *     summary: Get user's orders
   *     tags: [Orders]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: List of user orders
   */
  async index({ logger, request, response, auth }: HttpContext) {
    const { page, limit, ...input } = request.qs();
    try {
      const dataQuery = Order.filter(input)
        .where('userId', auth.user!.id)
        .preload('orderItems', (query) => {
          query.preload('menuItem');
        })
        .preload('deliveryMan')
        .preload('orderCharges')
        .orderBy('createdAt', 'desc');
      const data = page && limit ? await dataQuery.paginate(page, limit) : await dataQuery.exec();
      return response.json(data);
    } catch (error) {
      errorHandler(error, response, logger, 'Index Order Error');
    }
  }

  /**
   * @swagger
   * /api/orders/:
   *   get:
   *     summary: Get all orders (admin)
   *     tags: [Orders]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: query
   *         name: listType
   *         schema:
   *           type: string
   *           enum: [active, history]
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date-time
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date-time
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of orders
   */
  async adminIndex({ logger, request, response, auth }: HttpContext) {
    const { listType, page, limit, startDate, endDate, search, searchFields, ...input } = request.qs();
    try {
      if (listType === 'history' && auth.user!.roleId === Roles.DISPLAY) {
        return response.badRequest({
          success: false,
          message: 'You have no permission to view this page',
        });
      }

      const searchQuery = search ? search.toLowerCase() : '';

      let parsedStartDate: DateTime | null = null;
      let parsedEndDate: DateTime | null = null;

      if (typeof startDate === 'string') {
        parsedStartDate = DateTime.fromISO(startDate);
        if (!parsedStartDate.isValid) {
          return response.badRequest({
            success: false,
            message: 'Invalid start date format',
          });
        }
      }

      if (typeof endDate === 'string') {
        parsedEndDate = DateTime.fromISO(endDate);
        if (!parsedEndDate.isValid) {
          return response.badRequest({
            success: false,
            message: 'Invalid end date format',
          });
        }
      }

      const dataQuery = Order.filter(input)
        .if(listType, (query) => {
          if (listType === 'active')
            return query.whereIn('status', ['quote_pending', 'quote_sent', 'awaiting_vendor_quote', 'awaiting_vendor_confirmation', 'vendor_confirmed', 'awaiting_client_confirmation', 'client_confirmed']);
          if (listType === 'history')
            return query.whereIn('status', ['out_for_delivery', 'completed', 'cancelled_not_billable', 'cancelled_billable']);
        })
        .if(searchQuery, (query) => {
          return query.where((builder) => {
            builder.whereHas('deliveryMan', (q) => {
              q.whereRaw('LOWER(first_name) LIKE ?', [`%${searchQuery}%`])
                .orWhereRaw('LOWER(last_name) LIKE ?', [`%${searchQuery}%`]);
            })
              .orWhereHas('deliveryAirport', (q) => {
                q.whereRaw('LOWER(name) LIKE ?', [`%${searchQuery}%`])
                  .orWhereRaw('LOWER(fbo_name) LIKE ?', [`%${searchQuery}%`])
                  .orWhereRaw('LOWER(iata_code) LIKE ?', [`%${searchQuery}%`])
                  .orWhereRaw('LOWER(icao_code) LIKE ?', [`%${searchQuery}%`]);
              })
              .orWhereHas('user', (q) => {
                q.whereRaw('LOWER(first_name) LIKE ?', [`%${searchQuery}%`])
                  .orWhereRaw('LOWER(last_name) LIKE ?', [`%${searchQuery}%`]);
              })
              .orWhereRaw('LOWER(order_number) LIKE ?', [`%${searchQuery}%`]);
          });
        })
        .if(Boolean(parsedStartDate) && Boolean(parsedEndDate), (query) => {
          if (parsedStartDate && parsedEndDate) {
            return query.whereBetween('createdAt', [
              parsedStartDate.startOf('day').toSQL() as string,
              parsedEndDate.endOf('day').toSQL() as string
            ]);
          }
          return query;
        })
        .if(Boolean(parsedStartDate) && !parsedEndDate, (query) => {
          if (parsedStartDate) {
            return query.where('createdAt', '>=', parsedStartDate.startOf('day').toSQL() as string);
          }
          return query;
        })
        .if(!parsedStartDate && Boolean(parsedEndDate), (query) => {
          if (parsedEndDate) {
            return query.where('createdAt', '<=', parsedEndDate.endOf('day').toSQL() as string);
          }
          return query;
        })
        .preload('user')
        .preload('orderItems', (query) => {
          query.preload('menuItem');
        })
        .preload('deliveryMan', (query) => {
          query.preload('airport');
        })
        .preload('deliveryAirport')
        .preload('orderCharges')
        .orderBy('createdAt', 'desc');
      const data = page && limit ? await dataQuery.paginate(page, limit) : await dataQuery.exec();
      return response.json(data);
    } catch (error) {
      errorHandler(error, response, logger, 'Admin Index Order Error');
    }
  }

  /**
   * @swagger
   * /api/orders/export/all:
   *   get:
   *     summary: Export orders to CSV
   *     tags: [Orders]
   *     security:
   *       - sessionAuth: []
   *     responses:
   *       200:
   *         description: CSV file download
   *         content:
   *           text/csv:
   *             schema:
   *               type: string
   */
  async exportOrders({ logger, request, response }: HttpContext) {
    const { page, limit, ...input } = request.qs();
    try {
      const orders = await Order.filter(input)
        .whereIn('status', ['out_for_delivery', 'completed', 'cancelled_not_billable', 'cancelled_billable'])
        .preload('user')
        .preload('orderItems', (query) => {
          query.preload('menuItem');
        })
        .preload('deliveryMan')
        .preload('orderCharges')
        .orderBy('createdAt', 'desc');

      const csvHeaders = [
        'Order Number',
        'Created On',
        'Client Name',
        'Type',
        'Total',
        'Payment',
        'Status',
      ];
      const csvRows = orders.map((order) => [
        order.orderNumber,
        DateTime.fromISO(order.createdAt?.toString() || '').toFormat('yyyy-MM-dd'),
        order?.user?.fullName || 'Guest User',
        order.type,
        order.grandTotal,
        order.paymentStatus,
        order.status,
      ]);

      const csvData = stringify([csvHeaders, ...csvRows], { header: false });
      response.header('Content-Type', 'text/csv');
      response.header('Content-Disposition', `attachment; filename="orders.csv"`);
      response.send(csvData);
    } catch (error) {
      errorHandler(error, response, logger, 'Export Order Error');
    }
  }

  /**
   * @swagger
   * /api/orders/count/status:
   *   get:
   *     summary: Get order status counts
   *     tags: [Orders]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: query
   *         name: timeframe
   *         schema:
   *           type: string
   *           default: lifetime
   *     responses:
   *       200:
   *         description: Order status counts
   */
  async orderStatusCount({ logger, request, response }: HttpContext) {
    const { timeframe = 'lifetime' } = request.qs();

    const days = timeframe === 'month' ? 30 : timeframe === 'week' ? 7 : 0;

    const startDate = DateTime.now().minus({ days }).startOf('day').toSQL();
    const endDate = DateTime.now().endOf('day').toSQL();

    try {
      const orderCounts = await Order.query()
        .if(timeframe !== 'lifetime', (query) => {
          query.whereBetween('createdAt', [startDate, endDate]);
        })
        .select('status')
        .count('* as count')
        .groupBy('status');

      const statusCounts = {
        quote_pending: 0,
        quote_sent: 0,
        awaiting_vendor_quote: 0,
        awaiting_vendor_confirmation: 0,
        vendor_confirmed: 0,
        awaiting_client_confirmation: 0,
        client_confirmed: 0,
        out_for_delivery: 0,
        completed: 0,
        cancelled_not_billable: 0,
        cancelled_billable: 0,
      };

      orderCounts.forEach((order) => {
        switch (order.status) {
          case 'quote_pending':
            statusCounts.quote_pending = order.$extras.count;
            break;
          case 'quote_sent':
            statusCounts.quote_sent = order.$extras.count;
            break;
          case 'awaiting_vendor_quote':
            statusCounts.awaiting_vendor_quote = order.$extras.count;
            break;
          case 'awaiting_vendor_confirmation':
            statusCounts.awaiting_vendor_confirmation = order.$extras.count;
            break;
          case 'vendor_confirmed':
            statusCounts.vendor_confirmed = order.$extras.count;
            break;
          case 'awaiting_client_confirmation':
            statusCounts.awaiting_client_confirmation = order.$extras.count;
            break;
          case 'client_confirmed':
            statusCounts.client_confirmed = order.$extras.count;
            break;
          case 'out_for_delivery':
            statusCounts.out_for_delivery = order.$extras.count;
            break;
          case 'completed':
            statusCounts.completed = order.$extras.count;
            break;
          case 'cancelled_not_billable':
            statusCounts.cancelled_not_billable = order.$extras.count;
            break;
          case 'cancelled_billable':
            statusCounts.cancelled_billable = order.$extras.count;
            break;
        }
      });

      return response.json({
        data: statusCounts,
        timeframe,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Order Status Count Error');
    }
  }

  /**
   * @swagger
   * /api/user/orders/{id}:
   *   get:
   *     summary: Get order by ID (user)
   *     tags: [Orders]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Order details
   * /api/orders/{id}:
   *   get:
   *     summary: Get order by ID (admin)
   *     tags: [Orders]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Order details
   */
  async getById({ logger, response, params }: HttpContext) {
    try {
      const data = await this.fetchOrderWithRelations(params.id);
      return response.json(data);
    } catch (error) {
      errorHandler(error, response, logger, 'Get Order By Id Error');
    }
  }

  /**
   * @swagger
   * /api/user/orders/{id}/generate-invoice:
   *   get:
   *     summary: Generate invoice for order (user)
   *     tags: [Orders]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: PDF invoice
   * /api/orders/{id}/generate-invoice:
   *   get:
   *     summary: Generate invoice for order (admin)
   *     tags: [Orders]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: PDF invoice
   */
  async generateInvoice({ logger, response, params, view, auth }: HttpContext) {
    try {
      const order = await this.fetchOrderWithRelations(params.id);

      if (auth?.user?.roleId === Roles.CUSTOMER && auth?.user.id !== order.userId) {
        return response.status(403).json({
          success: false,
          message: 'You have no permission to view this invoice',
        });
      }

      const safeParse = <T = any>(v: unknown, fallback: T): T => {
        if (v && typeof v === 'object') return v as T;
        if (typeof v === 'string') { try { return JSON.parse(v) as T; } catch {/* ignore */ } }
        return fallback;
      };
      const joinNames = (arr: any[]): string =>
        (Array.isArray(arr) ? arr : []).map((x) => (x?.name ?? 'N/A')).filter(Boolean).join(', ');

      const itemsForPrint = order.orderItems.map((row: any) => {
        const base = row.serialize({
          fields: {
            emit: [
              'name', 'description', 'price', 'quantity',
              'variantsAmount', 'addonsAmount', 'packaging',
            ],
          },
        });

        const variants = safeParse<any[]>(row.variants, []);
        const addons = safeParse<any[]>(row.addons, []);

        const variantLines: string[] = variants.map((v) => {
          const opts = v?.variantOptions ?? v?.option ?? [];
          const line = joinNames(opts);
          return line ? `- ${line}` : '';
        }).filter(Boolean);

        const addonLine = joinNames(addons);
        const unitCost =
          Number(base.price || 0) + Number(base.variantsAmount || 0) + Number(base.addonsAmount || 0);
        const itemCost = unitCost * Number(base.quantity || 0);

        return {
          name: base.name ?? 'N/A',
          description: base.description ?? '',
          packaging: base.packaging ?? 'N/A',
          quantity: Number(base.quantity || 0),
          unitCost: unitCost.toFixed(2),
          itemCost: itemCost.toFixed(2),
          variantLines,
          addonLine: addonLine || '',
        };
      });

      const orderCharges: Array<{ name: string; amount: number }> = [];
      (order?.orderCharges ?? []).forEach((c: any) => {
        const idx = orderCharges.findIndex((x) => x.name === c.name);
        const amount = Number(c?.amount || 0);
        if (idx === -1) orderCharges.push({ name: c?.name ?? 'Charge', amount });
        else orderCharges[idx].amount += amount;
      });

      const formattedDate = DateTime.fromISO(String(order.createdAt || '')).isValid
        ? DateTime.fromISO(String(order.createdAt)).toFormat('yyyy-MM-dd')
        : '';

      const businessSetup = await BusinessSetup.firstOrFail();
      const branding = await Setting.findBy('key', 'branding');

      return await view.render('invoice', {
        order,
        itemsForPrint,
        orderCharges,
        formattedDate,
        businessInfo: businessSetup,
        baseUrl: branding?.value1 || '',
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Print Invoice By Id Error');
    }
  }

  /**
   * @swagger
   * /api/user/orders/calculate:
   *   post:
   *     summary: Calculate order total
   *     tags: [Orders]
   *     security:
   *       - sessionAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Calculated order totals
   * /api/orders/calculate:
   *   post:
   *     summary: Calculate order total (admin)
   *     tags: [Orders]
   *     security:
   *       - sessionAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Calculated order totals
   */
  async calculate({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(orderCalculationValidator);
      const businessSetup = await BusinessSetup.firstOrFail();
      const deliveryCharge = payload.type === 'delivery' ? businessSetup.deliveryCharge : 0;
      const {
        total,
        totalQuantity,
        discount,
        totalTax,
        totalCharges,
        orderItemsData,
        chargesData,
      } = await this.processOrderItems(payload.orderItems);

      const grandTotal =
        total + totalTax + totalCharges + deliveryCharge - discount - (payload.manualDiscount || 0);

      if (grandTotal < 0) {
        return response.badRequest({
          success: false,
          message: "Grand total can't be less than zero",
        });
      }

      return response.json({
        total,
        totalQuantity,
        discount,
        manualDiscount: payload.manualDiscount,
        totalTax,
        totalCharges,
        deliveryCharge,
        grandTotal,
        orderItemsData,
        chargesData,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Calculating order Error');
    }
  }

  /**
   * @swagger
   * /api/user/orders:
   *   post:
   *     summary: Create new order (user)
   *     tags: [Orders]
   *     security:
   *       - sessionAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       201:
   *         description: Order created successfully
   * /api/orders:
   *   post:
   *     summary: Create new order (admin)
   *     tags: [Orders]
   *     security:
   *       - sessionAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       201:
   *         description: Order created successfully
   */
  async store({ logger, request, response, auth }: HttpContext) {
    try {
      const payload = await request.validateUsing(orderValidator);

      if (auth.user!.roleId === Roles.CUSTOMER && auth.user!.id !== payload.userId) {
        return response.badRequest({
          success: false,
          message: 'You have no permission to create this order',
        });
      }

      const { orderItems, deliveryDate, deliveryAirportId, deliveryManId, ...restPayload } = payload;

      console.log("--- payload for order creation --- : ", payload);
      const businessSetup = await BusinessSetup.firstOrFail();
      const deliveryCharge = payload.type === 'delivery' ? businessSetup.deliveryCharge : 0;
      const {
        total,
        totalQuantity,
        discount,
        totalTax,
        totalCharges,
        orderItemsData,
        chargesData,
      } = await this.processOrderItems(orderItems || []);

      let grandTotal =
        total + totalTax + totalCharges + deliveryCharge - discount - (payload.manualDiscount || 0);

      if (grandTotal < 0) {
        return response.badRequest({
          success: false,
          message: "Grand total can't be less than zero",
        });
      }

      const order = await Order.create({
        ...restPayload,
        deliveryDate,
        deliveryManId,
        deliveryAirportId,
        totalQuantity,
        total,
        totalTax,
        totalCharges,
        discount: discount,
        manualDiscount: payload.manualDiscount || 0,
        deliveryCharge,
        grandTotal,
      });

      await order.related('orderItems').createMany(orderItemsData);
      await order.related('orderCharges').createMany(chargesData);

      const data = await this.fetchOrderWithRelations(order.id);

      if (auth.user!.roleId === Roles.ADMIN && !['cash', 'card'].includes(payload.paymentType)) {
        const methodConfig = await PaymentMethod.query()
          .where('key', payload.paymentType)
          .andWhere('status', true)
          .first();
        if (!methodConfig) {
          await order.delete();
          return response.badRequest({ success: false, message: 'Payment method is not active' });
        }

        if (payload.paymentType === 'paypal') {
          const paypal = new Paypal(methodConfig);
          const paypalOrderData = await paypal.createPaypalOrder(data);
          if (!paypalOrderData) {
            await order.delete();
            return response.badRequest({
              success: false,
              message: 'Error in generating payment link',
            });
          }
          await data
            .merge({
              paymentInfo: JSON.stringify(paypalOrderData),
            })
            .save();
          const redirectUrl = paypalOrderData.links.find(
            (link: any) => link.rel === 'approve'
          ).href;
          return response.json({ success: true, redirectUrl });
        }

        if (payload.paymentType === 'stripe') {
          const stripe = new StripePayment(methodConfig);
          const sessionData = await stripe.createSession(data);
          if (!sessionData.url) {
            await order.delete();
            return response.badRequest({
              success: false,
              message: 'Error in generating payment link',
            });
          }
          await data
            .merge({
              paymentInfo: JSON.stringify(sessionData),
            })
            .save();
          return response.created({
            success: true,
            message: 'Order has been placed successfully',
            content: data,
          });
        }
      }

      await notification_service.sendNewOrderNotification(auth.user!, data);

      transmit.broadcast('orders', { success: true });
      return response.created({
        success: true,
        message: 'Order has been placed successfully',
        content: data,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Storing order Error');
    }
  }

  /**
   * @swagger
   * /api/orders/{id}:
   *   put:
   *     summary: Update order
   *     tags: [Orders]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Order updated successfully
   */
  async update({ logger, request, response, params }: HttpContext) {
    try {
      const order = await this.fetchOrderWithRelations(params.id);
      const previousStatus = order.status;
      const payload = await request.validateUsing(orderUpdateValidator);

      if (
        payload.status &&
        payload.status === 'completed' &&
        (order.paymentStatus === 'unpaid' || order.paymentStatus === 'payment_requested') &&
        (payload.paymentStatus === 'unpaid' || payload.paymentStatus === 'payment_requested' || !payload.paymentStatus)
      ) {
        return response.badRequest({
          success: false,
          message: `Order status can't be completed until paid!`,
        });
      }

      const { manualDiscount, orderItems, ...restPayload } = payload;

      if (orderItems) {
        const {
          total,
          totalQuantity,
          discount,
          totalTax,
          totalCharges,
          orderItemsData,
          chargesData,
        } = await this.processOrderItems(orderItems);

        await order.related('orderItems').query().delete();

        await order.related('orderItems').createMany(orderItemsData);

        await order.related('orderCharges').query().delete();

        await order.related('orderCharges').createMany(chargesData);

        order.merge({
          totalQuantity,
          total,
          totalTax,
          totalCharges,
          discount,
        });
      }

      order.merge(restPayload);

      if (payload.type !== 'delivery') {
        order.deliveryManId = null;
        order.grandTotal = (order.total || 0) - (order.deliveryCharge || 0);
        order.deliveryCharge = 0;
      }

      if (order.type !== 'delivery' && payload.type === 'delivery') {
        const businessSetup = await BusinessSetup.firstOrFail();
        const deliveryCharge = businessSetup.deliveryCharge;
        order.grandTotal = (order.total || 0) + deliveryCharge;
        order.deliveryCharge = deliveryCharge;
      }

      if (manualDiscount !== undefined && manualDiscount !== order.manualDiscount) {
        order.grandTotal = (order.total || 0) + (order.totalCharges || 0) - manualDiscount;
        order.manualDiscount = manualDiscount;
      }

      await order.save();

      if (payload.status && previousStatus !== payload.status) {
        await notification_service.sendOrderStatusNotification(order);
      }

      transmit.broadcast('orders', { success: true });
      return response.ok({
        success: true,
        message: 'Order updated successfully',
        content: order,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Updating Order Error');
    }
  }

  /**
   * @swagger
   * /api/orders/{id}:
   *   patch:
   *     summary: Partially update order
   *     tags: [Orders]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Order updated successfully
   */
  async customUpdate({ logger, request, response, params }: HttpContext) {
    try {
      const payload = await request.validateUsing(customUpdateValidator);
      const order = await this.fetchOrderWithRelations(params.id);
      if (payload.status && payload.status === 'completed' && (order.paymentStatus === 'unpaid' || order.paymentStatus === 'payment_requested')) {
        return response.badRequest({
          success: false,
          message: `Order status can't be completed until it is paid!`,
        });
      }
      await order.merge(payload).save();

      if (payload.status && order.status !== payload.status) {
        await notification_service.sendOrderStatusNotification(order);
      }

      if (
        payload.deliveryManId &&
        (!order.deliveryManId || payload.deliveryManId !== order.deliveryManId)
      ) {
        await notification_service.sendDeliveryManAssignedNotification(order);
      }

      transmit.broadcast('orders', { success: true });
      return response.ok({
        success: true,
        message: 'Order saved successfully.',
        content: order,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Custom Update error');
    }
  }

  /**
   * @swagger
   * /api/orders/bulk/update:
   *   patch:
   *     summary: Bulk update orders
   *     tags: [Orders]
   *     security:
   *       - sessionAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - ids
   *             properties:
   *               ids:
   *                 type: array
   *                 items:
   *                   type: string
   *     responses:
   *       200:
   *         description: Orders updated successfully
   */
  async bulkCustomUpdate({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(bulkCustomUpdateValidator);
      const { ids, ...restPayload } = payload;
      await Order.query().whereIn('id', ids).update(restPayload);
      transmit.broadcast('orders', { success: true });
      return response.ok({ success: true, message: 'Order changes saved successfully.' });
    } catch (error) {
      errorHandler(error, response, logger, 'Bulk custom update error');
    }
  }

  /**
   * @swagger
   * /api/orders/{id}:
   *   delete:
   *     summary: Delete order
   *     tags: [Orders]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Order deleted successfully
   */
  async delete({ logger, request, response }: HttpContext) {
    const { id } = request.params();
    try {
      const order = await Order.findOrFail(id);
      await order.delete();
      transmit.broadcast('orders', { success: true });
      return response.json({ success: true, message: 'Order deleted successfully' });
    } catch (error) {
      errorHandler(error, response, logger, 'Deleting error');
    }
  }

  /**
   * @swagger
   * /api/orders/{id}/notify/{target}:
   *   post:
   *     summary: Send notification for order
   *     tags: [Orders]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: target
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Notification sent successfully
   */
  async notify({ logger, params, response, view }: HttpContext) {
    try {
      const { id, target } = params as { id: number; target: 'client' | 'caterer' };
      if (!['client', 'caterer'].includes(target)) {
        return response.badRequest({ success: false, message: 'Invalid target' });
      }

      const order = await this.fetchOrderWithRelations(id);

      const businessInfo = await BusinessSetup.firstOrFail();
      const brandingSetting = await Setting.findBy('key', 'branding');
      const baseUrl = brandingSetting?.value1 || '';
      const formattedDate = DateTime.fromISO(String(order.createdAt || '')).isValid
        ? DateTime.fromISO(String(order.createdAt)).toFormat('yyyy-MM-dd')
        : '';

      if (target === 'client') {
        const { itemsForPrint, orderCharges } = await this.buildInvoiceData(order);
        const html = await view.render('invoice', {
          order,
          itemsForPrint,
          orderCharges,
          formattedDate,
          businessInfo,
          baseUrl,
        });

        await mail.send((message) => {
          message
            .to(order.user?.email!)
            .from(process.env.SMTP_EMAIL!, businessInfo.name || '')
            .subject('Your Order Invoice')
            .html(html);
        });

        return response.ok({ success: true, message: 'Invoice emailed to client.' });
      }

      const html = await view.render('emails/caterer_order_brief', {
        order,
        businessInfo,
        baseUrl,
        formattedDate,
        items: (order.orderItems || []).map((it: any) => ({
          name: it.name || it.menuItem?.name || 'Item',
          qty: it.quantity || 0,
          packaging: it.packaging || 'N/A',
          variants: safeList(it.variants),
          addons: safeList(it.addons),
        })),
      });

      const catererEmail = order.deliveryMan?.email;
      if (!catererEmail || order.type !== 'delivery') {
        return response.badRequest({
          success: false,
          message: 'Caterer email not found or order is not delivery type',
        });
      }

      await mail.send((message) => {
        message
          .to(catererEmail)
          .from(process.env.SMTP_EMAIL!, businessInfo.name || '')
          .subject('New Catering Order Details')
          .html(html);
      });

      return response.ok({ success: true, message: 'Order brief emailed to caterer.' });
    } catch (error) {
      errorHandler(error, response, logger, 'Notify Order Error');
    }

    function safeList(v: any): string[] {
      try {
        const arr = typeof v === 'string' ? JSON.parse(v) : v;
        if (!Array.isArray(arr)) return [];
        const names: string[] = [];
        arr.forEach((x: any) => {
          if (Array.isArray(x?.option)) x.option.forEach((o: any) => o?.name && names.push(o.name));
          if (x?.name) names.push(x.name);
        });
        return names;
      } catch { return []; }
    }
  }

  private async processOrderItems(orderItems: OrderItemType[]) {
    let total = 0;
    let totalQuantity = 0;
    let discount = 0;
    let totalTax = 0;
    let totalCharges = 0;

    const orderItemsData: any[] = [];
    const chargesData: any[] = [];

    if (orderItems) {
      for (const item of orderItems) {
        let itemTotal = item.price * item.quantity;
        let itemDiscount = 0;

        if (item.discount) {
          if (item.discountType === 'percentage') {
            itemDiscount = (itemTotal * item.discount) / 100;
          } else {
            itemDiscount = item.discount;
          }
        }

        let addonTotal = 0;
        if (item.addons && item.addons.length > 0) {
          addonTotal = item.addons.reduce((sum, addon) => sum + (addon.price * addon.quantity), 0);
        }

        let variantTotal = 0;
        if (item.variants && item.variants.length > 0) {
          variantTotal = item.variants.reduce((sum, variant) => {
            return sum + variant.option.reduce((optSum, opt) => optSum + opt.price, 0);
          }, 0);
        }

        const itemData: any = {};

        if (item.name !== undefined) itemData.name = item.name;
        if (item.description !== undefined) itemData.description = item.description;
        if (item.price !== undefined) itemData.price = item.price;
        if (item.quantity !== undefined) itemData.quantity = item.quantity;

        itemData.variants = JSON.stringify(item.variants || []);
        itemData.addons = JSON.stringify(item.addons || []);
        itemData.charges = JSON.stringify([]);

        if (addonTotal) itemData.addonsAmount = addonTotal;
        if (variantTotal) itemData.variantsAmount = variantTotal;
        if (itemDiscount) itemData.discountAmount = itemDiscount;

        if (item.price > 999999999 || item.quantity > 999999) {
          throw new Error('Price or quantity is too large');
        }

        if (item.price !== undefined && item.quantity !== undefined) {
          const subtotal = itemTotal + addonTotal + variantTotal - itemDiscount;
          const calculatedGrandPrice = subtotal * item.quantity;

          // Validate calculated values
          if (subtotal > 999999999 || calculatedGrandPrice > 999999999) {
            throw new Error('Calculated total exceeds maximum allowed value');
          }

          itemData.total_price = subtotal;
          itemData.grand_price = calculatedGrandPrice;
        }

        total += itemTotal + addonTotal + variantTotal;
        discount += itemDiscount;
        totalQuantity += item.quantity;

        orderItemsData.push(itemData);
      }
    }

    return { total, totalQuantity, discount, totalTax, totalCharges, orderItemsData, chargesData };
  }

  private async buildInvoiceData(order: any) {
    const safeParse = <T = any>(v: unknown, fallback: T): T => {
      if (v && typeof v === 'object') return v as T;
      if (typeof v === 'string') { try { return JSON.parse(v) as T; } catch { } }
      return fallback;
    };
    const joinNames = (arr: any[]): string =>
      (Array.isArray(arr) ? arr : []).map((x) => (x?.name ?? 'N/A')).filter(Boolean).join(', ');

    const itemsForPrint = (order.orderItems || []).map((row: any) => {
      const base = row.serialize
        ? row.serialize({ fields: { emit: ['name', 'description', 'price', 'quantity', 'variantsAmount', 'addonsAmount', 'packaging'] } })
        : row;

      const variants = safeParse<any[]>(row.variants, []);
      const addons = safeParse<any[]>(row.addons, []);

      const variantLines: string[] = variants.map((v) => {
        const opts = v?.variantOptions ?? v?.option ?? [];
        const line = joinNames(opts);
        return line ? `- ${line}` : '';
      }).filter(Boolean);

      const addonLine = joinNames(addons);
      const unitCost =
        Number(base.price || 0) + Number(base.variantsAmount || 0) + Number(base.addonsAmount || 0);
      const itemCost = unitCost * Number(base.quantity || 0);

      return {
        name: base.name ?? 'N/A',
        description: base.description ?? '',
        packaging: base.packaging ?? 'N/A',
        quantity: Number(base.quantity || 0),
        unitCost: unitCost.toFixed(2),
        itemCost: itemCost.toFixed(2),
        variantLines,
        addonLine: addonLine || '',
      };
    });

    const orderCharges: Array<{ name: string; amount: number }> = [];
    (order?.orderCharges ?? []).forEach((c: any) => {
      const idx = orderCharges.findIndex((x) => x.name === c.name);
      const amount = Number(c?.amount || 0);
      if (idx === -1) orderCharges.push({ name: c?.name ?? 'Charge', amount });
      else orderCharges[idx].amount += amount;
    });

    return { itemsForPrint, orderCharges };
  }



  private async fetchOrderWithRelations(orderId: number) {
    return Order.query()
      .preload('user')
      .preload('orderItems', (query) => {
        query.preload('menuItem');
      })
      .preload('deliveryMan')
      .preload('deliveryAirport')
      .preload('orderCharges')
      .where('id', orderId)
      .firstOrFail();
  }
}
