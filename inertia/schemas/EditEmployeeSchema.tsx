import * as Yup from 'yup';

const EditEmployeeSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phoneNumber: Yup.string().required('Phone number is required'),
  address: Yup.string().required('Airport is required'),
  password: Yup.string().notRequired().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), undefined], 'Passwords must match')
    .notRequired(),
});

export default EditEmployeeSchema;
