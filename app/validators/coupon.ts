import vine from '@vinejs/vine';
import { idsExist } from './rules/array.js';

export const couponValidator = vine.compile(
  vine.object({
    name: vine.string().trim(),
    code: vine.string().trim(),
    type: vine.enum(['default', 'firstTimeUser']),
    discount: vine.number(),
    discountType: vine.enum(['percentage', 'amount']),
    maxUsage: vine.number(),
    minPurchase: vine.number().optional(),
    maxDiscount: vine.number().optional(),
    validFrom: vine.string(),
    validUntil: vine.string(),
    isAvailable: vine.boolean().optional(),
  })
);

export const bulkDeleteValidator = vine.compile(
  vine.object({
    ids: vine
      .array(vine.number())
      .distinct()
      .compact()
      .use(idsExist({ table: 'coupons', column: 'id' })),
  })
);

export const customUpdateValidator = vine.compile(
  vine.object({
    isAvailable: vine.boolean(),
  })
);

export const bulkCustomUpdateValidator = vine.compile(
  vine.object({
    ids: vine
      .array(vine.number())
      .distinct()
      .compact()
      .use(idsExist({ table: 'coupons', column: 'id' })),
    isAvailable: vine.boolean(),
  })
);
