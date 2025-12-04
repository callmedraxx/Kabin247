import axios from 'axios';
import { Form, Formik } from 'formik';
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  useDisclosure,
} from '@chakra-ui/react';
import { Add } from 'iconsax-react';
import { toast } from 'sonner';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import FieldRenderer from './FieldRenderer';
import CategorySchema from '@/schemas/CategorySchema';
import useWindowSize from '@/hooks/useWindowSize';

export default function NewCategory({ refresh }: { refresh: () => void }) {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);
  const windowSize = useWindowSize();

  // Field items configuration
  const fieldItems = [
    {
      name: 'image',
      label: 'Category image',
      type: 'file',
    },
    { name: 'name', type: 'text', placeholder: 'Category name' },
  ];

  return (
    <>
      <Button
        colorScheme="primary"
        className="bg-primary-400 text-white hover:bg-primary-500"
        rightIcon={<Add />}
        onClick={onOpen}
      >
        {t('Create new category')}
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
            {t('Create new category')}
            <DrawerCloseButton className="sm:hidden" />
          </DrawerHeader>

          <Formik
            initialValues={{
              name: '',
              image: '',
              priority: 1,
              isAvailable: true,
            }}
            onSubmit={async (values: any, actions) => {
              if (!values) return;
              
              try {
                actions.setSubmitting(true);

                const formData = new FormData();
                for (const key in values) {
                  if (values[key] !== undefined && values[key] !== null) {
                    if (Array.isArray(values[key])) {
                      values[key].forEach((item) => formData.append(`${key}[]`, item ?? ''));
                    } else {
                      formData.append(key, values[key]);
                    }
                  }
                }

                const { data } = await axios.post(`/api/categories`, formData, {
                  headers: { 'Content-Type': 'multipart/form-data' },
                });

                if (data?.success) {
                  actions.resetForm();
                  onClose();
                  refresh();
                  toast.success(data.message || t('Category created successfully'));
                } else {
                  toast.error(t(data?.message) || t('Failed to create category'));
                }
              } catch (e: any) {
                if (e?.response?.status === 422 && e?.response?.data?.messages) {
                  const errorMessages: string[] = [];
                  e.response.data.messages.forEach((message: { field: string; message: string }) => {
                    const fieldName = message.field;
                    actions.setFieldError(fieldName, t(message.message));
                    errorMessages.push(`${t(fieldName)}: ${t(message.message)}`);
                  });
                  if (errorMessages.length > 0) {
                    toast.error(t('Please fix the following errors:') + ' ' + errorMessages.join(', '));
                  }
                } else if (e?.response?.status === 422 && e?.response?.data?.errors) {
                  const errors = e.response.data.errors;
                  Object.keys(errors).forEach((field) => {
                    const errorMsg = Array.isArray(errors[field]) ? errors[field][0] : errors[field];
                    actions.setFieldError(field, t(errorMsg));
                  });
                  toast.error(t('Please fix the validation errors'));
                } else if (e?.response?.data?.message) {
                  toast.error(t(e.response.data.message));
                } else {
                  toast.error(t('Something went wrong. Please check your input and try again.'));
                }
              } finally {
                actions.setSubmitting(false);
              }
            }}
            validationSchema={CategorySchema}
          >
            {({ isSubmitting }) => (
              <Form>
                <DrawerBody className="space-y-4">
                  {fieldItems.map((item) => (
                    <Flex key={item.name} flexDir="column" gap="18px">
                      <FieldRenderer key={item.name} {...item} />
                    </Flex>
                  ))}
                  <hr className="border-black/5" />
                </DrawerBody>
                <DrawerFooter
                  borderTopWidth="1px"
                  borderColor="secondary.200"
                  className="absolute bg-white w-full bottom-0"
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
