import errorHandler from '#exceptions/error_handler';
import Notification from '#models/notification';
import type { HttpContext } from '@adonisjs/core/http';

export default class NotificationsController {
  /**
   * @swagger
   * /notifications:
   *   get:
   *     summary: Get user notifications
   *     tags: [Notifications]
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
   *         description: List of notifications
   */
  async index({ logger, request, response, auth }: HttpContext) {
    try {
      const { page, limit } = request.qs();
      const data = await Notification.query()
        .where('userId', auth.user!.id)
        .orderBy('createdAt', 'desc')
        .paginate(page, limit);
      return response.json(data);
    } catch (error) {
      errorHandler(error, response, logger, 'Index Notification Error');
    }
  }

  /**
   * @swagger
   * /notifications/{id}:
   *   get:
   *     summary: Get notification by ID
   *     tags: [Notifications]
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
   *         description: Notification details
   */
  async getById({ logger, request, response, auth }: HttpContext) {
    try {
      const { id } = request.params();
      const data = await Notification.query()
        .where('id', id)
        .andWhere('userId', auth.user!.id)
        .firstOrFail();
      return response.json(data);
    } catch (error) {
      errorHandler(error, response, logger, 'GetById Notification Error');
    }
  }

  /**
   * @swagger
   * /notifications/count/unread-all:
   *   get:
   *     summary: Get unread notification count
   *     tags: [Notifications]
   *     security:
   *       - sessionAuth: []
   *     responses:
   *       200:
   *         description: Unread notification count
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 total:
   *                   type: integer
   */
  async unreadCount({ logger, response, auth }: HttpContext) {
    try {
      const count = await Notification.query()
        .where('userId', auth.user!.id)
        .andWhere('isRead', false)
        .count('* as total');

      return response.json({ total: count[0].$extras.total });
    } catch (error) {
      errorHandler(error, response, logger, ' Unread Count Notification Error');
    }
  }

  /**
   * @swagger
   * /notifications/{id}/mark-as-read:
   *   post:
   *     summary: Mark notification as read
   *     tags: [Notifications]
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
   *         description: Notification marked as read
   */
  async markAsRead({ logger, request, response, auth }: HttpContext) {
    try {
      const { id } = request.params();
      const data = await Notification.query()
        .where('id', id)
        .andWhere('userId', auth.user!.id)
        .firstOrFail();
      data.isRead = true;
      await data.save();
      return response.json(data);
    } catch (error) {
      errorHandler(error, response, logger, 'MarkAsRead Notification Error');
    }
  }

  /**
   * @swagger
   * /notifications/mark-all-as-read:
   *   post:
   *     summary: Mark all notifications as read
   *     tags: [Notifications]
   *     security:
   *       - sessionAuth: []
   *     responses:
   *       200:
   *         description: All notifications marked as read
   */
  async markAllAsRead({ logger, response, auth }: HttpContext) {
    try {
      await Notification.query().where('userId', auth.user!.id).update({ isRead: true });
      return response.json({ message: 'All notifications marked as read' });
    } catch (error) {
      errorHandler(error, response, logger, 'MarkAllAsRead Notification Error');
    }
  }
}
