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
import FieldRenderer from '../FieldRenderer';
import useWindowSize from '@/hooks/useWindowSize';

type EditStockInventoryProps = {
  stockInventory: any;
  refresh: () => void;
  isIconButton?: boolean;
};

export default function EditStockInventory({ stockInventory, refresh, isIconButton = true }: EditStockInventoryProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const windowSize = useWindowSize();
  const btnRef = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation();

  const { id, name, description, category, unit, quantity, minimumQuantity, unitCost, supplier, location, expiryDate, notes, isActive } = stockInventory || {};

  // fieldItems for edit stock inventory form
  const fieldItems = [
    { name: 'name', label: 'Item Name', type: 'text', placeholder: 'Enter item name' },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Enter description' },
    { name: 'category', label: 'Category', type: 'text', placeholder: 'e.g., Ingredients, Beverages, Supplies' },
    { name: 'unit', label: 'Unit', type: 'text', placeholder: 'e.g., kg, liter, piece, box' },
    { name: 'quantity', label: 'Quantity', type: 'number', placeholder: 'Enter quantity' },
    { name: 'minimumQuantity', label: 'Minimum Quantity', type: 'number', placeholder: 'Reorder threshold' },
    { name: 'unitCost', label: 'Unit Cost', type: 'number', placeholder: 'Cost per unit' },
    { name: 'supplier', label: 'Supplier', type: 'text', placeholder: 'Supplier name' },
    { name: 'location', label: 'Storage Location', type: 'text', placeholder: 'Storage location' },
    { name: 'expiryDate', label: 'Expiry Date', type: 'date', placeholder: 'Expiry date (if applicable)' },
    { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional notes' },
  ];

  return (
    <>
      {isIconButton ? (
        <IconButton
          aria-label="Edit"
          icon={<Edit2 size="18" color="currentColor" />}
          colorScheme="blue"
          className="hover:bg-blue-100 text-blue-600"
          variant="outline"
          size="sm"
          onClick={onOpen}
        />
      ) : (
        <Button
          aria-label="Edit"
          rightIcon={<Edit2 size="18" />}
          colorScheme="blue"
          className="hover:bg-blue-100 text-blue-600"
          variant="outline"
          size="sm"
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
            {t('Edit Inventory Item')}
            <DrawerCloseButton className="sm:hidden" />
          </DrawerHeader>

          <Formik
            initialValues={{
              name: name ?? '',
              description: description ?? '',
              category: category ?? '',
              unit: unit ?? 'piece',
              quantity: quantity ?? 0,
              minimumQuantity: minimumQuantity ?? 0,
              unitCost: unitCost ?? 0,
              supplier: supplier ?? '',
              location: location ?? '',
              expiryDate: expiryDate ? new Date(expiryDate).toISOString().split('T')[0] : '',
              notes: notes ?? '',
              isActive: isActive ?? true,
            }}
            onSubmit={async (values: any, actions) => {
              try {
                actions.setSubmitting(true);

                const { data } = await axios.put(`/api/stock-inventories/${id}`, values);
                if (data?.success) {
                  onClose();
                  refresh();
                  toast.success(t(data?.message) || t('Stock inventory updated successfully'));
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

