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
  useDisclosure,
} from '@chakra-ui/react';
import { Add } from 'iconsax-react';
import { toast } from 'sonner';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import FieldRenderer from '../FieldRenderer';
import useWindowSize from '@/hooks/useWindowSize';

export default function NewStockInventory({ refresh }: { refresh: () => void }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const windowSize = useWindowSize();
  const btnRef = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation();

  // fieldItems for create stock inventory form
  const fieldItems = [
    { name: 'name', label: 'Item Name', type: 'text', placeholder: 'Enter item name', required: true },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Enter description' },
    { name: 'category', label: 'Category', type: 'text', placeholder: 'e.g., Ingredients, Beverages, Supplies' },
    { name: 'unit', label: 'Unit', type: 'text', placeholder: 'e.g., kg, liter, piece, box', required: true },
    { name: 'quantity', label: 'Quantity', type: 'number', placeholder: 'Enter quantity', required: true },
    { name: 'minimumQuantity', label: 'Minimum Quantity', type: 'number', placeholder: 'Reorder threshold', required: true },
    { name: 'unitCost', label: 'Unit Cost', type: 'number', placeholder: 'Cost per unit', required: true },
    { name: 'supplier', label: 'Supplier', type: 'text', placeholder: 'Supplier name' },
    { name: 'location', label: 'Storage Location', type: 'text', placeholder: 'Storage location' },
    { name: 'expiryDate', label: 'Expiry Date', type: 'date', placeholder: 'Expiry date (if applicable)' },
    { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional notes' },
  ];

  return (
    <>
      <Button
        variant="solid"
        colorScheme="primary"
        className="bg-primary-400 hover:bg-primary-500"
        rightIcon={<Add />}
        onClick={onOpen}
      >
        {t('Add Inventory')}
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
            {t('Add New Inventory Item')}
            <DrawerCloseButton className="sm:hidden" />
          </DrawerHeader>

          <Formik
            initialValues={{
              name: '',
              description: '',
              category: '',
              unit: 'piece',
              quantity: 0,
              minimumQuantity: 0,
              unitCost: 0,
              supplier: '',
              location: '',
              expiryDate: '',
              notes: '',
              isActive: true,
            }}
            onSubmit={async (values: any, actions) => {
              try {
                actions.setSubmitting(true);

                const { data } = await axios.post('/api/stock-inventories', values);

                if (data?.success) {
                  onClose();
                  refresh();
                  toast.success(t(data?.message) || t('Stock inventory created successfully'));
                }
              } catch (e: any) {
                if (Array.isArray(e.response?.data?.messages)) {
                  e.response.data.messages.forEach((msg: { field: string; message: string }) => {
                    actions.setFieldError(msg.field, t(msg.message));
                  });
                } else {
                  toast.error(t(e.response?.data?.message) || t('Something went wrong'));
                }
              } finally {
                actions.setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting, setFieldValue }) => (
              <Form className="flex flex-1 flex-col overflow-y-auto">
                <DrawerBody className="space-y-4 h-full flex-1 overflow-y-auto">
                  <div className="flex flex-col gap-5 border-b border-black/5 pb-4">
                    {fieldItems.map((item) => (
                      <FieldRenderer key={item.name} item={item} setFieldValue={setFieldValue} />
                    ))}
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

