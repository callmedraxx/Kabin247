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
              try {
                actions.setSubmitting(true);

                const formData = new FormData();
                for (const key in values) {
                  if (Array.isArray(values[key])) {
                    values[key].forEach((item) => formData.append(`${key}[]`, item ?? ''));
                  } else {
                    formData.append(key, values[key]);
                  }
                }

                const { data } = await axios.post(`/api/categories`, formData, {
                  headers: { 'Content-Type': 'multipart/form-data' },
                });

                if (data?.success) {
                  onClose();
                  refresh();
                  toast.success(data.message);
                }
              } catch (e) {
                toast.error(t(e.response.data.message) || t('Something went wrong'));
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
