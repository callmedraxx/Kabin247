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
import handleRoleColor from '@/utils/handle_role_color';
import handleRoleName from '@/utils/handle_role_name';
import EditEmployees from './EditEmployee';
import handleCopy from '@/utils/handle_copy';
import { useRef } from 'react';
import { CustomerType } from '@/types/customer_type';
import DeleteEmployee from './DeleteEmployee';
import { useTranslation } from 'react-i18next';

type ViewEmployeesProps = {
  employee: CustomerType;
  refresh: () => void;
};

export default function ViewEmployee({ employee, refresh }: ViewEmployeesProps) {
  const { t } = useTranslation();
  const { data } = useUserSingle(employee?.id);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);

  const { fullName, email, phoneNumber, address, isSuspended, roleId } = data || {};

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
            <div className="p-8 space-y-6 shadow-primary rounded-md mb-7">
              <div>
                <p className="text-secondary-400 text-sm font-medium mb-2">{t('Role')}</p>
                <Button className={`${handleRoleColor(roleId)} uppercase`}>
                  {handleRoleName(roleId)}
                </Button>
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
            <DeleteEmployee id={data?.id} refresh={refresh} />
            <EditEmployees employee={data} refresh={refresh} />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
