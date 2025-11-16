import vine from '@vinejs/vine';

export const businessInfoValidator = vine.compile(
  vine.object({
    name: vine.string().trim().maxLength(255),
    siteUrl: vine.string().trim().url().optional(),
    email: vine.string().email().trim(),
    phone: vine.string().mobile().trim(),
    address: vine.string(),
    country: vine.string(),
    timeZone: vine.string(),
    timeFormat: vine.enum(['12_format', '24_format']),
  })
);

export const platformSetupValidator = vine.compile(
  vine.object({
    maintenanceMode: vine.boolean(),
    dineIn: vine.boolean(),
    delivery: vine.boolean(),
    pickup: vine.boolean(),
    deliveryCharge: vine.number(),
    currencyCode: vine.string(),
    currencySymbolPosition: vine.enum(['left', 'right']),
    guestCheckout: vine.boolean(),
    loginOnlyVerifiedEmail: vine.boolean(),
    sortCategories: vine.enum(['priority_number', 'alphabetical_order']),
  })
);
export const siteSettingValidator = vine.compile(
  vine.object({
    logo: vine
      .file({
        size: '500kb',
        extnames: ['jpg', 'png', 'jpeg', 'webp'],
      })
      .nullable()
      .optional(),
    minimizedLogo: vine
      .file({
        size: '500kb',
        extnames: ['jpg', 'png', 'jpeg', 'webp'],
      })
      .nullable()
      .optional(),
    favicon: vine
      .file({
        size: '500kb',
        extnames: ['jpg', 'png', 'jpeg', 'webp'],
      })
      .nullable()
      .optional(),
    theme: vine.string().nullable().optional(),
    companySlogan: vine.string().nullable().optional(),
    copyrightText: vine.string().nullable().optional(),
    facebook: vine.string().nullable().optional(),
    instagram: vine.string().nullable().optional(),
    twitter: vine.string().nullable().optional(),
    aboutUsImage: vine
      .file({
        size: '10mb',
        extnames: ['jpg', 'png', 'jpeg', 'webp'],
      })
      .nullable()
      .optional(),
    aboutUsHeading: vine.string().nullable().optional(),
    aboutUsDescription: vine.string().nullable().optional(),
    contactUsImage: vine
      .file({
        size: '10mb',
        extnames: ['jpg', 'png', 'jpeg', 'webp'],
      })
      .nullable()
      .optional(),
    name: vine.string().trim().maxLength(255).nullable().optional(),
    email: vine.string().email().trim().nullable().optional(),
    phone: vine.string().mobile().trim().nullable().optional(),
    address: vine.string().nullable().optional(),
    country: vine.string().optional(),
    termsAndConditions: vine.string().nullable().optional(),
    privacyPolicy: vine.string().nullable().optional(),
    returnPolicy: vine.string().nullable().optional(),
  })
);
