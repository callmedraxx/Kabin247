import errorHandler from '#exceptions/error_handler';
import MenuItem from '#models/menu_item';
import OrderItem from '#models/order_item';
import {
  bulkDeleteValidator,
  menuItemValidator,
  customUpdateValidator,
  bulkCustomUpdateValidator,
  menuItemUpdateValidator,
} from '#validators/menu_item';
import type { HttpContext } from '@adonisjs/core/http';
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model';
import { attachmentManager } from '@jrmc/adonis-attachment';
import { stringify } from 'csv-stringify/sync';
import Variant from '#models/variant';

export default class MenuItemsController {
  /**
   * @swagger
   * /api/user/menu-items/{global}:
   *   get:
   *     summary: Get menu items (user)
   *     tags: [Menu Items]
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
   *         description: List of menu items
   * /api/menu-items:
   *   get:
   *     summary: Get menu items (admin)
   *     tags: [Menu Items]
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
   *         description: List of menu items
   */
async index({ logger, request, response }: HttpContext) {
  const { page, limit, popularLimit, includePopular, ...input } = request.qs();
  try {
    const { global } = request.params() || {};
    // Changed from MenuItem.$filter(input) to MenuItem.query().filter(input)
    const dataQuery = MenuItem.query()
      .filter(input)
      .if(global, (query: ModelQueryBuilderContract<typeof MenuItem>) => {
        query.where('isAvailable', true);
      })
      .preload('category', (query: ModelQueryBuilderContract<typeof MenuItem>) => {
        query.if(global, (cQuery: ModelQueryBuilderContract<typeof MenuItem>) => {
          cQuery.where('isAvailable', true);
        });
      })
      .preload('variants', (query: ModelQueryBuilderContract<typeof Variant>) => {
        query
          .if(global, (vQuery: ModelQueryBuilderContract<typeof Variant>) => {
            vQuery.where('isAvailable', true);
          })
          .preload('variantOptions');
      })
      .preload('charges', (query: ModelQueryBuilderContract<typeof MenuItem>) => {
        query.if(global, (cQuery: ModelQueryBuilderContract<typeof MenuItem>) => {
          cQuery.where('isAvailable', true);
        });
      })
      .preload('addons', (query: ModelQueryBuilderContract<typeof MenuItem>) => {
        query.if(global, (aQuery: ModelQueryBuilderContract<typeof MenuItem>) => {
          aQuery.where('isAvailable', true);
        });
      })
      .orderBy('createdAt', 'desc');
    const data = page && limit ? await dataQuery.paginate(page, limit) : await dataQuery.exec();

    if (popularLimit && includePopular === 'true') {
      const popularItemsLimit = popularLimit || 10;
      const popularItems = await this.mostPopularItems(popularItemsLimit);
      return response.json({ data, popularItems });
    }
    return response.json(data);
  } catch (error) {
    errorHandler(error, response, logger, 'Index Menu Items Error');
  }
}

  /**
   * @swagger
   * /api/menu-items/export/all:
   *   get:
   *     summary: Export menu items to CSV
   *     tags: [Menu Items]
   *     security:
   *       - sessionAuth: []
   *     responses:
   *       200:
   *         description: CSV file download
   */
  async exportMenuItems({ logger, request, response }: HttpContext) {
    const { listType, page, limit, ...input } = request.qs();
    try {
      const menuItems = await MenuItem.filter(input)
        .if(global, (query: ModelQueryBuilderContract<typeof MenuItem>) => {
          query.where('isAvailable', true);
        })
        .preload('category')
        .preload('variants', (query: ModelQueryBuilderContract<typeof Variant>) => {
          query.preload('variantOptions');
        })
        .preload('charges')
        .preload('addons')
        .orderBy('createdAt', 'desc');
      const csvHeaders = ['Name', 'Price', 'Discount', 'Addons', 'Food Type', 'Avaibility'];
      const csvRows = menuItems.map((menuItem) => [
        menuItem.name || '',
        menuItem.price ? menuItem.price.toFixed(2) : '0.00',
        menuItem.discountType === 'amount'
          ? menuItem.discount || 0
          : menuItem.price && menuItem.discount
          ? (menuItem.price * (menuItem.discount / 100)).toFixed(2)
          : '0.00',
        menuItem.addons.length > 0 ? true : false,
        menuItem.foodType || '',
        menuItem.isAvailable ?? false,
      ]);

      const csvData = stringify([csvHeaders, ...csvRows], { header: false });
      response.header('Content-Type', 'text/csv');
      response.header('Content-Disposition', `attachment; filename="menu_items.csv"`);
      response.send(csvData);
    } catch (error) {
      errorHandler(error, response, logger, 'Export Menu Items Error');
    }
  }

