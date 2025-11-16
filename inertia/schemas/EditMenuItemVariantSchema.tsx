import * as yup from 'yup';

const EditMenuItemVariantSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  value: yup.string().required('Unique name is required'),
  allowMultiple: yup.boolean().required('Allow multiple selection must be specified'),
  requirement: yup
    .string()
    .oneOf(['required', 'optional'], 'Requirement must be either "required" or "optional"')
    .required('Requirement is required'),
  min: yup
    .number()
    .min(1, 'Min value must be at least 1')
    .required('Min value is required'),
  max: yup
    .number()
    .min(1, 'Max value must be at least 1')
    .required('Max value is required')
    .test(
      'max-greater-than-or-equal-to-min',
      'Max value must be greater than or equal to Min value',
      function (value) {
        return value >= this.parent.min; // Ensure `max` is greater than or equal to `min`
      }
    ),
  isAvailable: yup.boolean().required('Availability must be specified'),
  variantOptions: yup
    .array()
    .of(
      yup.object().shape({
        name: yup.string().required('Variant name is required'),
        price: yup.number().min(0, 'Price cannot be negative').required('Price is required'),
      })
    )
    .min(1, 'At least one variant option is required')
    .required('Variant options are required'),
});

export default EditMenuItemVariantSchema;
