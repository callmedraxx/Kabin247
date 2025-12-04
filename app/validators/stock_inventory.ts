import vine from '@vinejs/vine';
import { idsExist } from './rules/array.js';

export const stockInventoryValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    description: vine.string().trim().maxLength(1000).optional(),
    category: vine.string().trim().maxLength(100).optional(),
    unit: vine.string().trim().maxLength(50),
    quantity: vine.number().min(0),
    minimumQuantity: vine.number().min(0),
    unitCost: vine.number().min(0),
    supplier: vine.string().trim().maxLength(255).optional(),
    location: vine.string().trim().maxLength(255).optional(),
    expiryDate: vine.date().optional(),
    lastRestockedDate: vine.date().optional(),
    isActive: vine.boolean().optional(),
    notes: vine.string().trim().maxLength(1000).optional(),
  })
);

export const stockInventoryUpdateValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255).optional(),
    description: vine.string().trim().maxLength(1000).optional(),
    category: vine.string().trim().maxLength(100).optional(),
    unit: vine.string().trim().maxLength(50).optional(),
    quantity: vine.number().min(0).optional(),
    minimumQuantity: vine.number().min(0).optional(),
    unitCost: vine.number().min(0).optional(),
    supplier: vine.string().trim().maxLength(255).optional(),
    location: vine.string().trim().maxLength(255).optional(),
    expiryDate: vine.date().optional(),
    lastRestockedDate: vine.date().optional(),
    isActive: vine.boolean().optional(),
    notes: vine.string().trim().maxLength(1000).optional(),
  })
);

export const addQuantityValidator = vine.compile(
  vine.object({
    quantity: vine.number().min(0),
    unitCost: vine.number().min(0).optional(),
  })
);

export const bulkDeleteValidator = vine.compile(
  vine.object({
    ids: vine
      .array(vine.number())
      .distinct()
      .compact()
      .use(idsExist({ table: 'stock_inventories', column: 'id' })),
  })
);

