import { PageProps } from '@/types';
import { Box, Flex, HStack, useRadio, useRadioGroup } from '@chakra-ui/react';
import { usePage } from '@inertiajs/react';
import { TickCircle } from 'iconsax-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Radio button
const RadioButton = (props: any) => {
  const { getInputProps, getRadioProps } = useRadio(props);

  return (
    <Box as="label" data-disabled={!!props.disabled} className="data-[disabled=true]:hidden">
      <input {...getInputProps()} disabled={props.disabled} />
      <Box
        {...getRadioProps()}
        cursor="pointer"
        borderRadius="full"
        bg="transparent"
        border="1px"
        borderColor="secondary.200"
        _checked={{
          'bg': 'primary.400',
          'color': 'white',
          '& svg': {
            display: 'inline-block',
            opacity: 1,
            transition: 'opacity 0.3s ease-in-out',
          },
          'width': 'auto',
        }}
        px={8}
        py={4}
        fontSize={16}
        fontWeight={500}
        lineHeight={6}
        transition="background-color 0.3s ease, color 0s ease"
        textTransform="uppercase"
        className="select-none"
      >
        <HStack>
          <TickCircle
            variant="Bold"
            className="hidden opacity-0 transition-opacity duration-300 ease-in-out"
          />
          <span>{props.children}</span>
        </HStack>
      </Box>
    </Box>
  );
};

type OrderType = 'delivery' | 'pickup';

// render order type selection button group
export default function OrderTypeRadioGroup({
  onChange,
}: {
  onChange?: (nextValue: OrderType) => void;
}) {
  const { t } = useTranslation();
  const {
    props: { branding },
  } = usePage() as { props: PageProps };

  const options = [
    { label: 'Delivery', value: 'delivery', disabled: !branding?.business?.delivery },
    // { label: 'Pick-up', value: 'pickup', disabled: !branding?.business?.pickup },
  ];

  // Find the first non-disabled option
  const defaultOption = (options.find((option) => !option.disabled)?.value ||
    options[0].value) as OrderType;

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'orderType',
    onChange,
    defaultValue: defaultOption,
  });

  useEffect(() => {
    if (branding?.business) {
      onChange?.(defaultOption as OrderType);
    }
  }, [defaultOption, branding]);

  return (
    <Flex {...getRootProps({ className: 'flex-wrap gap-2' })}>
      {options.map((option) => (
        <RadioButton key={option.value} {...getRadioProps(option)}>
          {t(option.label)}
        </RadioButton>
      ))}
    </Flex>
  );
}
