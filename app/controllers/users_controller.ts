import User from '#models/user';
import type { HttpContext } from '@adonisjs/core/http';
import Roles from '../enum/roles.js';
import string from '@adonisjs/core/helpers/string';
import {
  adminUserValidator,
  bulkCustomValidator,
  bulkDeleteValidator,
  customUpdateValidator,
  userProfileUpdateValidator,
  userUpdateValidator,
  userValidator,
} from '#validators/user';
import errorHandler from '#exceptions/error_handler';
import hash from '@adonisjs/core/services/hash';
import notification_service from '#services/notification_service';
import { stringify } from 'csv-stringify/sync';
import UserCreateNotification from '#mails/user_create_notification';
import mail from '@adonisjs/mail/services/main';
import useBranding from '#services/use_branding';

export default class UsersController {
  /**
   * @swagger
   * /api/users:
   *   get:
   *     summary: Get list of users
   *     tags: [Users]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *         description: Page number for pagination
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *         description: Number of items per page
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [customer, employee, delivery]
   *         description: Filter users by type
   *     responses:
   *       200:
   *         description: List of users
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   */
  async index({ logger, request, response }: HttpContext) {
    const { page, limit, type, ...input } = request.qs();
    try {
      const dataQuery = User.filter(input).preload('airport')
        .if(type, (query: any) => {
          if (type === 'customer') return query.where('roleId', Roles.CUSTOMER);
          if (type === 'employee')
            return query.whereNotIn('roleId', [Roles.CUSTOMER, Roles.DELIVERY]);
          if (type === 'delivery') return query.where('roleId', Roles.DELIVERY);
        })
        .orderBy('createdAt', 'desc');
      const data = page && limit ? await dataQuery.paginate(page, limit) : await dataQuery.exec();
      return response.json(data);
    } catch (error) {
      errorHandler(error, response, logger, 'Index Users Error');
    }
  }

  /**
   * @swagger
   * /api/users/export/all:
   *   get:
   *     summary: Export users to CSV
   *     tags: [Users]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [customer, delivery]
   *           default: customer
   *         description: Type of users to export
   *     responses:
   *       200:
   *         description: CSV file download
   *         content:
   *           text/csv:
   *             schema:
   *               type: string
   */
  async exportUsers({ logger, request, response }: HttpContext) {
    const { page, limit, type = 'customer', ...input } = request.qs();
    try {
      const users = await User.filter(input)
        .if(type, (query) => {
          if (type === 'customer') return query.where('roleId', Roles.CUSTOMER);
          if (type === 'delivery') return query.where('roleId', Roles.DELIVERY);
        })
        .preload('deliveryOrders')
        .orderBy('createdAt', 'desc');

      const csvHeaders =
        type === 'customer'
          ? ['Client Name', 'Company Name', 'Email', 'Second Email', 'Phone Number', 'Second Phone', 'Client Address', 'Status']
          : ['Client Name', 'Company Name', 'Email', 'Second Email', 'Phone Number', 'Second Phone', 'Total Orders', 'Status'];
      const csvRows =
        type === 'customer'
          ? users.map((user) => [
              user.fullName,
              user.companyName || '',
              user.email,
              user.secondEmail || '',
              user.phoneNumber,
              user.secondPhoneNumber || '',
              user.clientAddress || '',
              user.isSuspended ? false : true,
            ])
          : users.map((user) => [
              user.fullName,
              user.companyName || '',
              user.email,
              user.secondEmail || '',
              user.phoneNumber,
              user.secondPhoneNumber || '',
              user.deliveryOrders.length,
              user.isSuspended ? false : true,
            ]);

      const csvData = stringify([csvHeaders, ...csvRows], { header: false });
      response.header('Content-Type', 'text/csv');
      response.header(
        'Content-Disposition',
        `attachment; filename=${type === 'customer' ? 'customers.csv' : 'delivery.csv'}`
      );
      response.send(csvData);
    } catch (error) {
      errorHandler(error, response, logger, 'Export Users Error');
    }
  }

  /**
   * @swagger
   * /api/users/{id}:
   *   get:
   *     summary: Get user by ID
   *     tags: [Users]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: User ID
   *     responses:
   *       200:
   *         description: User details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *       404:
   *         description: User not found
   */
  async getById({ logger, request, response }: HttpContext) {
    try {
      const { id } = request.params();
      const user = await User.query().where('id', id).preload('role').preload('airport').firstOrFail();
      return response.json(user);
    } catch (error) {
      errorHandler(error, response, logger, 'Get User by Id Error');
    }
  }

