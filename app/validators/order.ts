import vine from '@vinejs/vine';
import { idsExist } from './rules/array.js';
import Roles from '../enum/roles.js';

export const orderValidator = vine.compile(
  vine.object({
    userId: vine
      .number()
      .exists(async (db, value) => {
        return (
          db.from('users').where('id', value).andWhere('role_id', Roles.CUSTOMER).first() || false
        );
      })
      .optional(),
    type: vine.enum(['dine_in', 'delivery', 'pickup']),
    manualDiscount: vine.number().optional(),
    paymentType: vine.enum(['cash', 'card', 'paypal', 'stripe']),
    customerNote: vine.string().nullable().optional(),
    note: vine.string().trim().optional(),
    packagingNote: vine.string().trim().optional(),
    reheatMethod: vine.string().trim().optional(),
    tailNumber: vine.string().trim().optional(),
    deliveryDate: vine.string().trim().optional(),
    deliveryTime: vine.string().trim().optional(),
    dietaryRes: vine.string().trim().optional(),
    priority: vine.string().trim().optional(),
    deliveryManId: vine.number().optional(),
    deliveryAirportId: vine.number().optional(),
    orderItems: vine.array(
      vine.object({
        id: vine.number(), // frontend-generated or real ID
        name: vine.string().nullable().optional(),
        description: vine.string().nullable().optional(),
        price: vine.number(),
        quantity: vine.number(),
        total: vine.number(),
        subTotal: vine.number(),
        discount: vine.number().optional(),
        discountType: vine.enum(['amount', 'percentage']).optional(),
        image: vine.object({
          url: vine.string().optional(),
        }).nullable().optional(),
        addons: vine.array(
          vine.object({
            id: vine.number(),
            name: vine.string(),
            price: vine.number(),
            quantity: vine.number(),
            image: vine.object({
              url: vine.string().optional(),
            }).nullable().optional(),
          })
        ).optional(),
        variants: vine.array(
          vine.object({
            id: vine.number(),
            name: vine.string(),
            price: vine.number().optional(),
            option: vine.array(
              vine.object({
                id: vine.number(),
                name: vine.string(),
                price: vine.number(),
                variantId: vine.number()
              })
            )
          })
        ).optional(),
      })
    )

  })
);

export const orderCalculationValidator = vine.compile(
  vine.object({
    type: vine.enum(['dine_in', 'delivery', 'pickup']),
    manualDiscount: vine.number().optional(),
    orderItems: vine.array(
      vine.object({
        id: vine.number(),
        name: vine.string().nullable().optional(),
        description: vine.string().nullable().optional(),
        price: vine.number(),
        quantity: vine.number(),
        total: vine.number(),
        subTotal: vine.number(),
        discount: vine.number().optional(),
        discountType: vine.enum(['amount', 'percentage']).optional(),
        image: vine.object({
          url: vine.string().optional(),
        }).nullable().optional(),
        addons: vine.array(
          vine.object({
            id: vine.number(),
            name: vine.string(),
            price: vine.number(),
            quantity: vine.number(),
            image: vine.object({
              url: vine.string().optional(),
            }).nullable().optional(),
          })
        ).optional(),
        variants: vine.array(
          vine.object({
            id: vine.number(),
            name: vine.string(),
            price: vine.number().optional(),
            option: vine.array(
              vine.object({
                id: vine.number(),
                name: vine.string(),
                price: vine.number(),
                variantId: vine.number()
              })
            )
          })
        ).optional(),
      })
    )
  })
);

export const orderUpdateValidator = vine.compile(
  vine.object({
    userId: vine
      .number()
      .exists(async (db, value) => {
        return (
          db.from('users').where('id', value).andWhere('role_id', Roles.CUSTOMER).first() || false
        );
      })
      .optional(),
    type: vine.enum(['dine_in', 'delivery', 'pickup']),
    manualDiscount: vine.number().optional(),
    paymentType: vine.enum(['cash', 'card', 'paypal', 'stripe']),
    deliveryDate: vine.string().trim().optional().requiredWhen('type', '=', 'delivery'),
    vendorCost: vine.number().optional(),
    status: vine.enum((field) => {
      return getStatus(field.parent.type);
    }),
    customerNote: vine.string().nullable().optional(),
    paymentStatus: vine.enum(['paid', 'payment_requested', 'unpaid']).optional(),
    orderItems: vine.array(
      vine.object({
        id: vine.number(),
        name: vine.string().nullable().optional(),
        description: vine.string().nullable().optional(),
        price: vine.number(),
        quantity: vine.number(),
        total: vine.number().optional(),
        subTotal: vine.number().optional(),
        discount: vine.number().optional(),
        discountType: vine.enum(['amount', 'percentage']).optional(),
        image: vine.object({
          url: vine.string().optional(),
        }).nullable().optional(),
        addons: vine.array(
          vine.object({
            id: vine.number(),
            name: vine.string(),
            price: vine.number(),
            quantity: vine.number(),
            image: vine.object({
              url: vine.string().optional(),
            }).nullable().optional(),
          })
        ).optional(),
        variants: vine.array(
          vine.object({
            id: vine.number(),
            name: vine.string(),
            price: vine.number().optional(),
            option: vine.array(
              vine.object({
                id: vine.number(),
                name: vine.string(),
                price: vine.number(),
                variantId: vine.number()
              })
            )
          })
        ).optional(),
      })
    ).optional()
  })
);

export const customUpdateValidator = vine.compile(
  vine.object({
    status: vine
      .enum((field) => {
        return getStatus(field.parent.type);
      })
      .optional(),
    deliveryManId: vine
      .number()
      .exists(async (db, value) => {
        return db.from('users').where('id', value).andWhere('role_id', Roles.DELIVERY).first();
      })
      .optional(),
    deliveryAirportId: vine
      .number()
      .exists(async (db, value) => {
        return db.from('airports').where('id', value).first();
      })
      .optional(),
    paymentStatus: vine.enum(['paid', 'payment_requested', 'unpaid']).optional(),
    vendorCost: vine.number().optional(),
  })
);

export const bulkCustomUpdateValidator = vine.compile(
  vine.object({
    ids: vine
      .array(vine.number())
      .distinct()
      .compact()
      .use(idsExist({ table: 'orders', column: 'id' })),
    status: vine
      .enum((field) => {
        return getStatus(field.parent.type);
      })
      .optional(),
    deliveryManId: vine
      .number()
      .exists(async (db, value) => {
        return db.from('users').where('id', value).andWhere('role_id', Roles.DELIVERY).first();
      })
      .optional(),
    deliveryAirportId: vine
      .number()
      .exists(async (db, value) => {
        return db.from('airports').where('id', value).first();
      })
      .optional(),
    paymentStatus: vine.enum(['paid', 'payment_requested', 'unpaid']).optional()
  })
);

function getStatus(type: string) {
  if (['dine_in', 'pickup'].includes(type)) {
    return ['quote_pending', 'quote_sent', 'awaiting_vendor_quote', 'awaiting_vendor_confirmation', 'vendor_confirmed', 'awaiting_client_confirmation', 'client_confirmed', 'out_for_delivery', 'completed', 'cancelled_not_billable', 'cancelled_billable'] as const;
  }
  return [
    'quote_pending', 'quote_sent', 'awaiting_vendor_quote', 'awaiting_vendor_confirmation', 'vendor_confirmed', 'awaiting_client_confirmation', 'client_confirmed', 'out_for_delivery', 'completed', 'cancelled_not_billable', 'cancelled_billable',
  ] as const;
}
