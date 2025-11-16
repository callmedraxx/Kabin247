import vine from '@vinejs/vine';
import { idsExist } from './rules/array.js';

export const categoryValidator = vine.compile(
  vine.object({
    name: vine.string().trim().maxLength(255),
    priority: vine.number().optional(),
    isAvailable: vine.boolean().optional(),
    image: vine.file({
      size: '500kb',
      extnames: ['jpg', 'png', 'jpeg', 'webp'],
    }),
  })
);

export const categoryUpdateValidator = vine.compile(
  vine.object({
    name: vine.string().trim().maxLength(255),
    priority: vine.number().optional(),
    isAvailable: vine.boolean().optional(),
    image: vine
      .file({
        size: '500kb',
        extnames: ['jpg', 'png', 'jpeg', 'webp'],
      })
      .nullable(),
  })
);

export const bulkDeleteValidator = vine.compile(
  vine.object({
    ids: vine
      .array(vine.number())
      .distinct()
      .compact()
      .use(idsExist({ table: 'categories', column: 'id' })),
  })
);

export const customUpdateValidator = vine.compile(
  vine.object({
    isAvailable: vine.boolean().optional(),
    priority: vine.number().optional(),
  })
);

export const bulkCustomUpdateValidator = vine.compile(
  vine.object({
    ids: vine
      .array(vine.number())
      .distinct()
      .compact()
      .use(idsExist({ table: 'categories', column: 'id' })),
    isAvailable: vine.boolean(),
  })
);
