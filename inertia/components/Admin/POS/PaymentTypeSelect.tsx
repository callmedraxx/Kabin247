import { Box, HStack, useRadio, useRadioGroup } from '@chakra-ui/react';
import { TickCircle } from 'iconsax-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Radio button
const RadioButton = (props: any) => {
  const { getInputProps, getRadioProps } = useRadio(props);

  return (
    <Box as="label">
      <input {...getInputProps()} />
      <Box
        {...getRadioProps()}
        cursor="pointer"
        borderRadius="6px"
        bg="secondary.100"
        _checked={{
          'bg': 'blue.400',
          'color': 'white',
          '& svg': {
            display: 'inline-block',
            opacity: 1,
            transition: 'opacity 0.3s ease-in-out',
          },
          'width': 'auto',
        }}
        px={4}
        py={2}
        fontSize={16}
        fontWeight={600}
        lineHeight={6}
        transition="background-color 0.3s ease, color 0s ease"
        color="secondary.800"
        h="40px"
      >
        <HStack>
          <TickCircle
            variant="Bold"
            size={16}
            className="hidden opacity-0 transition-opacity duration-300 ease-in-out"
          />
          <span>{props.children}</span>
        </HStack>
      </Box>
    </Box>
  );
};

// render payment type selection button group
export default function PaymentTypeRadioGroup({
  defaultValue = 'card',
  onChange,
}: {
  defaultValue: string;
  onChange?: (nextValue: string) => void;
}) {
  const { t } = useTranslation();
  const options = [
    { label: 'Card', value: 'card' },
    { label: 'ACH', value: 'ach' },
  ];

  const { getRootProps, getRadioProps, setValue } = useRadioGroup({
    name: 'paymentType',
    defaultValue: defaultValue || 'card',
    onChange,
  });

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  return (
    <HStack {...getRootProps()}>
      {options.map((option) => (
        <RadioButton key={option.value} {...getRadioProps(option)}>
          {t(option.label)}
        </RadioButton>
      ))}
    </HStack>
  );
}
