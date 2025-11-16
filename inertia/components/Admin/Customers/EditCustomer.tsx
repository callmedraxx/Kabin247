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
  useDisclosure,
} from '@chakra-ui/react';
import { toast } from 'sonner';
import NewCustomerSchema from '@/schemas/NewCustomerSchema';
import { Edit2 } from 'iconsax-react';
import { BaseUserType } from '@/types/customer_type';
import { useTranslation } from 'react-i18next';
import FieldRenderer from '../FieldRenderer';

// Field items configuration
const fieldItems = [
  { name: 'firstName', label: 'First name', type: 'text', placeholder: 'Client first name' },
  { name: 'lastName', label: 'Last name', type: 'text', placeholder: 'Client last name' },
  { name: 'companyName', label: 'Company name', type: 'text', placeholder: 'Company name' },
  { name: 'email', label: 'Email address', type: 'email', placeholder: 'Primary email address' },
  { name: 'secondEmail', label: 'Second email (Optional)', type: 'email', placeholder: 'Secondary email address' },
  { name: 'phoneNumber', label: 'Phone number', type: 'text', placeholder: 'Primary phone number' },
  { name: 'secondPhoneNumber', label: 'Second phone (Optional)', type: 'text', placeholder: 'Secondary phone number' },
  // { name: 'address', label: 'Airport', type: 'text', placeholder: 'Airport' },
  { name: 'clientAddress', label: 'Client address', type: 'text', placeholder: 'Client physical address' },
  { name: 'isSuspended', label: 'Acc. Status', type: 'switch', placeholder: 'Suspended' },
  {
    name: 'isEmailVerified',
    label: 'Email verified',
    type: 'switch',
    placeholder: 'Email verified',
  },
];

export default function EditCustomer({
  isIconButton = false,
  customer,
  refresh,
}: {
  isIconButton?: boolean;
  customer: BaseUserType;
  refresh: () => void;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation();

  const { id, firstName, lastName, companyName, email, secondEmail, phoneNumber, secondPhoneNumber, address, clientAddress, isSuspended, isEmailVerified } =
    customer || {};

  return (
    <>
      {isIconButton ? (
        <IconButton
          aria-label="Edit"
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
          width="full"
          className="hover:bg-blue-100 text-blue-600"
          variant="outline"
          onClick={onOpen}
        >
          {t('Edit')}
        </Button>
      )}
      <Drawer isOpen={isOpen} placement="right" size="md" onClose={onClose} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader className="border-b border-black/5">{t('Edit customer')}</DrawerHeader>

          <Formik
            initialValues={{
              firstName: firstName ?? '',
              lastName: lastName ?? '',
              companyName: companyName ?? '',
              email: email ?? '',
              secondEmail: secondEmail ?? '',
              phoneNumber: phoneNumber ?? '',
              secondPhoneNumber: secondPhoneNumber ?? '',
              address: address ?? '',
              clientAddress: clientAddress ?? '',
              password: '',
              roleId: 6,
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
                  toast.success(t(data?.message) || 'Client updated successfully');
                }
              } catch (e) {
                toast.error(t(e.response.data.message) || t('Something went wrong'));
              } finally {
                actions.setSubmitting(false);
              }
            }}
            validationSchema={NewCustomerSchema}
            className="h-full"
          >
            {({ isSubmitting, setFieldValue }) => (
              <Form className='overflow-y-scroll'>
                <DrawerBody className="space-y-4">
                  <div className="flex flex-col gap-5">
                    {fieldItems.map((item) => (
                      <FieldRenderer key={item.name} item={item} setFieldValue={setFieldValue} />
                    ))}
                  </div>
                </DrawerBody>
                <DrawerFooter
                  borderTopWidth="1px"
                  borderColor="secondary.200"
                  className="bg-white w-full bottom-0"
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
