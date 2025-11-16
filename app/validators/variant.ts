import vine from '@vinejs/vine';

export const variantValidator = vine.compile(
  vine.object({
    name: vine.string().maxLength(255),
    value: vine.string().maxLength(255).toLowerCase(),
    allowMultiple: vine.boolean(),
    requirement: vine.enum(['optional', 'required']),
    min: vine.number().optional(),
    max: vine.number().optional(),
    isAvailable: vine.boolean(),
    variantOptions: vine.array(
      vine.object({
        id: vine.number().optional(),
        name: vine.string().maxLength(255),
        price: vine.number(),
      })
    ),
  })
);

export const customUpdateValidator = vine.compile(
  vine.object({
    isAvailable: vine.boolean(),
  })
);

export const bulkDeleteValidator = vine.compile(
  vine.object({
    ids: vine.array(vine.number()),
  })
);

export const bulkCustomUpdateValidator = vine.compile(
  vine.object({
    ids: vine.array(vine.number()),
    isAvailable: vine.boolean(),
  })
);
