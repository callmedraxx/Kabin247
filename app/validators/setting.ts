import vine from '@vinejs/vine';

export const updatePaymentOptionsValidator = vine.compile(
  vine.object({
    name: vine.enum(['cash', 'card', 'digital']),
    status: vine.boolean(),
  })
);

export const updateThemeValidator = vine.compile(
  vine.object({
    key: vine.enum(['theme']),
    value: vine.object({ default: vine.record(vine.string().hexCode()) }),
  })
);
