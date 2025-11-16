import vine from '@vinejs/vine';
import { idsExist } from './rules/array.js';

export const chargeValidator = vine.compile(
  vine.object({
    name: vine.string().trim().maxLength(255),
    type: vine.enum(['tax', 'charge']),
    amount: vine.number(),
    amountType: vine.enum(['percentage', 'amount']),
    isAvailable: vine.boolean().optional(),
  })
);

export const bulkDeleteValidator = vine.compile(
  vine.object({
    ids: vine
      .array(vine.number())
      .distinct()
      .compact()
      .use(idsExist({ table: 'charges', column: 'id' })),
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
      .use(idsExist({ table: 'charges', column: 'id' })),
    isAvailable: vine.boolean(),
  })
);
