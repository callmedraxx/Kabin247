import vine from '@vinejs/vine';

export const paymentMethodValidator = vine.compile(
  vine.object({
    status: vine.boolean().optional(),
    logo: vine
      .file({
        size: '1mb',
        extnames: ['jpg', 'png', 'jpeg', 'webp'],
      })
      .nullable()
      .optional(),
    public: vine.string().optional(),
    secret: vine.string().optional(),
    webhook: vine.string().optional(),
    mode: vine.string().optional(),
  })
);

export const customUpdateValidator = vine.compile(
  vine.object({
    status: vine.boolean().optional(),
  })
);
