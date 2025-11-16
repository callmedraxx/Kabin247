import vine from '@vinejs/vine';
import { idsExist } from './rules/array.js';

export const menuItemValidator = vine.compile(
  vine.object({
    categoryId: vine
      .number()
      .exists(async (db, value) => {
        return db.from('categories').where('id', value).first();
      })
      .nullable()
      .optional(),
    name: vine.string().maxLength(255).nullable().optional(),
    description: vine.string().nullable().optional(),
    foodType: vine.enum(['veg', 'nonVeg']).nullable().optional(),
    price: vine.number().nullable().optional(),
    discount: vine.number().nullable().optional(),
    discountType: vine.enum(['percentage', 'amount']).nullable().optional(),
    isAvailable: vine.boolean().nullable().optional(),
    isRecommended: vine.boolean().nullable().optional(),
    image: vine.file({
      size: '500kb',
      extnames: ['jpg', 'png', 'jpeg', 'webp'],
    }).nullable().optional(),
    chargeIds: vine
      .array(vine.number())
      .distinct()
      .compact()
      .use(idsExist({ table: 'charges', column: 'id' })),
    addonIds: vine
      .array(vine.number())
      .distinct()
      .compact()
      .use(idsExist({ table: 'addons', column: 'id' })),
    variantIds: vine
      .array(vine.number())
      .distinct()
      .compact()
      .use(idsExist({ table: 'variants', column: 'id' })),
  })
);

export const menuItemUpdateValidator = vine.compile(
  vine.object({
    categoryId: vine.number().exists(async (db, value) => {
      return db.from('categories').where('id', value).first();
    }),
    name: vine.string().maxLength(255),
    description: vine.string(),
    foodType: vine.enum(['veg', 'nonVeg']),
    price: vine.number(),
    discount: vine.number().optional(),
    discountType: vine.enum(['percentage', 'amount']).optional(),
    isAvailable: vine.boolean().optional(),
    isRecommended: vine.boolean().optional(),
    image: vine
      .file({
        size: '500kb',
        extnames: ['jpg', 'png', 'jpeg', 'webp'],
      })
      .nullable(),
    chargeIds: vine
      .array(vine.number())
      .distinct()
      .compact()
      .use(idsExist({ table: 'charges', column: 'id' })),
    addonIds: vine
      .array(vine.number())
      .distinct()
      .compact()
      .use(idsExist({ table: 'addons', column: 'id' })),
    variantIds: vine
      .array(vine.number())
      .distinct()
      .compact()
      .use(idsExist({ table: 'variants', column: 'id' })),
  })
);

export const customUpdateValidator = vine.compile(
  vine.object({
    isAvailable: vine.boolean().optional(),
    isRecommended: vine.boolean().optional(),
  })
);

export const bulkDeleteValidator = vine.compile(
  vine.object({
    ids: vine
      .array(vine.number())
      .distinct()
      .compact()
      .use(idsExist({ table: 'menu_items', column: 'id' })),
  })
);

export const bulkCustomUpdateValidator = vine.compile(
  vine.object({
    ids: vine
      .array(vine.number())
      .distinct()
      .compact()
      .use(idsExist({ table: 'menu_items', column: 'id' })),
    isAvailable: vine.boolean().optional(),
    isRecommended: vine.boolean().optional(),
  })
);
