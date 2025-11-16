import * as Yup from 'yup';

const AllowImageType = ['image/jpeg', 'image/png', 'image/jpg'];

const NewMenuItemSchema = Yup.object().shape({
  name: Yup.string().nullable(),
  description: Yup.string().nullable(),
  categoryId: Yup.string().nullable(),
  foodType: Yup.string().nullable(),
  price: Yup.number().nullable().positive('Price must be a positive number'),
  discount: Yup.number().nullable().min(0, 'Discount cannot be negative'),
  discountType: Yup.string().nullable().oneOf(['percentage', 'amount'], 'Invalid discount type'),
  isAvailable: Yup.boolean().nullable(),
  image: Yup.mixed()
    .nullable()
    .test('fileType', 'Unsupported file format', (value: any) => {
      if (!value) return true;
      return value && AllowImageType.includes(value.type);
    }),
  chargeIds: Yup.array().of(Yup.string()).nullable(),
  addonIds: Yup.array().of(Yup.string()).nullable(),
  variantIds: Yup.array().of(Yup.string()).nullable(),
});

export default NewMenuItemSchema;
