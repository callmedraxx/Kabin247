import errorHandler from '#exceptions/error_handler';
import Order from '#models/order';
import OrderItem from '#models/order_item';
import type { HttpContext } from '@adonisjs/core/http';
import { DateTime } from 'luxon';
import Roles from '../enum/roles.js';
import User from '#models/user';

interface EarningChartReport {
  period: string;
  totalEarnings: number;
  charges: { name: string; total: number }[];
  totalTax: number;
}

interface OrderChartReport {
  period: string;
  counts?: {
    completed: number;
    canceled: number;
    failed: number;
  };
  totalOrders?: number;
  countsByType?: Record<string, number>;
  mostOrderedMenuItem?: {
    menuItem: any;
    count: number;
  } | null;
  deliveryManOrderCounts?: {
    deliveryMan: {
      id: number;
      fullName: string;
      email: string;
    };
    count: number;
  }[];
}

export default class ReportsController {
  private async generateReport({
    year,
    type,
    reportName,
  }: {
    year: number;
    type: 'week' | 'year';
    reportName: 'earning' | 'order';
  }) {
    const isWeekly = type === 'week';
    const earningReports: EarningChartReport[] = [];
    const orderReports: OrderChartReport[] = [];

    const start = isWeekly
      ? DateTime.now().startOf('week')
      : DateTime.fromObject({ year, month: 1, day: 1 }).startOf('year');
    const intervals = isWeekly ? 7 : 12;
    const intervalUnit = isWeekly ? 'day' : 'month';

    for (let i = 0; i < intervals; i++) {
      const unformatStart = start.plus({ [intervalUnit]: i });
      const startInterval = unformatStart.toSQL({ includeOffset: false });
      const endInterval = unformatStart.endOf(intervalUnit).toSQL({ includeOffset: false });

      if (!startInterval || !endInterval) {
        throw new Error('Invalid year');
      }

      if (reportName === 'earning') {
        const orders = await Order.query()
          .where('status', 'completed')
          .whereBetween('createdAt', [startInterval, endInterval])
          .preload('orderCharges');

        let totalEarnings = 0;
        let totalTax = 0;
        const chargesMap: { [key: string]: number } = {};

        orders.forEach((order) => {
          totalEarnings += order.grandTotal;

          order.orderCharges.forEach((charge) => {
            if (charge.type === 'tax') {
              totalTax += charge.amount;
            } else {
              chargesMap[charge.name] = (chargesMap[charge.name] || 0) + charge.amount;
            }
          });
        });

        const charges = Object.entries(chargesMap).map(([name, total]) => ({ name, total }));
        earningReports.push({
          period: isWeekly ? unformatStart.toFormat('cccc') : unformatStart.toFormat('MMMM'),
          totalEarnings,
          charges,
          totalTax,
        });
      }
      if (reportName === 'order') {
        const orderCountsByStatus = await Order.query()
          .whereIn('status', ['completed', 'canceled', 'failed'])
          .whereBetween('createdAt', [startInterval, endInterval])
          .select('status')
          .count('* as count')
          .groupBy('status');

        const orderCountsByType = await Order.query()
          .whereIn('status', ['completed', 'canceled', 'failed'])
          .whereBetween('createdAt', [startInterval, endInterval])
          .select('type')
          .count('* as count')
          .groupBy('type');

        const totalOrdersCount = await Order.query()
          .whereBetween('createdAt', [startInterval, endInterval])
          .count('* as count')
          .first();

        const mostOrderedMenuItem = await OrderItem.query()
          .whereBetween('createdAt', [startInterval, endInterval])
          .select('menuItemId')
          .preload('menuItem')
          .count('* as count')
          .groupBy('menuItemId')
          .orderBy('count', 'desc')
          .first();

        const deliveryManOrderCounts = await User.query()
          .where('roleId', Roles.DELIVERY)
          .andWhere('isSuspended', false)
          .preload('deliveryOrders', (query) => {
            query.whereBetween('createdAt', [startInterval, endInterval]);
          })
          .select('id', 'firstName', 'lastName', 'email')
          .withCount('deliveryOrders')
          .orderBy('deliveryOrders_count', 'desc');

        let completedCount = 0;
        let canceledCount = 0;
        let failedCount = 0;

        orderCountsByStatus.forEach((order) => {
          switch (order.status) {
            case 'completed':
              completedCount = order.$extras.count;
              break;
            case 'cancelled_not_billable':
              canceledCount = order.$extras.count;
              break;
            case 'cancelled_billable':
              failedCount = order.$extras.count;
              break;
          }
        });

        const countsByType: Record<string, number> = {};
        orderCountsByType.forEach((order) => {
          countsByType[order.type] = order.$extras.count;
        });

        orderReports.push({
          period: isWeekly ? unformatStart.toFormat('cccc') : unformatStart.toFormat('MMMM'),
          counts: {
            completed: completedCount,
            canceled: canceledCount,
            failed: failedCount,
          },
          totalOrders: totalOrdersCount ? totalOrdersCount.$extras.count : 0,
          countsByType,
          mostOrderedMenuItem: mostOrderedMenuItem
            ? {
                menuItem: mostOrderedMenuItem.menuItem,
                count: mostOrderedMenuItem.$extras.count,
              }
            : null,
          deliveryManOrderCounts: deliveryManOrderCounts.map((item) => ({
            deliveryMan: {
              id: item.id,
              fullName: item.fullName,
              email: item.email,
            },
            count: item.$extras.deliveryOrders_count,
          })),
        });
      }
    }

    return reportName === 'earning' ? earningReports : orderReports;
  }

  /**
   * @swagger
   * /api/reports/order-chart:
   *   get:
   *     summary: Get order count chart data
   *     tags: [Reports]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: query
   *         name: year
   *         schema:
   *           type: integer
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [week, year]
   *     responses:
   *       200:
   *         description: Order count chart data
   */
  async orderCountChart({ logger, request, response }: HttpContext) {
    const { year, type } = request.qs();
    try {
      const currentYear = year || DateTime.now().year;
      const reportType = type === 'week' ? 'week' : 'year';

      const mostOrderedMenuItemAllTime = await OrderItem.query()
        .select('menuItemId')
        .preload('menuItem')
        .count('* as count')
        .groupBy('menuItemId')
        .orderBy('count', 'desc')
        .first();

      const reports = await this.generateReport({
        year: currentYear,
        type: reportType,
        reportName: 'order',
      });

      return response.json({ type: reportType, currentYear, mostOrderedMenuItemAllTime, reports });
    } catch (error) {
      errorHandler(error, response, logger, 'Order Count Chart Error');
    }
  }

  /**
   * @swagger
   * /api/reports/earning-chart:
   *   get:
   *     summary: Get earning report chart data
   *     tags: [Reports]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: query
   *         name: year
   *         schema:
   *           type: integer
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [week, year]
   *     responses:
   *       200:
   *         description: Earning report chart data
   */
  async earningReportChart({ logger, request, response }: HttpContext) {
    const { year, type } = request.qs();
    try {
      const currentYear = year || DateTime.now().year;
      const reportType = type === 'week' ? 'week' : 'year';

      const reports = await this.generateReport({
        year: currentYear,
        type: reportType,
        reportName: 'earning',
      });

      return response.json({ type: reportType, currentYear, reports });
    } catch (error) {
      errorHandler(error, response, logger, 'Earning Report Chart Error');
    }
  }
}
