import { useRef, useState } from 'react';
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
import { Add } from 'iconsax-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import FieldRenderer from '../FieldRenderer';
import useWindowSize from '@/hooks/useWindowSize';

type AddQuantityStockInventoryProps = {
  stockInventory: any;
  refresh: () => void;
};

export default function AddQuantityStockInventory({ stockInventory, refresh }: AddQuantityStockInventoryProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const windowSize = useWindowSize();
  const btnRef = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation();

  const { id, name, unit } = stockInventory || {};

  // fieldItems for add quantity form
  const fieldItems = [
    { name: 'quantity', label: 'Quantity to Add', type: 'number', placeholder: `Enter quantity (${unit || 'units'})`, required: true },
    { name: 'unitCost', label: 'Unit Cost (Optional)', type: 'number', placeholder: 'New unit cost (for weighted average)' },
  ];

  return (
    <>
      <IconButton
        aria-label="Add Quantity"
        icon={<Add size="18" color="currentColor" />}
        colorScheme="green"
        className="hover:bg-green-100 text-green-600"
        variant="outline"
        size="sm"
        onClick={onOpen}
      />
      <Drawer
        isOpen={isOpen}
        placement={windowSize.width < 640 ? 'bottom' : 'right'}
        size="sm"
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent className="h-[80%] sm:h-auto rounded-xl sm:rounded-none">
          <DrawerHeader className="border-b border-black/5">
            {t('Add Quantity')} - {name}
            <DrawerCloseButton className="sm:hidden" />
          </DrawerHeader>

          <Formik
            initialValues={{
              quantity: 0,
              unitCost: '',
            }}
            onSubmit={async (values: any, actions) => {
              try {
                actions.setSubmitting(true);

                const payload: any = { quantity: values.quantity };
                if (values.unitCost && values.unitCost > 0) {
                  payload.unitCost = values.unitCost;
                }

                const { data } = await axios.patch(`/api/stock-inventories/${id}/add-quantity`, payload);
                if (data?.success) {
                  onClose();
                  refresh();
                  toast.success(t(data?.message) || t('Quantity added successfully'));
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
                    colorScheme="green"
                    w="full"
                    type="submit"
                    isLoading={isSubmitting}
                    className="bg-green-400 hover:bg-green-500"
                    rightIcon={<Add />}
                  >
                    {t('Add Quantity')}
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

