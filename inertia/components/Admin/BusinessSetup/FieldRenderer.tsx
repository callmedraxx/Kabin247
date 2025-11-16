import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  RadioGroup,
  Radio,
  Text,
  Textarea,
} from '@chakra-ui/react';
import { useField, useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import CountrySelect from './SelectCountry';
import SelectTimeZone from './SelectTimeZone';
import UploadImage from './UploadImage';
import { debounce } from '@/utils/debounce';

type FormField = {
  name: string;
  type: string;
  label?: string;
  placeholder?: string;
  options?: { label: string; value: string }[];
  defaultPreview?: string;
};

// Debounced input change handler
const useDebouncedChangeHandler = (wait: number) => {
  const { setFieldValue, validateField } = useFormikContext();

  return debounce(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, fieldName: string) => {
      const { value } = event.target;
      setFieldValue(fieldName, value);
      validateField(fieldName);
    },
    wait
  );
};

export const FieldRenderer = ({ label, type, ...props }: FormField) => {
  const { t } = useTranslation();
  if (!props.name) return null;

  const [field, meta, helpers] = useField(props);
  const handleDebouncedChange = useDebouncedChangeHandler(300);

  return (
    <FormControl isInvalid={!!(meta.touched && meta.error)}>
      {label && <FormLabel className="text-sm text-secondary-800">{t(label)}</FormLabel>}

      {match(type)
        // Country selection
        .with('country', () => (
          <CountrySelect value={field.value || ''} onChange={helpers.setValue} />
        ))

        // Timezone selection
        .with('timezone', () => <SelectTimeZone onChange={helpers.setValue} />)

        // Radio group
        .with('radio_group', () => (
          <RadioGroup
            value={field.value}
            onChange={helpers.setValue}
            className="flex items-center gap-2"
          >
            {props?.options?.map((option) => (
              <Radio
                key={option.value}
                value={option.value}
                colorScheme="green"
                borderColor="secondary.300"
              >
                {t(option.label)}
              </Radio>
            ))}
          </RadioGroup>
        ))

        // File upload
        .with('file', () => (
          <>
            <UploadImage
              defaultValue={props?.defaultPreview || ''}
              onChange={(file) => helpers.setValue(file)}
            />

            <Text as="p" className="text-sm font-normal text-secondary-400 mt-4">
              {t('Max file size is 500kb. Supported file types are .jpg and .png.')}
            </Text>
          </>
        ))

        // Textarea
        .with('textarea', () => (
          <Textarea
            defaultValue={field.value}
            onChange={(e) => handleDebouncedChange(e, props.name)}
            placeholder={t(props.placeholder || '')}
            rows={4}
            className="focus:shadow-none focus:border-primary-500"
          />
        ))

        // Other text fields
        .otherwise(() => (
          <Input
            size="lg"
            type={type}
            placeholder={t(props.placeholder || '')}
            defaultValue={field.value}
            onChange={(e) => handleDebouncedChange(e, props.name)}
            className="placeholder:text-secondary-500"
          />
        ))}

      <FormErrorMessage data-error className="max-h-fit" style={{ height: 'object-fit' }}>
        {t(meta.error || '')}
      </FormErrorMessage>
    </FormControl>
  );
};
