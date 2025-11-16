import {
  Badge,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { Copy, Eye } from 'iconsax-react';
import useUserSingle from '@/data/use_user_single';
import EditDelivery from './EditDelivery';
import handleCopy from '@/utils/handle_copy';
import { CustomerType } from '@/types/customer_type';
import { useRef } from 'react';
import DeleteDelivery from './DeleteDelivery';
import { useTranslation } from 'react-i18next';

type ViewDeliveryProps = {
  delivery: CustomerType;
  refresh: () => void;
};

export default function ViewDelivery({ delivery, refresh }: ViewDeliveryProps) {
  const { t } = useTranslation();
  const { data } = useUserSingle(delivery?.id);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);

  const { fullName, email, phoneNumber, address, isSuspended } = data || {};

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
      <Drawer isOpen={isOpen} placement="right" size="md" onClose={onClose} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerBody py="6">
            <div className="p-8 space-y-6 shadow-primary rounded-md mb-7">
              <div className="border-b border-black/5 pb-6 space-y-1">
                <span className="text-secondary-500 text-sm font-medium">{t('Delivery person name')}</span>
                <h2 className="text-3xl font-bold text-secondary-700">{fullName}</h2>
                <Badge colorScheme={isSuspended ? 'red' : 'green'}>
                  {isSuspended ? t('Suspended') : t('Active')}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-secondary-500 text-sm font-medium">{t('Email')}</span>
                  <p className="text-lg text-secondary-700 font-medium">{email}</p>
                </div>
                <Button
                  variant="outline"
                  rightIcon={<Copy size={16} color="currentColor" />}
                  onClick={() => handleCopy(email)}
                >
                  {t('Copy')}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-secondary-500 text-sm font-medium">{t('Contact number')}</span>
                  <p className="text-lg text-secondary-700 font-medium">{phoneNumber}</p>
                </div>
                <Button
                  variant="outline"
                  rightIcon={<Copy size={16} color="currentColor" />}
                  onClick={() => handleCopy(phoneNumber)}
                >
                  {t('Copy')}
                </Button>
              </div>
              <div>
                <span className="text-secondary-500 text-sm font-medium">{t('Airport')}</span>
                <p className="text-lg text-secondary-700 font-medium">{address}</p>
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
            <DeleteDelivery id={data?.id} refresh={refresh} />
            <EditDelivery delivery={data} refresh={refresh} />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
