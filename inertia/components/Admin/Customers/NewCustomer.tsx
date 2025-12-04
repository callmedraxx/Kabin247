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
              // Ensure all fields are touched so errors are visible
              if (values) {
                const fieldNames = Object.keys(values);
                fieldNames.forEach((field) => {
                  actions.setFieldTouched(field, true);
                });
              }

              try {
                actions.setSubmitting(true);
                // Prepare payload - handle address fields properly
                const payload: any = {
                  firstName: values?.firstName?.trim() || '',
                  lastName: values?.lastName?.trim() || undefined,
                  companyName: values?.companyName?.trim() || undefined,
                  email: values?.email?.trim() || '',
                  secondEmail: values?.secondEmail?.trim() || undefined,
                  phoneNumber: values?.phoneNumber?.trim() || '',
                  secondPhoneNumber: values?.secondPhoneNumber?.trim() || undefined,
                  roleId: values?.roleId || 6,
                  isEmailVerified: values?.isEmailVerified ?? true,
                  // Include clientAddress if provided (free-form text address)
                  ...(values?.clientAddress && values.clientAddress.trim() 
                    ? { clientAddress: values.clientAddress.trim() } 
                    : {}),
                  // Only include address (airport ID) if it's a valid number, otherwise omit it
                  ...(values?.address && values.address.toString().trim() && !isNaN(Number(values.address)) 
                    ? { address: Number(values.address) } 
                    : {}),
                };
                const { data } = await axios.post('/api/users', payload);
                if (data?.success) {
                  actions.resetForm();
                  onClose();
                  refresh();
                  toast.success(t(data?.message) || t('Client created successfully'));
                } else {
                  // Handle unexpected success:false response
                  toast.error(t(data?.message) || t('Failed to create client'));
                }
              } catch (e: any) {
                // Handle validation errors from backend
                if (e?.response?.status === 422 && e?.response?.data?.messages) {
                  // Backend validation errors (field-level)
                  const errorMessages: string[] = [];
                  e.response.data.messages.forEach((message: { field: string; message: string }) => {
                    // Map backend field names to form field names if needed
                    const fieldName = message.field;
                    actions.setFieldError(fieldName, t(message.message));
                    errorMessages.push(`${t(fieldName)}: ${t(message.message)}`);
                  });
                  // Show a general toast with all errors
                  if (errorMessages.length > 0) {
                    toast.error(t('Please fix the following errors:') + ' ' + errorMessages.join(', '));
                  }
                } else if (e?.response?.status === 422 && e?.response?.data?.errors) {
                  // Alternative error format
                  const errors = e.response.data.errors;
                  Object.keys(errors).forEach((field) => {
                    const errorMsg = Array.isArray(errors[field]) ? errors[field][0] : errors[field];
                    actions.setFieldError(field, t(errorMsg));
                  });
                  toast.error(t('Please fix the validation errors'));
                } else if (e?.response?.data?.message) {
                  // General error message from backend
                  toast.error(t(e.response.data.message));
                } else if (e?.message) {
                  // Network or other errors
                  toast.error(t(e.message) || t('Failed to create client. Please try again.'));
                } else {
                  // Fallback error
                  toast.error(t('Something went wrong. Please check your input and try again.'));
                }
              } finally {
                actions.setSubmitting(false);
              }
            }}
            validationSchema={NewCustomerSchema}
            validateOnBlur={true}
            validateOnChange={true}
            className="h-full"
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className='overflow-y-auto'>
                <DrawerBody>
                  <div className="flex flex-col gap-5">
                    {fieldItems.map((item) => (
                      <FieldRenderer key={item.name} item={item} />
                    ))}
                  </div>
                  {/* Show general validation errors if any */}
                  {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm font-medium text-red-800 mb-1">
                        {t('Please fix the following errors:')}
                      </p>
                      <ul className="text-sm text-red-700 list-disc list-inside">
                        {Object.entries(errors)
                          .filter(([field]) => touched[field as keyof typeof touched])
                          .map(([field, error]) => (
                            <li key={field}>
                              {fieldItems.find((item) => item.name === field)?.label || field}: {t(error as string)}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
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
