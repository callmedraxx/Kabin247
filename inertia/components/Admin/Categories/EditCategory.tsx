import { useRef } from 'react';
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
  IconButton,
  useDisclosure,
} from '@chakra-ui/react';
import { Edit2 } from 'iconsax-react';
import { useTranslation } from 'react-i18next';
import FieldRenderer from './FieldRenderer';
import { toast } from 'sonner';
import EditCategorySchema from '@/schemas/EditCategorySchema';
import useWindowSize from '@/hooks/useWindowSize';

// category props types
type EditCategoryProps = {
  category: any;
  refresh: () => void;
  isIconButton?: boolean;
};

export default function EditCategory({ category, refresh, isIconButton }: EditCategoryProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation();
  const windowSize = useWindowSize();

  // Field items configuration
  const fieldItems = [
    {
      name: 'image',
      label: 'Category image',
      type: 'file',
      preview: category?.image?.url || '',
    },
    { name: 'name', type: 'text', placeholder: 'Category name' },
  ];

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
          w="full"
          variant="outline"
          onClick={onOpen}
        >
          {t('Edit')}
        </Button>
      )}
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
            {t('Edit category')}
            <DrawerCloseButton className="sm:hidden" />
          </DrawerHeader>

          <Formik
            initialValues={{
              name: category?.name || '',
              image: '',
              priority: category?.priority || 1,
              isAvailable: Boolean(category?.isAvailable),
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

                const { data } = await axios.put(`/api/categories/${category?.id}`, formData, {
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
            validationSchema={EditCategorySchema}
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
                  >
                    {t('Update')}
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
