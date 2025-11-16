import * as Yup from 'yup';

const AllowImageType = ['image/jpeg', 'image/png', 'image/jpg'];

// Image file schema
// Image file schema
const ImageSchema = Yup.mixed()
  .nullable()
  .test('fileType', 'Unsupported file format', (value) => {
    if (!value) return true;
    return value instanceof File && AllowImageType.includes(value.type);
  });

//  url and domain validation
const urlOrDomainValidator = Yup.string()
  .test('is-url-or-domain', 'Invalid URL', (value) => {
    if (!value) return true; // Allow null or empty
    const urlPattern = /^(https?:\/\/)?(www\.)?([\w-]+\.)+[\w-]+(\/[\w-]*)*(\?[\w-=&]*)?$/;
    return urlPattern.test(value);
  })
  .nullable();

// Validation Schema
const SiteSettingFormSchema = Yup.object().shape({
  favicon: Yup.mixed()
    .nullable()
    .test('fileType', 'Unsupported file format', (value) => {
      if (!value) return true;
      return value instanceof File && [...AllowImageType, 'image/ico'].includes(value.type);
    }),
  logo: ImageSchema,
  minimizedLogo: ImageSchema,
  companySlogan: Yup.string().nullable(),
  copyrightText: Yup.string().required('Copyright text is required'),
  facebook: urlOrDomainValidator,
  instagram: urlOrDomainValidator,
  twitter: urlOrDomainValidator,

  // about us page
  aboutUsImage: ImageSchema,
  aboutUsHeading: Yup.string().required('Page heading text is required'),
  aboutUsDescription: Yup.string().required('Page description is required'),

  // contact us page
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email format').required('Email is required'),
  phone: Yup.string().required('Phone number is required'),
  address: Yup.string().required('Airport is required'),
  country: Yup.string().required('Country is required'),
  contactUsImage: ImageSchema,

  // terms & condition , privacy policy and return policy
  termsAndConditions: Yup.string().required('Terms and conditions is required'),
  privacyPolicy: Yup.string().required('Privacy policy is required'),
  returnPolicy: Yup.string().required('Return policy is required'),
});

export default SiteSettingFormSchema;
