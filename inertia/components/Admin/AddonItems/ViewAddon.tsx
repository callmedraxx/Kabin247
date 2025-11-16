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
import { AddonType } from '@/types/addon_type';
import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import DeleteAddon from './DeleteAddon';
import EditAddon from './EditAddon';
import useWindowSize from '@/hooks/useWindowSize';

export default function ViewAddon({ addon }: { addon: AddonType }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const windowSize = useWindowSize();
  const btnRef = useRef<HTMLButtonElement>(null);
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
            {t('Add-on')}
            <DrawerCloseButton className="sm:hidden" />
          </DrawerHeader>

          <DrawerBody className="flex-1 py-4">
            <div className="flex flex-col gap-5">
              <div className="w-full aspect-[2/1] bg-secondary-50">
                <img
                  src={addon?.image?.url}
                  alt={addon?.name}
                  className="w-full rounded-md aspect-[3/2]"
                  onError={(e) => (e.currentTarget.src = '/default_fallback.png')}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Text className="text-secondary-500">{t('Addon name')}</Text>
                <Text as="h5" fontSize="lg" fontWeight="semibold">
                  {t(addon.name)}
                </Text>
              </div>

              <div className="flex flex-col gap-2">
                <Text className="text-secondary-500">{t('Price')}</Text>
                <Text as="h5" fontSize="lg" fontWeight="semibold">
                  {convertToCurrencyFormat(addon.price)}
                </Text>
              </div>

              <div className="flex flex-col gap-2">
                <Text className="text-secondary-500">{t('Availability')}</Text>
                <Badge
                  size="lg"
                  variant="solid"
                  colorScheme={addon.isAvailable ? 'green' : 'primary'}
                  className="w-fit"
                >
                  {t(addon.isAvailable ? 'Available' : 'Unavailable')}
                </Badge>
              </div>
            </div>
          </DrawerBody>

          <DrawerFooter
            borderTopWidth="1px"
            borderColor="secondary.200"
            className="bg-white w-full gap-3 [&>button]:flex-1"
          >
            <Button variant="outline" onClick={onClose}>
              {t('Close')}
            </Button>
            <DeleteAddon id={addon.id} refresh={onClose} isIconButton={false} />
            <EditAddon addon={addon} refresh={onClose} isIconButton={false} />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
