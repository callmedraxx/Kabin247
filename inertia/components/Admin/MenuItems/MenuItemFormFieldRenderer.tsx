import {
  FormControl,
  FormLabel,
  RadioGroup,
  Stack,
  Flex,
  Textarea,
  FormErrorMessage,
  Text,
  Input,
  Radio,
} from '@chakra-ui/react';
import { match } from 'ts-pattern';
import { useField } from 'formik';
import { MenuItemAddonsSelection } from './MenuItemAddonsSelection';
import MenuItemCategorySelection from './MenuItemCategorySelection';
import MenuItemImageUpload from './MenuItemImageUpload';
import { MenuItemTaxAndCharges } from './MenuItemTaxAndCharges';
import { MenuItemVariantSelection } from './MenuItemVariantSelection';
import { useTranslation } from 'react-i18next';

export default function MenuItemFormFieldRenderer({
  label,
  type = 'text',
  previewImage = '',
  options,
  ...props
}: {
  label?: string;
  name: string;
  placeholder?: string;
  type?: string;
  options?: Record<'label' | 'value', string>[];
  previewImage?: string;
}) {
  const { t } = useTranslation();
  const [field, meta, helpers] = useField(props);
  return (
    <FormControl className="flex flex-col" isInvalid={!!(meta.touched && meta.error)}>
      {label && (
        <FormLabel color="secondary.500" fontWeight={500} fontSize={14} lineHeight={5}>
          {t(label)}
        </FormLabel>
      )}

      {match(type)
        // handle category input
        .with('combobox-category', () => (
          <MenuItemCategorySelection
            defaultValue={field.value}
            onChange={(category) => {
              helpers.setValue(category.id);
            }}
            placeholder={t('Search or select')}
          />
        ))

        // handle addons input
        .with('tag-addons', () => (
          <MenuItemAddonsSelection
            defaultValue={field.value ?? []}
            onSelect={(values) => {
              const ids = values.map((v) => v.id);
              helpers.setValue(ids);
            }}
          />
        ))

        // handle variant input
        .with('tag-variants', () => (
          <MenuItemVariantSelection
            defaultValues={field.value}
            onSelect={(values: any) => {
              const ids = values?.map((v: any) => v.value) ?? [];
              helpers.setValue(ids);
            }}
          />
        ))

        // handle charges input
        .with('tag-charges', () => (
          <MenuItemTaxAndCharges
            defaultValue={field.value}
            onSelect={(values: any) => {
              const ids = values?.map((v: any) => v.id) ?? [];
              helpers.setValue(ids);
            }}
          />
        ))

        // handle radio group types
        .with('radio-group', () => (
          <RadioGroup
            value={field.value}
            onChange={(value) => {
              helpers.setValue(value);
            }}
          >
            <Stack direction="row" gap={4} className="text-sm font-normal leading-5">
              {options?.map((option) => (
                <Radio
                  key={option.value}
                  value={option.value}
                  colorScheme="green"
                  borderColor="secondary.300"
                >
                  <Text fontSize={14}>{t(option.label)}</Text>
                </Radio>
              ))}
            </Stack>
          </RadioGroup>
        ))

        // file upload
        .with('file', () => (
          <Flex flexDir="column">
            <MenuItemImageUpload
              defaultValue={field.value ? URL.createObjectURL(field.value) : previewImage}
              onChange={(file) => helpers.setValue(file)}
            />

            <Text color="secondary.400" mt={4} fontSize={14} lineHeight={5}>
              {t('Max file size is 500kb. Supported file types are .jpg and .png.')}
            </Text>
          </Flex>
        ))

        // handle unmatched types
        .otherwise(() => {
          const Comp = type === 'textarea' ? Textarea : Input;
          return (
            <Comp
              className="focus:shadow-none focus:border-primary-500"
              type={type}
              {...(type === 'number' && { min: 0 })}
              {...field}
              {...props}
              placeholder={t(props.placeholder || '')}
            />
          );
        })}
      <FormErrorMessage>{t(meta.error || '')}</FormErrorMessage>
    </FormControl>
  );
}