  private async mostPopularItems(limit: number) {
    const popularMenuItems = await OrderItem.query()
      .select('menuItemId')
      .count('* as orderCount')
      .groupBy('menuItemId')
      .orderBy('orderCount', 'desc')
      .limit(limit);

    const menuItemIds = popularMenuItems.map((item) => item.menuItemId);

    const menuItems = await MenuItem.query()
      .whereIn('id', menuItemIds)
      .preload('category', (query: ModelQueryBuilderContract<typeof MenuItem>) => {
        query.where('isAvailable', true);
      })
      .preload('variants', (query: ModelQueryBuilderContract<typeof Variant>) => {
        query.where('isAvailable', true)
        .preload('variantOptions');
      })
      .preload('charges', (query: ModelQueryBuilderContract<typeof MenuItem>) => {
        query.where('isAvailable', true);
      })
      .preload('addons', (query: ModelQueryBuilderContract<typeof MenuItem>) => {
        query.where('isAvailable', true);
      });

    return menuItems.map((menuItem) => {
      const orderCount =
        popularMenuItems.find((item) => item.menuItemId === menuItem.id)?.$extras.orderCount || 0;
      return { menuItem, orderCount };
    });
  }

  /**
   * @swagger
   * /api/user/menu-items/{global}/{id}:
   *   get:
   *     summary: Get menu item by ID (user)
   *     tags: [Menu Items]
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
   *         description: Menu item details
   * /api/menu-items/{id}:
   *   get:
   *     summary: Get menu item by ID (admin)
   *     tags: [Menu Items]
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
   *         description: Menu item details
   */
  async getById({ logger, request, response }: HttpContext) {
    const { id } = request.params();
    try {
      const data = await MenuItem.query()
        .if(global, (query: ModelQueryBuilderContract<typeof MenuItem>) => {
          query.where('isAvailable', true);
        })
        .preload('category', (query: ModelQueryBuilderContract<typeof MenuItem>) => {
          query.if(global, (cQuery: ModelQueryBuilderContract<typeof MenuItem>) => {
            cQuery.where('isAvailable', true);
          });
        })
        .preload('variants', (query: ModelQueryBuilderContract<typeof Variant>) => {
          query
            .if(global, (vQuery: ModelQueryBuilderContract<typeof Variant>) => {
              vQuery.where('isAvailable', true);
            })
            .preload('variantOptions');
        })
        .preload('charges', (query: ModelQueryBuilderContract<typeof MenuItem>) => {
          query.if(global, (cQuery: ModelQueryBuilderContract<typeof MenuItem>) => {
            cQuery.where('isAvailable', true);
          });
        })
        .preload('addons', (query: ModelQueryBuilderContract<typeof MenuItem>) => {
          query.if(global, (aQuery: ModelQueryBuilderContract<typeof MenuItem>) => {
            aQuery.where('isAvailable', true);
          });
        })
        .andWhere('id', id)
        .firstOrFail();

      return response.json(data);
    } catch (error) {
      errorHandler(error, response, logger, 'Get Menu Item By Id Error');
    }
  }

