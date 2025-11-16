import { useRef } from 'react';
import {
  Badge,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { Eye } from 'iconsax-react';
import { useTranslation } from 'react-i18next';
import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import useWindowSize from '@/hooks/useWindowSize';
import DeleteTaxAndCharges from './DeleteTaxAndCharges';
import EditTaxAndCharges from './EditTaxAndCharges';

export default function ViewTaxAndCharges({
  data,
  refresh,
}: {
  data: Record<string, any>;
  refresh: () => void;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);
  const windowSize = useWindowSize();
  const { t } = useTranslation();

  return (
    <>
      <Button
        variant="outline"
        colorScheme="secondary"
        className="border-secondary-200 text-secondary-800 hover:bg-secondary-100"
        rightIcon={<Eye />}
        onClick={onOpen}
      >
        {t('View')}
      </Button>

      <Drawer
        isOpen={isOpen}
        placement={windowSize.width < 640 ? 'bottom' : 'right'}
        size="md"
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent className="h-[80%] sm:h-auto rounded-xl sm:rounded-none">
          <DrawerHeader className="border-b border-black/5">
            {t('Tax and Charges')}

            <DrawerCloseButton className="sm:hidden" />
          </DrawerHeader>

          <DrawerBody>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Text className="text-secondary-500">{t('Charge name')}</Text>
                <Text as="h5" fontSize="lg" fontWeight="semibold">
                  {t(data.name)}
                </Text>
              </div>

              <div className="flex flex-col gap-2">
                <Text className="text-secondary-500">{t('Charge type')}</Text>
                <Badge
                  size="lg"
                  variant="solid"
                  colorScheme={data.type === 'tax' ? 'blue' : 'primary'}
                  className="w-fit"
                >
                  {t(data.type)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Text className="text-secondary-500">{t('Charge amount')}</Text>
                  <Text as="h5" fontSize="lg" fontWeight="semibold">
                    {data.amountType === 'amount'
                      ? `${convertToCurrencyFormat(data.amount)}`
                      : `${data.amount}%`}
                  </Text>
                </div>

                <div className="flex flex-col gap-2">
                  <Text className="text-secondary-500">{t('Amount type')}</Text>
                  <Badge
                    size="lg"
                    variant="solid"
                    colorScheme={data.amountType === 'percentage' ? 'primary' : 'blue'}
                    className="w-fit"
                  >
                    {t(data.amountType)}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Text className="text-secondary-500">{t('Availability')}</Text>
                <Badge
                  size="lg"
                  variant="solid"
                  colorScheme={data.isAvailable ? 'green' : 'primary'}
                  className="w-fit"
                >
                  {t(data.isAvailable ? 'Available' : 'Unavailable')}
                </Badge>
              </div>
            </div>
          </DrawerBody>

          <DrawerFooter
            borderTopWidth="1px"
            borderColor="secondary.200"
            className="absolute bg-white w-full bottom-0"
          >
            <Button variant="outline" w="full" mr={3} onClick={onClose}>
              {t('Close')}
            </Button>
            <DeleteTaxAndCharges id={data?.id} refresh={refresh} />
            <EditTaxAndCharges data={data} refresh={refresh} />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
