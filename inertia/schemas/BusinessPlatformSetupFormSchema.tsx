import * as Yup from 'yup';

const AllowImageType = ['image/jpeg', 'image/png', 'image/jpg'];

// Image file schema
const ImageSchema = Yup.mixed()
  .nullable()
  .test('fileType', 'Unsupported file format', (value) => {
    if (!value) return true;
    return value instanceof File && AllowImageType.includes(value.type);
  });

// Validation Schema
const BusinessPlatformSetupFormSchema = Yup.object().shape({
  maintenanceMode: Yup.boolean(),
  dineIn: Yup.boolean(),
  delivery: Yup.boolean(),
  pickup: Yup.boolean(),
  deliveryCharge: Yup.number().required('Delivery charge is required'),
  currencyCode: Yup.string().required('Currency code is required'),
  currencySymbolPosition: Yup.string().required('Currency symbol position is required'),
  guestCheckout: Yup.boolean(),
  loginOnlyVerifiedEmail: Yup.boolean(),
  sortCategories: Yup.string().required('Sort categories selection is required'),
  notificationSound: Yup.boolean(),
  logo: ImageSchema,
  favicon: ImageSchema,
});

export default BusinessPlatformSetupFormSchema;
