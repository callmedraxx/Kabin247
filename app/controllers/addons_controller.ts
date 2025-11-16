import Addon from '#models/addon';
import {
  addonValidator,
  bulkDeleteValidator,
  customUpdateValidator,
  bulkCustomUpdateValidator,
} from '#validators/addon';
import type { HttpContext } from '@adonisjs/core/http';
import errorHandler from '#exceptions/error_handler';
import Roles from '../enum/roles.js';
import { attachmentManager } from '@jrmc/adonis-attachment';


export default class AddonsController {
  /**
   * @swagger
   * /api/user/addons/:
   *   get:
   *     summary: Get addons (user)
   *     tags: [Addons]
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
   *         description: List of addons
   * /api/addons:
   *   get:
   *     summary: Get addons (admin)
   *     tags: [Addons]
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
   *         description: List of addons
   */
  async index({ logger, request, response, auth }: HttpContext) {
    const { page, limit, ...input } = request.qs();
    try {
      const dataQuery = (Addon as any).$filter(input)
        .if(auth.user!.roleId === Roles.CUSTOMER, (query: any) => {
          query.where('isAvailable', true);
        })
        .orderBy('createdAt', 'desc');
      const data = page && limit ? await dataQuery.paginate(page, limit) : await dataQuery.exec();
      return response.json(data);
    } catch (error) {
      errorHandler(error, response, logger, 'Index Error');
    }
  }

  /**
   * @swagger
   * /api/user/addons/{id}:
   *   get:
   *     summary: Get addon by ID (user)
   *     tags: [Addons]
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
   *         description: Addon details
   * /api/addons/{id}:
   *   get:
   *     summary: Get addon by ID (admin)
   *     tags: [Addons]
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
   *         description: Addon details
   */
  async getById({ logger, request, response, auth }: HttpContext) {
    const { id } = request.params();
    try {
      const data = await (Addon as any).query()
        .if(auth.user!.roleId === Roles.CUSTOMER, (query: any) => {
          query.where('isAvailable', true);
        })
        .where('id', id)
        .firstOrFail();
      return response.json(data);
    } catch (error) {
      errorHandler(error, response, logger, 'Get By Id Error');
    }
  }

  /**
   * @swagger
   * /api/addons:
   *   post:
   *     summary: Create addon
   *     tags: [Addons]
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
   *         description: Addon created successfully
   */
  async store({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(addonValidator);
      const { image, ...restPayload } = payload;
      const processedImage = image ? await attachmentManager.createFromFile(image) : null;
      const addon = await (Addon as any).create({ image: processedImage, ...restPayload });
      return response.created({
        success: true,
        message: 'Addon created successfully',
        content: addon,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Storing Error');
    }
  }

  /**
   * @swagger
   * /api/addons/{id}:
   *   put:
   *     summary: Update addon
   *     tags: [Addons]
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
   *         description: Addon updated successfully
   */
  async update({ logger, request, response, params }: HttpContext) {
    try {
      const addon = await (Addon as any).query().where('id', params.id).firstOrFail();
      const payload = await request.validateUsing(addonValidator);
      const { image, ...restPayload } = payload;
      await addon.merge(restPayload).save();
      if (image) {
        addon.image = await attachmentManager.createFromFile(image);
      }
      await addon.save();

      return response.ok({ success: true, message: 'Addon updated successfully', content: addon });
    } catch (error) {
      errorHandler(error, response, logger, 'Update Error');
    }
  }

  /**
   * @swagger
   * /api/addons/{id}:
   *   patch:
   *     summary: Partially update addon
   *     tags: [Addons]
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
   *         description: Addon updated successfully
   */
  async customUpdate({ logger, request, response, params }: HttpContext) {
    try {
      const payload = await request.validateUsing(customUpdateValidator);
      const addon = await (Addon as any).query().where('id', params.id).firstOrFail();
      await addon.merge(payload).save();

      return response.ok({ success: true, message: 'Changes saved successfully.', content: addon });
    } catch (error) {
      errorHandler(error, response, logger, 'Custom Update error');
    }
  }

  /**
   * @swagger
   * /api/addons/{id}:
   *   delete:
   *     summary: Delete addon
   *     tags: [Addons]
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
   *         description: Addon deleted successfully
   */
  async delete({ logger, request, response }: HttpContext) {
    const { id } = request.params();
    try {
      const data = await (Addon as any).query().where('id', id).firstOrFail();
      await data.delete();
      return response.ok({ success: true, message: 'Addon deleted successfully.' });
    } catch (error) {
      errorHandler(error, response, logger, 'Deleting Error');
    }
  }

  /**
   * @swagger
   * /api/addons/bulk/delete:
   *   delete:
   *     summary: Bulk delete addons
   *     tags: [Addons]
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
   *         description: Addons deleted successfully
   */
  async bulkDelete({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(bulkDeleteValidator);
      await (Addon as any).query().whereIn('id', payload.ids).delete();

      return response.ok({ success: true, message: 'Addons deleted successfully.' });
    } catch (error) {
      errorHandler(error, response, logger, 'Bulk Deleting Error');
    }
  }

  /**
   * @swagger
   * /api/addons/bulk/update:
   *   patch:
   *     summary: Bulk update addons
   *     tags: [Addons]
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
   *         description: Addons updated successfully
   */
  async bulkCustomUpdate({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(bulkCustomUpdateValidator);
      const { ids, ...restPayload } = payload;
      await (Addon as any).query().whereIn('id', ids).update(restPayload);

      return response.ok({ success: true, message: 'Addons changes saved successfully.' });
    } catch (error) {
      errorHandler(error, response, logger, 'Bulk Custom Update Error');
    }
  }
}
