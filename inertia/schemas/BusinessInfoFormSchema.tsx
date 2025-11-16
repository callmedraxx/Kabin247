import * as Yup from 'yup';

const BusinessInfoFormSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  siteUrl: Yup.string().required('Site Url is required'),
  email: Yup.string().email('Invalid email format').required('Email is required'),
  phone: Yup.string().required('Phone number is required'),
  address: Yup.string().required('Airport is required'),
  country: Yup.string().required('Country is required'),
  timeFormat: Yup.string().required('Time format is required'),
  timeZone: Yup.string().required('Time zone is required'),
});

export default BusinessInfoFormSchema;
