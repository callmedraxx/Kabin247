import vine from '@vinejs/vine';

export const promotionValidator = vine.compile(
  vine.object({
    type: vine.enum(['welcome', 'message']),
    welcomeImage: vine
      .file({
        size: '10mb',
        extnames: ['jpg', 'png', 'jpeg', 'webp'],
      })
      .nullable()
      .optional(),
    welcomeStatus: vine.boolean().optional(),
    message: vine.string().optional(),
  })
);

export const sliderValidator = vine.compile(
  vine.object({
    slider: vine.array(
      vine.object({
        id: vine.number().nullable().optional(),
        image: vine
          .file({
            size: '10mb',
            extnames: ['jpg', 'png', 'jpeg', 'webp'],
          })
          .nullable()
          .optional(),
      })
    ),
  })
);
