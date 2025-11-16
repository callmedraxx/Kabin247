import * as Yup from 'yup';

const PaymentMethodSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  public: Yup.string().optional(),
  secret: Yup.string().optional(),
  mode: Yup.string().optional(),
  webhook: Yup.string().optional(),
});

export default PaymentMethodSchema;
