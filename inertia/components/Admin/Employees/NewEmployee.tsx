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
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from '@chakra-ui/react';
import { Add, ArrowDown2 } from 'iconsax-react';
import { toast } from 'sonner';
import handleRoleColor from '@/utils/handle_role_color';
import handleRoleName from '@/utils/handle_role_name';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import FieldRenderer from '../FieldRenderer';
import NewEmployeeSchema from '@/schemas/NewEmployeeSchema';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

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
];

export default function NewEmployee({ refresh }: { refresh: () => void }) {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);

  const {
    props: { auth },
  } = usePage() as { props: PageProps };

  return (
    <>
      <Button
        variant="solid"
        colorScheme="primary"
        className="bg-primary-400 hover:bg-primary-500"
        rightIcon={<Add />}
        onClick={onOpen}
      >
        {t('Create new employee')}
      </Button>
      <Drawer isOpen={isOpen} placement="right" size="md" onClose={onClose} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent className=" h-screen grid grid-rows-[64px_1fr] overflow-hidden">
          <DrawerHeader className="border-b border-black/5">
            {t('Create new employee')}
          </DrawerHeader>

          <Formik
            initialValues={{
              firstName: '',
              lastName: '',
              email: '',
              phoneNumber: '',
              address: '',
              roleId: 4,
            }}
            onSubmit={async (values, actions) => {
              try {
                actions.setSubmitting(true);
                const { data } = await axios.post('/api/users', values);
                if (data?.success) {
                  onClose();
                  refresh();
                  toast.success(t(data?.message) || t('Employee created successfully'));
                }
              } catch (e) {
                toast.error(t(e.response.data.message) || t('Something went wrong'));
              } finally {
                actions.setSubmitting(false);
              }
            }}
            validationSchema={NewEmployeeSchema}
          >
            {({ values, isSubmitting, setFieldValue }) => (
              <Form className="flex flex-col flex-1 overflow-hidden">
                <DrawerBody className="gap-y-4 flex-1 overflow-y-auto">
                  <div className="flex flex-col gap-5 border-b border-black/5 pb-4">
                    {fieldItems.map((item) => (
                      <FieldRenderer key={item.name} item={item} />
                    ))}
                  </div>
                  <div>
                    <p className="text-secondary-400 text-sm font-medium mb-2">{t('Role')}</p>
                    <Menu placement="bottom-start">
                      <MenuButton
                        as={Button}
                        className={`${handleRoleColor(values?.roleId)} w-full uppercase`}
                        rightIcon={<ArrowDown2 size="16" />}
                      >
                        {handleRoleName(values?.roleId)}
                      </MenuButton>
                      <MenuList className="p-1">
                        {auth?.roleId !== 2 && (
                          <MenuItem onClick={() => setFieldValue('roleId', 1)}>
                            {t('Admin')}
                          </MenuItem>
                        )}
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
                </DrawerBody>
                <DrawerFooter
                  borderTopWidth="1px"
                  borderColor="secondary.200"
                  className="bg-white w-full"
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
                    rightIcon={<Add />}
                  >
                    {t('Create')}
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
