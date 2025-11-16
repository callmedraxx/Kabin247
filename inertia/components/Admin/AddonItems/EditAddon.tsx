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
  IconButton,
  useDisclosure,
} from '@chakra-ui/react';
import { Edit2 } from 'iconsax-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { AddonType } from '@/types/addon_type';
import FieldRenderer from '../FieldRenderer';
import useWindowSize from '@/hooks/useWindowSize';

type EditAddonProps = {
  addon: AddonType;
  refresh: () => void;
  isIconButton?: boolean;
};

export default function EditAddon({ addon, refresh, isIconButton = true }: EditAddonProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const windowSize = useWindowSize();
  const btnRef = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation();

  const { id, name, price, isAvailable } = addon || {};

  // fieldItems for edit addon form
  const fieldItems = [
    {
      name: 'image',
      label: 'Image',
      type: 'file',
      placeholder: 'Addon image',
      preview: addon?.image?.url || '',
    },
    { name: 'name', label: 'Name', type: 'text', placeholder: 'Addon name' },
    { name: 'price', label: 'Price', type: 'number', placeholder: 'Add price' },
  ];

  return (
    <>
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
            className="hover:bg-blue-100 text-blue-600"
            variant="outline"
            onClick={onOpen}
          >
            {t('Edit')}
          </Button>
        )}
      </>
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
            {t('Edit addon')}
            <DrawerCloseButton className="sm:hidden" />
          </DrawerHeader>

          <Formik
            initialValues={{
              image: '',
              name: name ?? '',
              price: price ?? '',
              isAvailable: !!isAvailable,
            }}
            onSubmit={async (values: any, actions) => {
              try {
                actions.setSubmitting(true);
                const formData = new FormData();
                for (const key in values) {
                  if (Array.isArray(values[key])) {
                    if (values[key].length == 0) {
                      formData.append(`${key}[]`, '');
                    }
                    values[key].forEach((item) => formData.append(`${key}[]`, item ?? ''));
                  } else {
                    formData.append(key, values[key]);
                  }
                }

                const { data } = await axios.put(`/api/addons/${id}`, formData, {
                  headers: { 'Content-Type': 'multipart/form-data' },
                });
                if (data?.success) {
                  onClose();
                  refresh();
                  toast.success(t(data?.message) || 'Charges updated successfully');
                }
              } catch (e) {
                toast.error(t(e.response.data.message) || 'Something went wrong');
              } finally {
                actions.setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting, setFieldValue }) => (
              <Form className="flex-1 overflow-y-auto flex flex-col">
                <DrawerBody className="space-y-4 flex-1">
                  <div className="flex flex-col gap-5 border-b border-black/5 pb-4">
                    {fieldItems.map((item) => (
                      <FieldRenderer key={item.name} item={item} setFieldValue={setFieldValue} />
                    ))}
                  </div>
                </DrawerBody>
                <DrawerFooter
                  borderTopWidth="1px"
                  borderColor="secondary.200"
                  className=" bg-white w-full bottom-0"
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