  /**
   * @swagger
   * /api/users:
   *   post:
   *     summary: Create a new user
   *     tags: [Users]
   *     security:
   *       - sessionAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - name
   *               - roleId
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               name:
   *                 type: string
   *               roleId:
   *                 type: integer
   *               password:
   *                 type: string
   *               phoneNumber:
   *                 type: string
   *     responses:
   *       201:
   *         description: User created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 content:
   *                   type: object
   *       400:
   *         description: Bad request
   */
  async store({ logger, request, response, auth }: HttpContext) {
    try {
      // For admin-created customers/delivery persons, always create a new user
      // even if email exists - this keeps admin-created clients separate from self-signed-up clients
      const isAdmin = auth.user && ![Roles.CUSTOMER].includes(auth.user.roleId);
      const isCreatingCustomerOrDelivery = [Roles.DELIVERY, Roles.CUSTOMER].includes(
        request.input('roleId')
      );

      // Use a validator without email uniqueness for admin-created users
      // This allows admins to create clients with duplicate emails (separate from self-signed-up users)
      let payload;
      if (isAdmin && isCreatingCustomerOrDelivery) {
        // Use admin validator without unique email check - always create new user
        payload = await request.validateUsing(adminUserValidator);
      } else {
        // Use regular validator with email uniqueness for signup
        payload = await request.validateUsing(userValidator);
      }

      if (![Roles.DELIVERY, Roles.CUSTOMER].includes(payload.roleId) && !payload.password?.trim()) {
        return response.badRequest({ success: false, message: 'password is a required field' });
      }
      if ([Roles.DELIVERY, Roles.CUSTOMER].includes(payload.roleId)) {
        const password = string.generateRandom(8);
        const user = await User.create({
          ...payload,
          password,
        });
        // Disabled: Client login/password emails will be rolled out at a later time
        // Only staff (non-CUSTOMER, non-DELIVERY) should receive password emails
        // Do not send password emails to clients or delivery persons
        return response.created({
          success: true,
          message: 'User created successfully',
          content: user,
        });
      }
      // For staff users (non-CUSTOMER, non-DELIVERY), send password email
      const user = await User.create(payload);
      const branding = await useBranding();
      await mail.send(
        new UserCreateNotification(user, payload.password || '', {
          business: branding.business,
          siteUrl: branding.siteUrl || '',
        })
      );
      return response.created({
        success: true,
        message: 'User created successfully',
        content: user,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Storing User Error');
    }
  }

  /**
   * @swagger
   * /api/users/{id}:
   *   put:
   *     summary: Update user
   *     tags: [Users]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: User ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               name:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: User updated successfully
   *       404:
   *         description: User not found
   */
  async update({ logger, request, response }: HttpContext) {
    const { id } = request.params();
    try {
      const payload = await request.validateUsing(userUpdateValidator);
      const { password, ...restPayload } = payload;
      const user = await User.findOrFail(id);
      user.merge(restPayload);
      if (password) {
        user.password = password;
      }
      await user.save();
      return response.ok({
        success: true,
        message: 'User updated successfully',
        content: user,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Updating User Error');
    }
  }

  /**
   * @swagger
   * /api/users/profile/update:
   *   put:
   *     summary: Update current user profile
   *     tags: [Users]
   *     security:
   *       - sessionAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *                 description: Current password
   *               newPassword:
   *                 type: string
   *                 description: New password
   *     responses:
   *       200:
   *         description: Profile updated successfully
   *       400:
   *         description: Invalid old password
   */
  async updateByUser({ logger, request, response, auth }: HttpContext) {
    try {
      const payload = await request.validateUsing(userProfileUpdateValidator);
      const { password, newPassword, ...restPayload } = payload;
      const user = await User.findOrFail(auth.user!.id);
      user.merge(restPayload);
      if (password && newPassword) {
        const verified = await hash.verify(user.password, password);
        if (!verified) {
          return response.badRequest({ success: false, message: 'Invalid old password' });
        }
        user.password = newPassword;
      }
      await user.save();
      return response.ok({
        success: true,
        message: 'Profile updated successfully',
        content: user,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Updating User Profile By User Error');
    }
  }

  /**
   * @swagger
   * /api/users/{id}:
   *   patch:
   *     summary: Partially update user (custom fields)
   *     tags: [Users]
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
   *             properties:
   *               isSuspended:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: User updated successfully
   */
  async customUpdate({ logger, request, response, params, auth }: HttpContext) {
    try {
      const payload = await request.validateUsing(customUpdateValidator);
      const user = await User.findOrFail(params.id);
      const isSuspended = user.isSuspended;
      await user.merge(payload).save();

      if (payload.isSuspended && isSuspended !== payload.isSuspended) {
        await notification_service.sendUserSuspentionNotification(user, auth.user!);
      }
      return response.ok({
        success: true,
        message: 'Changes saved successfully.',
        content: user,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Custom Fields Updating Error');
    }
  }

  /**
   * @swagger
   * /api/users/bulk/update:
   *   patch:
   *     summary: Bulk update users
   *     tags: [Users]
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
   *               isSuspended:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Users updated successfully
   */
  async bulkCustomUpdate({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(bulkCustomValidator);
      const { ids, ...restPayload } = payload;
      await User.query().whereIn('id', ids).update(restPayload);
      return response.ok({ success: true, message: 'Users changes saved successfully' });
    } catch (error) {
      errorHandler(error, response, logger, 'Bulk Custom Update Error');
    }
  }

  /**
   * @swagger
   * /api/users/{id}:
   *   delete:
   *     summary: Delete user
   *     tags: [Users]
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
   *         description: User deleted successfully
   *       404:
   *         description: User not found
   */
  async delete({ logger, request, response }: HttpContext) {
    const { id } = request.params();
    try {
      const user = await User.findOrFail(id);
      await user.delete();
      return response.ok({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      errorHandler(error, response, logger, 'Deleting User Error');
    }
  }

  /**
   * @swagger
   * /api/users/bulk/delete:
   *   delete:
   *     summary: Bulk delete users
   *     tags: [Users]
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
   *         description: Users deleted successfully
   */
  async bulkDelete({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(bulkDeleteValidator);
      await User.query().whereIn('id', payload.ids).delete();
      return response.ok({ success: true, message: 'Users deleted successfully' });
    } catch (error) {
      errorHandler(error, response, logger, 'Bulk Deleting Users Error');
    }
  }
}