  /**
   * @swagger
   * /api/menu-items:
   *   post:
   *     summary: Create menu item
   *     tags: [Menu Items]
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
   *         description: Menu item created successfully
   */
  async store({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(menuItemValidator);
      const { image, chargeIds, addonIds, variantIds, ...restPayload } = payload;
      
      // Filter out null values and prepare clean payload
      const cleanPayload = Object.fromEntries(
        Object.entries(restPayload).filter(([_, value]) => value !== null)
      );

      // Handle image if provided
      const modelPayload = image 
        ? { ...cleanPayload, image: await attachmentManager.createFromFile(image) }
        : cleanPayload;

      const menuItem = await MenuItem.create(modelPayload);

      if (chargeIds) {
        await menuItem.related('charges').attach(chargeIds);
      }

      if (addonIds) {
        await menuItem.related('addons').attach(addonIds);
      }

      if (variantIds) {
        await menuItem.related('variants').attach(variantIds);
      }

      await menuItem.load('charges');
      await menuItem.load('addons');
      await menuItem.load('variants', (query: ModelQueryBuilderContract<typeof Variant>) => {
        query.preload('variantOptions');
      });

      return response.created({
        success: true,
        message: 'Menu item created successfully',
        content: menuItem,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Storing Menu Item Error');
    }
  }

  /**
   * @swagger
   * /api/menu-items/{id}:
   *   put:
   *     summary: Update menu item
   *     tags: [Menu Items]
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
   *         description: Menu item updated successfully
   */
  async update({ logger, request, response, params }: HttpContext) {
    try {
      const menuItem = await (MenuItem as any).query().where('id', params.id).firstOrFail();
      const payload = await request.validateUsing(menuItemUpdateValidator);
      const { image, chargeIds, addonIds, variantIds, ...restPayload } = payload;
      menuItem.merge(restPayload);
      if (image) {
        menuItem.image = await attachmentManager.createFromFile(image);
      }
      await menuItem.save();

      if (chargeIds && chargeIds?.length > 0) {
        await menuItem.related('charges').sync(chargeIds);
      } else {
        await menuItem.related('charges').detach();
      }

      if (addonIds && addonIds?.length > 0) {
        await menuItem.related('addons').sync(addonIds);
      } else {
        await menuItem.related('addons').detach();
      }

      if (variantIds && variantIds?.length > 0) {
        await menuItem.related('variants').sync(variantIds);
      } else {
        await menuItem.related('variants').detach();
      }

      await menuItem.load('charges');
      await menuItem.load('addons');
      await menuItem.load('variants', (query) => {
        query.preload('variantOptions');
      });

      return response.ok({
        success: true,
        message: 'Menu item updated successfully',
        content: menuItem,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Updating Menu Item Error');
    }
  }

  /**
   * @swagger
   * /api/menu-items/{id}:
   *   patch:
   *     summary: Partially update menu item
   *     tags: [Menu Items]
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
   *         description: Menu item updated successfully
   */
  async customUpdate({ logger, request, response, params }: HttpContext) {
    try {
      const payload = await request.validateUsing(customUpdateValidator);
      const menuItem = await (MenuItem as any).query().where('id', params.id).firstOrFail();
      await menuItem.merge(payload).save();

      await menuItem.load('charges');
      await menuItem.load('addons');
      return response.ok({
        success: true,
        message: 'Changes saved successfully.',
        content: menuItem,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Custom Fields Updating Error');
    }
  }

  /**
   * @swagger
   * /api/menu-items/bulk/update:
   *   patch:
   *     summary: Bulk update menu items
   *     tags: [Menu Items]
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
   *         description: Menu items updated successfully
   */
  async bulkCustomUpdate({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(bulkCustomUpdateValidator);
      const { ids, ...restPayload } = payload;
      await MenuItem.query().whereIn('id', ids).update(restPayload);

      return response.ok({ success: true, message: 'Menu items changes saved successfully.' });
    } catch (error) {
      errorHandler(error, response, logger, 'Bulk Custom Fields Updating Error');
    }
  }

  /**
   * @swagger
   * /api/menu-items/{id}:
   *   delete:
   *     summary: Delete menu item
   *     tags: [Menu Items]
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
   *         description: Menu item deleted successfully
   */
  async delete({ logger, request, response }: HttpContext) {
    const { id } = request.params();
    try {
      const data = await (MenuItem as any).query().where('id', id).firstOrFail();
      await data.delete();
      return response.json({ success: true, message: 'Menu item deleted successfully.' });
    } catch (error) {
      errorHandler(error, response, logger, 'Menu Item Deleting Error');
    }
  }

  /**
   * @swagger
   * /api/menu-items/bulk/delete:
   *   delete:
   *     summary: Bulk delete menu items
   *     tags: [Menu Items]
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
   *         description: Menu items deleted successfully
   */
  async bulkDelete({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(bulkDeleteValidator);
      await MenuItem.query().whereIn('id', payload.ids).delete();

      return response.ok({ success: true, message: 'Menu items deleted successfully.' });
    } catch (error) {
      errorHandler(error, response, logger, 'Bulk Menu Item Deleting Error');
    }
  }
}
