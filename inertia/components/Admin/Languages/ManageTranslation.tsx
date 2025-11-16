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
import axios from 'axios';
import { Form, Formik } from 'formik';
import { Add, Edit2 } from 'iconsax-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import FieldRenderer from '../FieldRenderer';

type ManageTranslationProps = {
  isEditing: boolean;
  items: any;
  refresh: () => void;
};

export default function ManageTranslation({ isEditing, items, refresh }: ManageTranslationProps) {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const pathname = window.location.pathname.split('/')[3];

  const btnRef = useRef<HTMLButtonElement>(null);

  const fieldItems = [
    { name: 'key', label: 'Key', type: 'text', placeholder: 'Key' },
    { name: 'value', label: 'Value', type: 'text', placeholder: 'Value' },
  ];

  return (
    <>
      {isEditing ? (
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
          onClick={onOpen}
          leftIcon={<Add />}
          variant="solid"
          colorScheme="primary"
          className="bg-primary-400 hover:bg-primary-500"
        >
          {t('Create translation')}
        </Button>
      )}
      <Drawer isOpen={isOpen} placement="right" size="md" onClose={onClose} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader className="border-b border-black/5">
            {isEditing ? t('Edit') : t('Add')} {t('translation')}
          </DrawerHeader>

          <Formik
            initialValues={{
              code: pathname,
              key: items?.key || '',
              value: items?.value || '',
            }}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                setSubmitting(true);
                if (!items?.id) {
                  await axios.post('/admin/languages/translations', values);
                  toast.success(t('Translation added successfully'));
                  onClose();
                  refresh();
                  return;
                }
                await axios.put('/admin/languages/translations/' + items?.id, values);
                toast.success(t('Translation updated successfully'));
                onClose();
                refresh();
              } catch (e) {
                toast.error(e.response.data.message || t('Something went wrong'), {
                  position: 'bottom-right',
                });
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting, setFieldValue }) => (
              <Form>
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
                  className="absolute bg-white w-full bottom-0"
                >
                  <Button variant="outline" w="full" mr={3} onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    variant="solid"
                    colorScheme="primary"
                    w="full"
                    type="submit"
                    isLoading={isSubmitting}
                    className="bg-primary-400 hover:bg-primary-500"
                  >
                    Save
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
