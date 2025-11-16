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
import handleCopy from '@/utils/handle_copy';
import { useRef } from 'react';
import DeleteCustomer from './DeleteCustomer';
import EditCustomer from './EditCustomer';
import { CustomerType } from '@/types/customer_type';
import { useTranslation } from 'react-i18next';

type ViewCustomerProps = {
  customer: CustomerType;
  refresh: () => void;
};

export default function ViewCustomer({ customer, refresh }: ViewCustomerProps) {
  const { data } = useUserSingle(customer?.id);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation();

  const { fullName, companyName, email, secondEmail, phoneNumber, secondPhoneNumber, clientAddress, isSuspended } = data || {};

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
              {/* Full name */}
              <div className="border-b border-black/5 pb-6 space-y-1">
                <span className="text-secondary-500 text-sm font-medium">{t('Client name')}</span>
                <h2 className="text-3xl font-bold text-secondary-700">{fullName}</h2>
                <Badge colorScheme={isSuspended ? 'red' : 'green'}>
                  {t(isSuspended ? 'Suspended' : 'Active')}
                </Badge>
              </div>

              {/* Company name */}
              {companyName && (
                <div>
                  <span className="text-secondary-500 text-sm font-medium">{t('Company name')}</span>
                  <p className="text-lg text-secondary-700 font-medium">{companyName}</p>
                </div>
              )}

              {[
                // Primary email and phone
                { title: 'Email', value: email },
                { title: 'Phone number', value: phoneNumber },
                // Secondary email and phone (only if they exist)
                ...(secondEmail ? [{ title: 'Second email', value: secondEmail }] : []),
                ...(secondPhoneNumber ? [{ title: 'Second phone', value: secondPhoneNumber }] : []),
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <span className="text-secondary-500 text-sm font-medium">{t(item.title)}</span>
                    <p className="text-lg text-secondary-700 font-medium">{item.value}</p>
                  </div>
                  <Button
                    variant="outline"
                    rightIcon={<Copy size={16} color="currentColor" />}
                    onClick={() => handleCopy(item.value)}
                  >
                    {t('Copy')}
                  </Button>
                </div>
              ))}

              {/* Airport */}
              {/* <div>
                <span className="text-secondary-500 text-sm font-medium">{t('Airport')}</span>
                <p className="text-lg text-secondary-700 font-medium">{address}</p>
              </div> */}

              {/* Client address */}
              {clientAddress && (
                <div>
                  <span className="text-secondary-500 text-sm font-medium">{t('Client address')}</span>
                  <p className="text-lg text-secondary-700 font-medium">{clientAddress}</p>
                </div>
              )}
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
            <DeleteCustomer id={data?.id} refresh={refresh} />
            <EditCustomer customer={data} refresh={refresh} />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
