import errorHandler from '#exceptions/error_handler';
import Setting from '#models/setting';
import { updateThemeValidator, updatePaymentOptionsValidator } from '#validators/setting';
import type { HttpContext } from '@adonisjs/core/http';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export default class SettingsController {
  /**
   * @swagger
   * /api/settings/get-payment-options:
   *   get:
   *     summary: Get payment options
   *     tags: [Settings]
   *     security:
   *       - sessionAuth: []
   *     responses:
   *       200:
   *         description: List of payment options
   */
  async getPaymentOptions({ logger, response }: HttpContext) {
    try {
      const optionArray = ['cash', 'card', 'digital'];
      const data = await Setting.query().whereIn('key', optionArray);
      const paymentOptions = data.map((ele) => {
        return {
          name: ele.key,
          status: ele.status,
        };
      });
      return response.json(paymentOptions);
    } catch (error) {
      errorHandler(error, response, logger, 'getPaymentOptions Error');
    }
  }

  /**
   * @swagger
   * /api/settings/payment-method:
   *   put:
   *     summary: Update payment method options
   *     tags: [Settings]
   *     security:
   *       - sessionAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - status
   *             properties:
   *               name:
   *                 type: string
   *                 enum: [cash, card, digital]
   *               status:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Payment options updated successfully
   */
  async updatePaymentOptions({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(updatePaymentOptionsValidator);
      const data = await Setting.updateOrCreate(
        { key: payload.name },
        {
          status: payload.status,
        }
      );
      return response.ok({ success: true, message: 'Status updated Successfully!', content: data });
    } catch (error) {
      errorHandler(error, response, logger, 'updatePaymentOptions Error');
    }
  }

  /**
   * @swagger
   * /api/settings/theme:
   *   put:
   *     summary: Update theme settings
   *     tags: [Settings]
   *     security:
   *       - sessionAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - key
   *               - value
   *             properties:
   *               key:
   *                 type: string
   *               value:
   *                 type: object
   *     responses:
   *       200:
   *         description: Theme updated successfully
   */
  async updateTheme({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(updateThemeValidator);
      const data = await Setting.updateOrCreate(
        { key: payload.key },
        {
          value6: JSON.stringify(payload.value),
        }
      );
      return response.ok({
        success: true,
        message: 'Theme updated Successfully!',
        content: { key: data.key, value: data.value6 },
      });
    } catch (error) {
      errorHandler(error, response, logger, 'updateTheme Error');
    }
  }

  /**
   * @swagger
   * /api/settings/restore-default-theme:
   *   put:
   *     summary: Restore default theme
   *     tags: [Settings]
   *     security:
   *       - sessionAuth: []
   *     responses:
   *       200:
   *         description: Default theme restored successfully
   */
  async restoreDefaultTheme({ logger, response }: HttpContext) {
    try {
      const themePath = join(import.meta.dirname, '../../resources/json/theme.json');
      const theme = JSON.parse(readFileSync(themePath, 'utf-8'));
      const data = await Setting.updateOrCreate(
        { key: 'theme' },
        {
          value6: JSON.stringify(theme),
        }
      );
      return response.ok({
        success: true,
        message: 'Theme restored Successfully!',
        content: { key: data.key, value: data.value6 },
      });
    } catch (error) {
      errorHandler(error, response, logger, 'restoreDefaultTheme Error');
    }
  }
}
