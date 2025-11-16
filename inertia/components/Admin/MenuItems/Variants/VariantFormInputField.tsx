import {
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Radio,
  RadioGroup,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useField } from 'formik';
import { match } from 'ts-pattern';
import { useTranslation } from 'react-i18next';

export default function VariantFormInputField({
  label,
  type = 'text',
  options,
  ...props
}: {
  label?: string;
  name: string;
  placeholder?: string;
  type?: string;
  options?: { label: string; value: string }[];
}) {
  const { t } = useTranslation();
  const [field, meta, helpers] = useField(props);
  return (
    <FormControl className="flex flex-col" isInvalid={!!(meta.touched && meta.error)}>
      {label && type !== 'checkbox' && (
        <FormLabel color="secondary.500" fontWeight={500} fontSize={14} lineHeight={5}>
          {t(label)}
        </FormLabel>
      )}

      {match(type)
        // handle number input with controller
        .with('number-with-controller', () => (
          <NumberInput
            min={0}
            borderColor="secondary.200"
            value={field.value}
            onChange={(value) => helpers.setValue(value)}
          >
            <NumberInputField
              placeholder={t(props?.placeholder ?? '')}
              className="border border-secondary-200 focus:border-primary-500 outline-none focus:outline-none shadow-none focus:shadow-none"
            />
            <NumberInputStepper>
              <NumberIncrementStepper borderColor="secondary.200" />
              <NumberDecrementStepper borderColor="secondary.200" />
            </NumberInputStepper>
          </NumberInput>
        ))

        // handle checkbox
        .with('checkbox', () => (
          <label className="hover:cursor-pointer">
            <HStack spacing={2}>
              <Checkbox
                borderColor="secondary.200"
                colorScheme="green"
                size="md"
                className="[&>span]:border-secondary-200"
                defaultChecked={field.value}
                onChange={(e) => {
                  helpers.setValue(e.target.checked);
                }}
              />
              <Text fontSize={14} lineHeight={5} fontWeight={400}>
                {t(label ?? '')}
              </Text>
            </HStack>
          </label>
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
                  {t(option.label)}
                </Radio>
              ))}
            </Stack>
          </RadioGroup>
        ))

        // handle other inputs
        .otherwise(() => (
          <Input
            className="focus:shadow-none focus:border-primary-500"
            type={type}
            {...(type === 'number' && { min: 0 })}
            {...field}
            {...props}
            placeholder={t(props.placeholder || '')}
          />
        ))}

      <FormErrorMessage>{t(meta.error || '')}</FormErrorMessage>
    </FormControl>
  );
}
