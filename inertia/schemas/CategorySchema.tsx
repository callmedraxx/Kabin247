import * as Yup from 'yup';

// image type
const AllowImageType = ['image/jpeg', 'image/png', 'image/jpg'];

// Category schema
const CategorySchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  isAvailable: Yup.boolean().required('Availability is required'),
  priority: Yup.number().required('Priority is required'),
  image: Yup.mixed()
    .required('Image is required')
    .test('fileType', 'Unsupported file format', (value: any) => {
      return value && AllowImageType.includes(value.type);
    }),
});

export default CategorySchema;
