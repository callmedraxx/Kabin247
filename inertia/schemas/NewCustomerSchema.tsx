import * as Yup from 'yup';

const NewCustomerSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().nullable(),
  companyName: Yup.string().nullable(),
  clientName: Yup.string().nullable(),
  email: Yup.string().email('Invalid email').required('Email is required'),
  secondEmail: Yup.string().email('Invalid email format').nullable().optional(),
  phoneNumber: Yup.string().required('Phone number is required'),
  secondPhoneNumber: Yup.string().nullable(),
  address: Yup.string().required('Airport is required'),
  clientAddress: Yup.string().nullable(),
});

export default NewCustomerSchema;
