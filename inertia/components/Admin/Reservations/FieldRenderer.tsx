import { useField, useFormikContext } from 'formik';
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Textarea,
} from '@chakra-ui/react';
import { match } from 'ts-pattern';
import CustomerSelection from './CustomerSelection';
import { Minus, Add, ArrowDown2 } from 'iconsax-react';
import { useTranslation } from 'react-i18next';
import DatePicker from '@/components/common/DatePicker';
import TimePicker from '@/components/common/TimePicker';
import { startCase } from '@/utils/string_formatter';

type Field = Record<string, any> & {
  name: string;
  type: string;
  label?: string;
  placeholder?: string;
  toggleCreationMode?: (status: boolean) => void;
  isHidden?: boolean;
};

export default function FieldRenderer({ isHidden = false, toggleCreationMode, ...props }: Field) {
  const { t } = useTranslation();
  const [field, meta, helpers] = useField(props);
  const { values } = useFormikContext();

  if (isHidden) return null;

  return (
    <FormControl isInvalid={!!(meta.touched && meta.error)}>
      {props.label && (
        <FormLabel className="text-sm text-secondary-500"> {t(props.label)} </FormLabel>
      )}

      {match(props.type)
        // type === "customer"
        .with('customer', () => (
          <CustomerSelection
            toggleCreationMode={toggleCreationMode}
            onSelect={(customer) => helpers.setValue(customer.id)}
          />
        ))

        .with('select', () => (
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ArrowDown2 />}
              variant="outline"
              className="w-full text-left justify-start"
            >
              <Text color={field.value ? 'inherit' : 'secondary.400'}>
                {startCase(t(field.value))}
              </Text>
            </MenuButton>
            <MenuList className="p-1">
              {props.options?.map((option: { label: string; value: string }) => (
                <MenuItem key={option.value} onClick={() => helpers.setValue(option.value)}>
                  {option.label}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        ))

        // type === "numberWithController"
        .with('numberWithController', () => (
          <InputGroup>
            <InputLeftAddon
              as={Button}
              onClick={() => helpers.setValue(field.value - 1)}
              className="bg-secondary-100"
              isDisabled={field.value <= 1}
            >
              <Minus size={24} />
            </InputLeftAddon>

            <Input {...field} type="number" />

            <InputRightAddon
              as={Button}
              onClick={() => helpers.setValue(field.value + 1)}
              className="bg-secondary-100"
            >
              <Add size={24} />
            </InputRightAddon>
          </InputGroup>
        ))

        .with('datepicker', () => (
          <DatePicker
            selected={field.value}
            onSelect={(date?: Date) => {
              helpers.setValue(date || new Date());
            }}
          />
        ))

        .with('time', () => (
          <TimePicker
            minTime={field.name === 'endTime' ? (values as any).startTime : new Date(0, 0, 0, 0, 0)}
            selected={field.value}
            onSelect={helpers.setValue}
          />
        ))

        .with('textarea', () => (
          <Textarea {...props} {...field} className="focus:shadow-none focus:border-primary-500" />
        ))
        // other types
        .with('text', 'password', 'email', 'tel', 'number', () => <Input {...props} {...field} />)
        .otherwise(() => null)}
      <FormErrorMessage>{meta.error}</FormErrorMessage>
    </FormControl>
  );
}
