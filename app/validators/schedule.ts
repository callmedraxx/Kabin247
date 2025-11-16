import vine from '@vinejs/vine';

export const scheduleValidator = vine.compile(
  vine.object({
    isOpen: vine.boolean().optional(),
    openingTime: vine
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
      .optional(),
    closingTime: vine
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
      .optional(),
  })
);
