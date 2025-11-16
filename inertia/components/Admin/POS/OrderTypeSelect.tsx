import { Box, Flex, HStack } from '@chakra-ui/react';
import { TickCircle } from 'iconsax-react';
import { useTranslation } from 'react-i18next';

// Radio button
const RadioButton = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box as="label">
      <input type="radio" checked readOnly hidden />
      <Box
        cursor="not-allowed"
        borderRadius="6px"
        bg="primary.400"
        color="white"
        px={6}
        py={2.5}
        fontSize={18}
        fontWeight={600}
        lineHeight={7}
        h="48px"
        className="select-none"
        _hover={{}}
      >
        <HStack>
          <TickCircle
            variant="Bold"
            className="inline-block opacity-100 transition-opacity duration-300 ease-in-out"
          />
          <span>{children}</span>
        </HStack>
      </Box>
    </Box>
  );
};

// Always-selected Delivery option
export default function OrderTypeRadioGroup() {
  const { t } = useTranslation();

  return (
    <Flex className="flex-wrap gap-2">
      <RadioButton>{t('Delivery')}</RadioButton>
    </Flex>
  );
}
