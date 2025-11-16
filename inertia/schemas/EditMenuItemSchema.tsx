import * as Yup from 'yup';

const AllowImageType = ['image/jpeg', 'image/png', 'image/jpg'];

const EditMenuItemSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  description: Yup.string().nullable(),
  categoryId: Yup.string().required('Category ID is required'),
  foodType: Yup.string().required('Food type is required'),
  price: Yup.number().required('Price is required').positive('Price must be a positive number'),
  discount: Yup.number().min(0, 'Discount cannot be negative'),
  discountType: Yup.string().oneOf(['percentage', 'amount'], 'Invalid discount type'),
  isAvailable: Yup.boolean().required('Availability is required'),
  image: Yup.mixed()
    .nullable()
    .test('fileType', 'Unsupported file format', (value) => {
      return !value || (value instanceof File && AllowImageType.includes(value.type));
    }),
  chargeIds: Yup.array().of(Yup.string()).nullable(),
  addonIds: Yup.array().of(Yup.string()).nullable(),
  variantIds: Yup.array().of(Yup.string()).nullable(),
});

export default EditMenuItemSchema;
