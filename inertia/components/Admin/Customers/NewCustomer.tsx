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
  useDisclosure,
} from '@chakra-ui/react';
import { Add } from 'iconsax-react';
import { toast } from 'sonner';
import NewCustomerSchema from '@/schemas/NewCustomerSchema';
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
];

export default function NewCustomer({ refresh }: { refresh: () => void }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation();

  return (
    <>
      <Button
        variant="solid"
        colorScheme="primary"
        className="bg-primary-400 hover:bg-primary-500"
        rightIcon={<Add />}
        onClick={onOpen}
      >
        {t('Create new client')}
      </Button>
      <Drawer isOpen={isOpen} placement="right" size="md" onClose={onClose} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader className="border-b border-black/5">
            {t('Create new client')}
          </DrawerHeader>

          <Formik
            initialValues={{
              firstName: '',
              lastName: '',
              companyName: '',
              email: '',
              secondEmail: '',
              phoneNumber: '',
              secondPhoneNumber: '',
              address: '',
              clientAddress: '',
              roleId: 6,
              isEmailVerified: true,
            }}
            onSubmit={async (values, actions) => {
              try {
                actions.setSubmitting(true);
                const { data } = await axios.post('/api/users', values);
                if (data?.success) {
                  onClose();
                  refresh();
                  toast.success(t(data?.message) || t('Client created successfully'));
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
            {({ isSubmitting }) => (
              <Form className='overflow-y-auto'>
                <DrawerBody>
                  <div className="flex flex-col gap-5">
                    {fieldItems.map((item) => (
                      <FieldRenderer key={item.name} item={item} />
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
