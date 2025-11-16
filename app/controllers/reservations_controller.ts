import errorHandler from '#exceptions/error_handler';
import Reservation from '#models/reservation';
import notification_service from '#services/notification_service';
import {
  bulkCustomUpdateValidator,
  bulkDeleteValidator,
  customUpdateValidator,
  reservationValidator,
} from '#validators/reservation';
import type { HttpContext } from '@adonisjs/core/http';
import { DateTime } from 'luxon';
import { stringify } from 'csv-stringify/sync';

export default class ReservationsController {
  /**
   * @swagger
   * /api/reservations:
   *   get:
   *     summary: Get reservations
   *     tags: [Reservations]
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
   *     responses:
   *       200:
   *         description: List of reservations
   */
  async index({ logger, request, response }: HttpContext) {
    const { listType, page, limit, ...input } = request.qs();
    try {
      const data = await Reservation.filter(input)
        .if(listType, (query) => {
          if (listType === 'active') return query.where('status', 'booked');
          if (listType === 'history') return query.whereIn('status', ['cancelled', 'completed']);
        })
        .preload('user')
        .orderBy('reservationDate', 'desc')
        .paginate(page || 1, limit || 10);
      return response.json(data);
    } catch (error) {
      errorHandler(error, response, logger, 'Index reservation Error');
    }
  }

  /**
   * @swagger
   * /api/reservations/export/all:
   *   get:
   *     summary: Export reservations to CSV
   *     tags: [Reservations]
   *     security:
   *       - sessionAuth: []
   *     responses:
   *       200:
   *         description: CSV file download
   */
  async exportReservations({ logger, request, response }: HttpContext) {
    const { listType, page, limit, ...input } = request.qs();
    try {
      const reservations = await Reservation.filter(input)
        .if(listType, (query) => {
          if (listType === 'active') return query.where('status', 'booked');
          if (listType === 'history') return query.whereIn('status', ['cancelled', 'completed']);
        })
        .preload('user')
        .orderBy('reservationDate', 'desc');

      const csvHeaders = [
        'Reservation Date',
        'Client Name',
        'Start Time',
        'End Time',
        'People',
        'Table Number',
        'Status',
      ];

      const csvRows = reservations.map((reservation) => [
        reservation.reservationDate?.toLocaleString(),
        reservation.user.fullName,
        reservation.startTime,
        reservation.endTime,
        reservation.numberOfPeople,
        reservation.tableNumber,
        reservation.status,
      ]);

      const csvData = stringify([csvHeaders, ...csvRows], { header: false });
      response.header('Content-Type', 'text/csv');
      response.header('Content-Disposition', `attachment; filename="reservations.csv"`);
      response.send(csvData);
    } catch (error) {
      errorHandler(error, response, logger, 'Export Reservations Error');
    }
  }

  /**
   * @swagger
   * /api/reservations:
   *   post:
   *     summary: Create reservation
   *     tags: [Reservations]
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
   *         description: Reservation created successfully
   */
  async store({ logger, request, response, auth }: HttpContext) {
    try {
      const payload = await request.validateUsing(reservationValidator);
      const reservation = await Reservation.create({
        reservationNote: payload.reservationNote || '',
        reservationDate: DateTime.fromISO(payload.reservationDate).toSQL({ includeOffset: false }),
        numberOfPeople: payload.numberOfPeople,
        tableNumber: payload.tableNumber,
        startTime: payload.startTime,
        endTime: payload.endTime,
        userId: payload.userId,
      });

      await notification_service.sendCreateReservationNotification(reservation, auth.user!);
      return response.created({
        success: true,
        message: 'Reservation created successfully',
        content: reservation,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Storing reservations Error');
    }
  }

  /**
   * @swagger
   * /api/reservations/{id}:
   *   put:
   *     summary: Update reservation
   *     tags: [Reservations]
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
   *         description: Reservation updated successfully
   */
  async update({ logger, request, response }: HttpContext) {
    const { id } = request.params();
    try {
      const payload = await request.validateUsing(reservationValidator);
      const reservation = await Reservation.findOrFail(id);
      reservation.merge({
        ...payload,
        reservationDate: DateTime.fromISO(payload.reservationDate).toSQL({ includeOffset: false }),
      });
      await reservation.save();
      return response.created({
        success: true,
        message: 'Reservation updated successfully',
        content: reservation,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Updating reservation Error');
    }
  }

  /**
   * @swagger
   * /api/reservations/{id}:
   *   patch:
   *     summary: Partially update reservation
   *     tags: [Reservations]
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
   *         description: Reservation updated successfully
   */
  async customUpdate({ logger, request, response, params, auth }: HttpContext) {
    try {
      const payload = await request.validateUsing(customUpdateValidator);
      const reservation = await Reservation.findOrFail(params.id);
      const previousStatus = reservation.status;
      await reservation.merge(payload).save();

      if (payload.status && previousStatus !== payload.status) {
        await notification_service.sendReservationStatusUpdateNotification(reservation, auth.user!);
      }
      return response.ok({
        success: true,
        message: 'Changes saved successfully.',
        content: reservation,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Custom Fields Updating Error');
    }
  }

  /**
   * @swagger
   * /api/reservations/bulk/update:
   *   patch:
   *     summary: Bulk update reservations
   *     tags: [Reservations]
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
   *         description: Reservations updated successfully
   */
  async bulkCustomUpdate({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(bulkCustomUpdateValidator);
      const { ids, ...restPayload } = payload;
      await Reservation.query().whereIn('id', ids).update(restPayload);

      return response.ok({ success: true, message: 'Reservations changes saved successfully.' });
    } catch (error) {
      errorHandler(error, response, logger, 'Bulk Custom Fields Updating Error');
    }
  }

  /**
   * @swagger
   * /api/reservations/{id}:
   *   delete:
   *     summary: Delete reservation
   *     tags: [Reservations]
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
   *         description: Reservation deleted successfully
   */
  async delete({ logger, request, response }: HttpContext) {
    const { id } = request.params();
    try {
      const reservation = await Reservation.findOrFail(id);
      await reservation.delete();
      return response.json({ success: true, message: 'Reservation deleted successfully' });
    } catch (error) {
      errorHandler(error, response, logger, 'Deleting reservation Error');
    }
  }

  /**
   * @swagger
   * /api/reservations/bulk/delete:
   *   delete:
   *     summary: Bulk delete reservations
   *     tags: [Reservations]
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
   *         description: Reservations deleted successfully
   */
  async bulkDelete({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(bulkDeleteValidator);
      await Reservation.query().whereIn('id', payload.ids).delete();

      return response.ok({ success: true, message: 'Reservations deleted successfully.' });
    } catch (error) {
      errorHandler(error, response, logger, 'Bulk Reservations Deleting Error');
    }
  }
}
