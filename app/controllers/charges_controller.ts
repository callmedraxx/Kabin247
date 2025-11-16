import Charge from '#models/charge';
import {
  bulkDeleteValidator,
  bulkCustomUpdateValidator,
  chargeValidator,
  customUpdateValidator,
} from '#validators/charge';
import type { HttpContext } from '@adonisjs/core/http';
import Roles from '../enum/roles.js';
import errorHandler from '#exceptions/error_handler';

export default class ChargesController {
  /**
   * @swagger
   * /api/user/charges:
   *   get:
   *     summary: Get charges (user)
   *     tags: [Charges]
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
   *         description: List of charges
   * /api/charges:
   *   get:
   *     summary: Get charges (admin)
   *     tags: [Charges]
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
   *         description: List of charges
   */
  async index({ logger, request, response, auth }: HttpContext) {
    const { page, limit, ...input } = request.qs();
    try {
      const dataQuery = (Charge.filter(input) as any)
        .if(auth.user!.roleId === Roles.CUSTOMER, (query: any) => {
          query.where('isAvailable', true);
        })
        .preload('menuItems')
        .orderBy('createdAt', 'desc');
      const data = page && limit ? await dataQuery.paginate(page, limit) : await dataQuery.exec();
      return response.json(data);
    } catch (error) {
      errorHandler(error, response, logger, 'Index Charges Error');
    }
  }

  /**
   * @swagger
   * /api/user/charges/{id}:
   *   get:
   *     summary: Get charge by ID (user)
   *     tags: [Charges]
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
   *         description: Charge details
   * /api/charges/{id}:
   *   get:
   *     summary: Get charge by ID (admin)
   *     tags: [Charges]
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
   *         description: Charge details
   */
  async getById({ logger, request, response, auth }: HttpContext) {
    const { id } = request.params();
    try {
      const data = await (Charge.query() as any)
        .if(auth.user!.roleId === Roles.CUSTOMER, (query: any) => {
          query.where('isAvailable', true);
        })
        .where('id', id)
        .preload('menuItems')
        .firstOrFail();
      return response.json(data);
    } catch (error) {
      errorHandler(error, response, logger, 'Get By Id Error');
    }
  }

  /**
   * @swagger
   * /api/charges:
   *   post:
   *     summary: Create charge
   *     tags: [Charges]
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
   *         description: Charge created successfully
   */
  async store({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(chargeValidator);
      const charge = await Charge.create(payload);

      return response.created({
        success: true,
        message: 'Charge created successfully',
        content: charge,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Storing charge Error');
    }
  }

  /**
   * @swagger
   * /api/charges/{id}:
   *   put:
   *     summary: Update charge
   *     tags: [Charges]
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
   *         description: Charge updated successfully
   */
  async update({ logger, request, response, params }: HttpContext) {
    try {
      const charge = await Charge.findOrFail(params.id);
      const payload = await request.validateUsing(chargeValidator);
      await charge.merge(payload).save();

      return response.ok({
        success: true,
        message: 'Charge updated successfully',
        content: charge,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Updating charge Error');
    }
  }

  /**
   * @swagger
   * /api/charges/{id}:
   *   patch:
   *     summary: Partially update charge
   *     tags: [Charges]
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
   *         description: Charge updated successfully
   */
  async customUpdate({ logger, request, response, params }: HttpContext) {
    try {
      const payload = await request.validateUsing(customUpdateValidator);
      const charges = await Charge.findOrFail(params.id);
      await charges.merge(payload).save();

      return response.ok({
        success: true,
        message: 'Changes saved successfully.',
        content: charges,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Custom Update error');
    }
  }

  /**
   * @swagger
   * /api/charges/bulk/update:
   *   patch:
   *     summary: Bulk update charges
   *     tags: [Charges]
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
   *         description: Charges updated successfully
   */
  async bulkCustomUpdate({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(bulkCustomUpdateValidator);
      const { ids, ...restPayload } = payload;
      await Charge.query().whereIn('id', ids).update(restPayload);

      return response.ok({ success: true, message: 'Charges changes saved successfully.' });
    } catch (error) {
      errorHandler(error, response, logger, 'Bulk custom update error');
    }
  }

  /**
   * @swagger
   * /api/charges/{id}:
   *   delete:
   *     summary: Delete charge
   *     tags: [Charges]
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
   *         description: Charge deleted successfully
   */
  async delete({ logger, request, response }: HttpContext) {
    const { id } = request.params();
    try {
      const data = await Charge.findOrFail(id);
      await data.delete();
      return response.json({ success: true, message: 'Charge deleted successfully' });
    } catch (error) {
      errorHandler(error, response, logger, 'Deleting error');
    }
  }

  /**
   * @swagger
   * /api/charges/bulk/delete:
   *   delete:
   *     summary: Bulk delete charges
   *     tags: [Charges]
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
   *         description: Charges deleted successfully
   */
  async bulkDelete({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(bulkDeleteValidator);
      await Charge.query().whereIn('id', payload.ids).delete();

      return response.ok({ success: true, message: 'Charges deleted successfully.' });
    } catch (error) {
      errorHandler(error, response, logger, 'Bulk Deleting error');
    }
  }
}
