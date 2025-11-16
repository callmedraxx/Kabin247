import { Box, FormControl, Icon, FormErrorMessage, IconButton, Input, Spinner } from '@chakra-ui/react';
import { useField } from 'formik';
import { Eye, EyeSlash } from 'iconsax-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';

type Props = {
  name: string;
  type: string;
  label?: string;
  placeholder?: string;
  customError?: string;
  isLoading?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function FormField({ name, customError, isLoading, onChange, ...props }: Props) {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const [field, meta] = useField(name);
  
  const error = customError || meta.error;
  const isInvalid = !!(meta.touched && error);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    field.onChange(e);
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <FormControl isInvalid={isInvalid}>
      <Box className="relative border rounded-2xl px-4 py-1.5 border-secondary-300 focus-within:border-primary-500">
        {props.label && props.type !== 'password' && (
          <label className="text-xs leading-4 font-normal text-secondary-500">{props.label}</label>
        )}
        {match(props)
          .with({ type: 'password' }, () => (
            <>
              <Input
                rounded="full"
                type={show ? 'text' : props.type}
                placeholder={t(props.placeholder || '')}
                className="bg-white border-none leading-6 p-0 rounded-none font-normal text-base focus:outline-none focus:ring-0"
                {...field}
                onChange={handleChange}
              />

              <IconButton
                aria-label="Show password"
                size="sm"
                variant="ghost"
                onClick={() => setShow(!show)}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
              >
                <Icon as={show ? Eye : EyeSlash} className="size-5 text-secondary-600" />
              </IconButton>
            </>
          ))
          .otherwise(() => (
            <>
              <Input
                rounded="full"
                type={props.type}
                placeholder={t(props.placeholder || '')}
                className="bg-white border-none p-0 h-fit leading-6 rounded-none font-normal text-base focus:outline-none focus:ring-0"
                {...field}
                onChange={handleChange}
              />
              {isLoading && (
                <Box className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Spinner size="sm" color="primary.500" />
                </Box>
              )}
            </>
          ))}
      </Box>
      <FormErrorMessage className="px-4">{t(error || '')}</FormErrorMessage>
    </FormControl>
  );
}
