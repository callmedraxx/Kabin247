import vine from '@vinejs/vine';

export const registerValidator = vine.compile(
  vine.object({
    firstName: vine.string().trim(),
    lastName: vine.string().trim().nullable(),
    email: vine
      .string()
      .trim()
      .email()
      .unique(async (db, value) => {
        const user = await db.from('users').where('email', value).first();
        return !user;
      }),
    password: vine.string().trim().minLength(8),
    phoneNumber: vine.string().trim(),
    address: vine.number().optional(),
  })
);

export const resetPasswordValidator = vine.compile(
  vine.object({
    password: vine.string().trim().minLength(8).confirmed({
      confirmationField: 'confirmPassword',
    }),
    token: vine.string().trim(),
  })
);
