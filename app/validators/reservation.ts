import vine from '@vinejs/vine';
import { idsExist } from './rules/array.js';

export const reservationValidator = vine.compile(
  vine.object({
    reservationDate: vine.string().trim(),
    reservationNote: vine.string().trim().nullable().optional(),
    numberOfPeople: vine.number(),
    tableNumber: vine.string(),
    startTime: vine.string(),
    endTime: vine.string(),
    userId: vine.number().exists(async (db, value) => {
      return db.from('users').where('id', value).first();
    }),
  })
);

export const customUpdateValidator = vine.compile(
  vine.object({
    status: vine.enum(['booked', 'cancelled', 'completed']),
  })
);

export const bulkDeleteValidator = vine.compile(
  vine.object({
    ids: vine
      .array(vine.number())
      .distinct()
      .compact()
      .use(idsExist({ table: 'reservations', column: 'id' })),
  })
);

export const bulkCustomUpdateValidator = vine.compile(
  vine.object({
    ids: vine
      .array(vine.number())
      .distinct()
      .compact()
      .use(idsExist({ table: 'reservations', column: 'id' })),
    status: vine.enum(['booked', 'cancelled', 'completed']),
  })
);
