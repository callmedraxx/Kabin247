import vine from '@vinejs/vine';
import { idsExist } from './rules/array.js';

export const addonValidator = vine.compile(
  vine.object({
    name: vine.string().trim().maxLength(255),
    image: vine
      .file({
        size: '500kb',
        extnames: ['jpg', 'png', 'jpeg', 'webp'],
      })
      .nullable(),
    price: vine.number(),
    isAvailable: vine.boolean().optional(),
  })
);

export const bulkDeleteValidator = vine.compile(
  vine.object({
    ids: vine
      .array(vine.number())
      .distinct()
      .compact()
      .use(idsExist({ table: 'addons', column: 'id' })),
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
      .use(idsExist({ table: 'addons', column: 'id' })),
    isAvailable: vine.boolean(),
  })
);
