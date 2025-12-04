import StockInventory from '#models/stock_inventory';
import {
  stockInventoryValidator,
  stockInventoryUpdateValidator,
  addQuantityValidator,
  bulkDeleteValidator,
} from '#validators/stock_inventory';
import type { HttpContext } from '@adonisjs/core/http';
import errorHandler from '#exceptions/error_handler';
import formatPrecision from '../utils/format_precision.js';
import { DateTime } from 'luxon';

export default class StockInventoriesController {
  /**
   * @swagger
   * /api/stock-inventories:
   *   get:
   *     summary: Get stock inventories
   *     tags: [Stock Inventories]
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
   *         description: List of stock inventories
   */
  async index({ logger, request, response }: HttpContext) {
    const { page, limit, ...input } = request.qs();
    try {
      const dataQuery = StockInventory.filter(input).orderBy('createdAt', 'desc');
      const data = page && limit ? await dataQuery.paginate(page, limit) : await dataQuery.exec();
      return response.json(data);
    } catch (error) {
      errorHandler(error, response, logger, 'Index Stock Inventories Error');
    }
  }

  /**
   * @swagger
   * /api/stock-inventories/{id}:
   *   get:
   *     summary: Get stock inventory by ID
   *     tags: [Stock Inventories]
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
   *         description: Stock inventory details
   */
  async getById({ logger, request, response }: HttpContext) {
    const { id } = request.params();
    try {
      const data = await StockInventory.findOrFail(id);
      return response.json(data);
    } catch (error) {
      errorHandler(error, response, logger, 'Get Stock Inventory By Id Error');
    }
  }

  /**
   * @swagger
   * /api/stock-inventories:
   *   post:
   *     summary: Create stock inventory
   *     tags: [Stock Inventories]
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
   *         description: Stock inventory created successfully
   */
  async store({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(stockInventoryValidator);
      const { quantity, unitCost, expiryDate, lastRestockedDate, ...restPayload } = payload;
      
      // Calculate total value
      const totalValue = formatPrecision(quantity * unitCost);
      
      // Convert Date to DateTime for expiryDate and lastRestockedDate
      const expiryDateLuxon = expiryDate ? DateTime.fromJSDate(expiryDate) : null;
      const lastRestockedDateLuxon = lastRestockedDate ? DateTime.fromJSDate(lastRestockedDate) : null;
      
      const stockInventory = await StockInventory.create({
        ...restPayload,
        quantity,
        unitCost,
        totalValue,
        expiryDate: expiryDateLuxon,
        lastRestockedDate: lastRestockedDateLuxon,
        isActive: restPayload.isActive ?? true,
      });

      return response.created({
        success: true,
        message: 'Stock inventory created successfully',
        content: stockInventory,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Storing Stock Inventory Error');
    }
  }

  /**
   * @swagger
   * /api/stock-inventories/{id}:
   *   put:
   *     summary: Update stock inventory
   *     tags: [Stock Inventories]
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
   *         description: Stock inventory updated successfully
   */
  async update({ logger, request, response, params }: HttpContext) {
    try {
      const stockInventory = await StockInventory.findOrFail(params.id);
      const payload = await request.validateUsing(stockInventoryUpdateValidator);
      
      const { quantity, unitCost, expiryDate, lastRestockedDate, ...restPayload } = payload;
      
      // Update quantity and unit cost if provided
      if (quantity !== undefined) {
        stockInventory.quantity = quantity;
      }
      if (unitCost !== undefined) {
        stockInventory.unitCost = unitCost;
      }
      
      // Convert Date to DateTime for expiryDate and lastRestockedDate if provided
      if (expiryDate !== undefined) {
        stockInventory.expiryDate = expiryDate ? DateTime.fromJSDate(expiryDate) : null;
      }
      if (lastRestockedDate !== undefined) {
        stockInventory.lastRestockedDate = lastRestockedDate ? DateTime.fromJSDate(lastRestockedDate) : null;
      }
      
      // Recalculate total value
      const finalQuantity = quantity !== undefined ? quantity : stockInventory.quantity;
      const finalUnitCost = unitCost !== undefined ? unitCost : stockInventory.unitCost;
      stockInventory.totalValue = formatPrecision(finalQuantity * finalUnitCost);
      
      stockInventory.merge(restPayload);
      await stockInventory.save();

      return response.ok({
        success: true,
        message: 'Stock inventory updated successfully',
        content: stockInventory,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Updating Stock Inventory Error');
    }
  }

  /**
   * @swagger
   * /api/stock-inventories/{id}/add-quantity:
   *   patch:
   *     summary: Add quantity to stock inventory
   *     tags: [Stock Inventories]
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
   *               quantity:
   *                 type: number
   *               unitCost:
   *                 type: number
   *     responses:
   *       200:
   *         description: Quantity added successfully
   */
  async addQuantity({ logger, request, response, params }: HttpContext) {
    try {
      const stockInventory = await StockInventory.findOrFail(params.id);
      const payload = await request.validateUsing(addQuantityValidator);
      
      const { quantity: addQuantity, unitCost: newUnitCost } = payload;
      
      // If new unit cost is provided, calculate weighted average
      if (newUnitCost && newUnitCost > 0) {
        const currentTotalValue = stockInventory.quantity * stockInventory.unitCost;
        const newTotalValue = addQuantity * newUnitCost;
        const totalQuantity = stockInventory.quantity + addQuantity;
        stockInventory.unitCost = formatPrecision((currentTotalValue + newTotalValue) / totalQuantity);
        stockInventory.quantity = totalQuantity;
      } else {
        // Just add quantity with existing unit cost
        stockInventory.quantity = formatPrecision(stockInventory.quantity + addQuantity);
      }
      
      // Update total value
      stockInventory.totalValue = formatPrecision(stockInventory.quantity * stockInventory.unitCost);
      
      // Update last restocked date
      stockInventory.lastRestockedDate = DateTime.now();
      
      await stockInventory.save();

      return response.ok({
        success: true,
        message: 'Quantity added successfully',
        content: stockInventory,
      });
    } catch (error) {
      errorHandler(error, response, logger, 'Adding Quantity Error');
    }
  }

  /**
   * @swagger
   * /api/stock-inventories/{id}:
   *   delete:
   *     summary: Delete stock inventory
   *     tags: [Stock Inventories]
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
   *         description: Stock inventory deleted successfully
   */
  async delete({ logger, response, params }: HttpContext) {
    try {
      const stockInventory = await StockInventory.findOrFail(params.id);
      await stockInventory.delete();
      return response.json({ success: true, message: 'Stock inventory deleted successfully.' });
    } catch (error) {
      errorHandler(error, response, logger, 'Stock Inventory Deleting Error');
    }
  }

  /**
   * @swagger
   * /api/stock-inventories/bulk/delete:
   *   delete:
   *     summary: Bulk delete stock inventories
   *     tags: [Stock Inventories]
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
   *         description: Stock inventories deleted successfully
   */
  async bulkDelete({ logger, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(bulkDeleteValidator);
      await StockInventory.query().whereIn('id', payload.ids).delete();

      return response.ok({ success: true, message: 'Stock inventories deleted successfully.' });
    } catch (error) {
      errorHandler(error, response, logger, 'Bulk Stock Inventory Deleting Error');
    }
  }
}
