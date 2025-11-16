import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import { Box, HStack, useRadio, useRadioGroup } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

const RadioButton = (props: any) => {
  const { getInputProps, getRadioProps } = useRadio(props);

  return (
    <Box as="label">
      <input {...getInputProps()} />
      <Box
        {...getRadioProps()}
        cursor="pointer"
        borderRadius="6px"
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
        px={3}
        py={1}
        fontSize={14}
        fontWeight={600}
        lineHeight={6}
        transition="background-color 0.3s ease, color 0s ease"
        color="secondary.800"
      >
        <HStack>
          <span>{props.children}</span>
        </HStack>
      </Box>
    </Box>
  );
};

// render discount type selection button group
export default function DiscountTypeRadioGroup({
  defaultValue = 'amount',
  onChange,
}: {
  defaultValue?: 'amount' | 'percentage';
  onChange?: (nextValue: string) => void;
}) {
  const { t } = useTranslation();
  const options = [
    { label: convertToCurrencyFormat(0, { symbolOnly: true }), value: 'amount' },
    { label: '%', value: 'percentage' },
  ];

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'discountType',
    defaultValue,
    onChange,
  });

  return (
    <HStack {...getRootProps()} bg="secondary.100" borderRadius="6px" padding={1} gap={0} h="40px">
      {options.map((option) => (
        <RadioButton key={option.value} {...getRadioProps(option)}>
          {t(option.label)}
        </RadioButton>
      ))}
    </HStack>
  );
}
