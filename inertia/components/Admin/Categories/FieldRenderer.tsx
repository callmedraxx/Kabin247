import { FormControl, FormErrorMessage, FormLabel, Input, Text } from '@chakra-ui/react';
import { useField } from 'formik';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import ImageUpload from './ImageUpload';

interface IFieldRenderer {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  preview?: string;
}

export default function FieldRenderer({ label, type, preview = '', ...props }: IFieldRenderer) {
  const { t } = useTranslation();
  const [field, meta, helpers] = useField(props);

  return (
    <FormControl isInvalid={!!(meta.touched && meta.error)}>
      {label && (
        <FormLabel
          className={`text-sm ${props.name === 'image' ? 'text-secondary-900' : 'text-secondary-500'}`}
        >
          {t(label)}
        </FormLabel>
      )}

      {match(type)
        // image  upload
        .with('file', () => (
          <>
            <ImageUpload defaultValue={preview} onChange={(file) => helpers.setValue(file)} />
            <Text as="p" color="secondary.400" mt="18px">
              *The image should be 64x64px in PNG/JPG format*
            </Text>
          </>
        ))

        // other text field
        .otherwise(() => (
          <Input type={type} placeholder={t(props.placeholder || '')} {...field} {...props} />
        ))}

      <FormErrorMessage>{t(meta.error || '')}</FormErrorMessage>
    </FormControl>
  );
}
