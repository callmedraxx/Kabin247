import { useRef } from 'react';
import axios from 'axios';
import { Form, Formik } from 'formik';
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from '@chakra-ui/react';
import { toast } from 'sonner';
import { ArrowDown2, Edit2 } from 'iconsax-react';
import handleRoleName from '@/utils/handle_role_name';
import handleRoleColor from '@/utils/handle_role_color';
import { BaseUserType } from '@/types/customer_type';
import { useTranslation } from 'react-i18next';
import FieldRenderer from '../FieldRenderer';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import EditEmployeeSchema from '@/schemas/EditEmployeeSchema';

// Field items configuration
const fieldItems = [
  { name: 'firstName', label: 'First name', type: 'text', placeholder: 'Employee first name' },
  { name: 'lastName', label: 'Last name', type: 'text', placeholder: 'Employee last name' },
  { name: 'email', label: 'Email address', type: 'email', placeholder: 'Email address' },
  { name: 'phoneNumber', label: 'Contact number', type: 'text', placeholder: 'Contact number' },
  { name: 'address', label: 'Airport', type: 'text', placeholder: 'Airport' },
  { name: 'password', label: 'Password', type: 'password', placeholder: 'Password' },
  {
    name: 'confirmPassword',
    label: 'Confirm password',
    type: 'password',
    placeholder: 'Confirm password',
  },
  { name: 'isSuspended', label: 'Acc. Status', type: 'switch', placeholder: '' },
  { name: 'isEmailVerified', label: 'Verify email', type: 'switch', placeholder: '' },
];

export default function EditEmployee({
  isIconButton,
  employee,
  refresh,
}: {
  isIconButton?: boolean;
  employee: BaseUserType;
  refresh: () => void;
}) {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);
  const {
    props: { auth },
  } = usePage() as { props: PageProps };

  const {
    id,
    firstName,
    lastName,
    email,
    phoneNumber,
    address,
    isSuspended,
    isEmailVerified,
    roleId,
  } = employee || {};

  return (
    <>
      {isIconButton ? (
        <IconButton
          aria-label={t('Edit')}
          icon={<Edit2 size="18" color="currentColor" />}
          colorScheme="blue"
          className="hover:bg-blue-100 text-blue-600"
          variant="outline"
          onClick={onOpen}
        />
      ) : (
        <Button
          aria-label="Edit"
          rightIcon={<Edit2 size="18" />}
          colorScheme="blue"
          className="hover:bg-blue-100 text-blue-600"
          variant="outline"
          width="full"
          onClick={onOpen}
        >
          {t('Edit')}
        </Button>
      )}
      <Drawer isOpen={isOpen} placement="right" size="md" onClose={onClose} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent className=" h-screen grid grid-rows-[64px_1fr] overflow-hidden">
          <DrawerHeader className="border-b border-black/5">{t('Edit employee')}</DrawerHeader>

          <Formik
            initialValues={{
              firstName: firstName ?? '',
              lastName: lastName ?? '',
              email: email ?? '',
              phoneNumber: phoneNumber ?? '',
              address: address ?? '',
              password: '',
              roleId: roleId ?? 6,
              isSuspended: !isSuspended,
              isEmailVerified: !!isEmailVerified,
            }}
            onSubmit={async (values, actions) => {
              try {
                actions.setSubmitting(true);
                const { data } = await axios.put(`/api/users/${id}`, {
                  ...values,
                  isSuspended: values.isSuspended ? 0 : 1,
                });
                if (data?.success) {
                  onClose();
                  refresh();
                  toast.success(t(data?.message) || t('Employee updated successfully'));
                }
              } catch (e) {
                toast.error(t(e.response.data.message) || t('Something went wrong'));
              } finally {
                actions.setSubmitting(false);
              }
            }}
            validationSchema={EditEmployeeSchema}
          >
            {({ values, isSubmitting, setFieldValue }) => (
              <Form className="flex flex-col flex-1 overflow-hidden">
                <DrawerBody className="gap-y-4 flex-1 overflow-y-auto">
                  <div className="flex flex-col gap-5 border-b border-black/5 pb-4">
                    {fieldItems.map((item) => (
                      <FieldRenderer key={item.name} item={item} setFieldValue={setFieldValue} />
                    ))}
                  </div>
                  {auth?.roleId !== 2 && (
                    <div className="py-2">
                      <p className="text-secondary-400 text-sm font-medium mb-2">{t('Role')}</p>
                      <Menu placement="bottom-start">
                        <MenuButton
                          as={Button}
                          disabled={id === auth?.id}
                          className={`${handleRoleColor(values?.roleId)} w-full uppercase`}
                          rightIcon={<ArrowDown2 size="16" />}
                        >
                          {handleRoleName(values?.roleId)}
                        </MenuButton>
                        <MenuList className="p-1">
                          <MenuItem onClick={() => setFieldValue('roleId', 1)}>
                            {t('Admin')}
                          </MenuItem>
                          <MenuItem onClick={() => setFieldValue('roleId', 3)}>
                            {t('POS Operator')}
                          </MenuItem>
                          <MenuItem onClick={() => setFieldValue('roleId', 2)}>
                            {t('Manager')}
                          </MenuItem>
                          <MenuItem onClick={() => setFieldValue('roleId', 4)}>
                            {t('Display')}
                          </MenuItem>
                          <MenuItem onClick={() => setFieldValue('roleId', 5)}>
                            {t('Kitchen')}
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </div>
                  )}
                </DrawerBody>
                <DrawerFooter
                  borderTopWidth="1px"
                  borderColor="secondary.200"
                  className=" bg-white w-full"
                >
                  <Button variant="outline" w="full" mr={3} onClick={onClose}>
                    {t('Cancel')}
                  </Button>
                  <Button
                    variant="solid"
                    colorScheme="primary"
                    w="full"
                    type="submit"
                    isLoading={isSubmitting}
                    className="bg-primary-400 hover:bg-primary-500"
                  >
                    {t('Save')}
                  </Button>
                </DrawerFooter>
              </Form>
            )}
          </Formik>
        </DrawerContent>
      </Drawer>
    </>
  );
}
