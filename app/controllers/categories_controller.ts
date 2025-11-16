import Category from '#models/category';
import type { HttpContext } from '@adonisjs/core/http';
import { attachmentManager } from '@jrmc/adonis-attachment';
import errorHandler from '#exceptions/error_handler';
import {
  bulkCustomUpdateValidator,
  bulkDeleteValidator,
  categoryUpdateValidator,
  categoryValidator,
  customUpdateValidator,
} from '#validators/category';
import BusinessSetup from '#models/business_setup';

export default class CategoriesController {
  /**
   * @swagger
   * /api/user/categories/{global}:
   *   get:
   *     summary: Get categories (user)
   *     tags: [Categories]
   *     parameters:
   *       - in: path
   *         name: global
   *         required: true
   *         schema:
   *           type: string
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
   *         description: List of categories
   * /api/categories:
   *   get:
   *     summary: Get categories (admin)
   *     tags: [Categories]
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
   *         description: List of categories
   */
  async index({ logger, request, response }: HttpContext) {
    const { page, limit, ...input } = request.qs();
    try {
      const { global } = request.params();
      const businessSetup = await (BusinessSetup as any).query().firstOrFail();
      const orderBy = businessSetup.sortCategories === 'priority_number' ? 'priority' : 'name';
      const dataQuery = Category.filter(input)
        .if(global, (query) => {
          query.where('isAvailable', true);
        })
        .preload('menuItems', (query) => {
          query.if(global, (mCuery) => {
            mCuery.where('isAvailable', true);
          });
        })
        .orderBy(orderBy, 'asc');
      const data = page && limit ? await dataQuery.paginate(page, limit) : await dataQuery.exec();
      return response.json(data);
    } catch (error) {
      errorHandler(error, response, logger, 'Index Category Error');
    }
  }

  /**
   * @swagger
   * /api/user/categories/{global}/{id}:
   *   get:
   *     summary: Get category by ID (user)
   *     tags: [Categories]
   *     parameters:
   *       - in: path
   *         name: global
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Category details
   * /api/categories/{id}:
   *   get:
   *     summary: Get category by ID (admin)
   *     tags: [Categories]
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
   *         description: Category details
   */
  async getCategory({ logger, request, response }: HttpContext) {
    try {
      const { global, id } = request.params();
      const category = await Category.query()
        .if(global, (query) => {
          query.where('isAvailable', true);
        })
        .where('id', id)
        .preload('menuItems', (query) => {
          query
            .if(global, (mQuery) => {
              mQuery.where('isAvailable', true);
            })
            .preload('variants', (vQuery) => {
              vQuery
                .if(global, (vaQuery) => {
                  vaQuery.where('isAvailable', true);
                })
                .preload('variantOptions');
            })
            .preload('charges', (cQuery) => {
              cQuery.if(global, (chQuery) => {
                chQuery.where('isAvailable', true);
              });
            })
            .preload('addons', (aQuery) => {
              aQuery.if(global, (adQuery) => {
                adQuery.where('isAvailable', true);
              });
            });
        })
        .firstOrFail();
      return response.json(category);
    } catch (error) {
      errorHandler(error, response, logger, 'Get Category Error');
    }
  }

  /**
   * @swagger
   * /api/categories:
   *   post:
   *     summary: Create category
   *     tags: [Categories]
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
   *         description: Category created successfully
   */
  async store({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(categoryValidator);
      const { image, ...restPayload } = payload;
      const processedImage = await attachmentManager.createFromFile(image);
      const category = await Category.create({ image: processedImage, ...restPayload });
      await category.load('menuItems');
      return response.created({
        success: true,
        message: 'Category created successfully',
        content: category,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Storing Category Error');
    }
  }

  /**
   * @swagger
   * /api/categories/{id}:
   *   put:
   *     summary: Update category
   *     tags: [Categories]
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
   *         description: Category updated successfully
   */
  async update({ logger, request, response }: HttpContext) {
    try {
      const { id } = request.params();
      const payload = await request.validateUsing(categoryUpdateValidator);
      const { image, ...restPayload } = payload;
      const category = await Category.query().where('id', id).first();
      if (!category) {
        return response.notFound({ message: 'Category not found' });
      }
      category.merge(restPayload);
      if (image) {
        category.image = await attachmentManager.createFromFile(image);
      }
      await category.save();
      await category.load('menuItems');
      return response.created({
        success: true,
        message: 'Category updated successfully',
        content: category,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Updating Category Error');
    }
  }

  /**
   * @swagger
   * /api/categories/{id}:
   *   patch:
   *     summary: Partially update category
   *     tags: [Categories]
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
   *         description: Category updated successfully
   */
  async customUpdate({ logger, request, response, params }: HttpContext) {
    try {
      const payload = await request.validateUsing(customUpdateValidator);
      const category = await Category.query().where('id', params.id).firstOrFail();
      await category.merge(payload).save();

      return response.ok({
        success: true,
        message: 'Changes saved successfully.',
        content: category,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Custom Update error');
    }
  }

  /**
   * @swagger
   * /api/categories/bulk/update:
   *   patch:
   *     summary: Bulk update categories
   *     tags: [Categories]
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
   *         description: Categories updated successfully
   */
  async bulkCustomUpdate({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(bulkCustomUpdateValidator);
      const { ids, ...restPayload } = payload;
      await Category.query().whereIn('id', ids).update(restPayload);

      return response.ok({ success: true, message: 'Categories changes saved successfully.' });
    } catch (error) {
      errorHandler(error, response, logger, 'Bulk Custom Update Error');
    }
  }

  /**
   * @swagger
   * /api/categories/{id}:
   *   delete:
   *     summary: Delete category
   *     tags: [Categories]
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
   *         description: Category deleted successfully
   */
  async delete({ logger, request, response }: HttpContext) {
    try {
      const { id } = request.params();
      const category = await Category.query().where('id', id).firstOrFail();
      await category.delete();
      return response.ok({ success: true, message: 'Category deleted successfully.' });
    } catch (error) {
      errorHandler(error, response, logger, 'Deleting Error');
    }
  }

  /**
   * @swagger
   * /api/categories/bulk/delete:
   *   delete:
   *     summary: Bulk delete categories
   *     tags: [Categories]
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
   *         description: Categories deleted successfully
   */
  async bulkDelete({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(bulkDeleteValidator);
      await Category.query().whereIn('id', payload.ids).delete();
      return response.ok({ success: true, message: 'Categories deleted successfully.' });
    } catch (error) {
      errorHandler(error, response, logger, 'Bulk Deleting Error');
    }
  }
}
