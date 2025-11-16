import * as Yup from 'yup';
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
import { toast } from 'sonner';
import { Edit2 } from 'iconsax-react';
import FieldRenderer from '../FieldRenderer';
import { useTranslation } from 'react-i18next';
import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import useWindowSize from '@/hooks/useWindowSize';

const ChargesSchema = Yup.object().shape({
  name: Yup.string().required('Charge name is required'),
  type: Yup.string().required('Charge type is required'),
  amount: Yup.number().required('Charging amount is required'),
  amountType: Yup.string().required('Charging amount type is required'),
});

export default function EditTaxAndCharges({
  isIconButton = false,
  data,
  refresh,
}: {
  isIconButton?: boolean;
  data: any;
  refresh: () => void;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);
  const windowSize = useWindowSize();

  const { t } = useTranslation();

  const { id, name, type, amount, amountType, isAvailable } = data || {};

  const fieldItems = [
    { name: 'name', label: 'Charge Name', type: 'text', placeholder: 'Enter charge name' },
    {
      name: 'type',
      label: 'Charge type',
      type: 'radio',
      options: [
        { name: 'tax', label: 'Tax' },
        { name: 'charge', label: 'Charge' },
      ],
    },
    { name: 'amount', label: 'Charging amount', type: 'number', placeholder: 'Enter amount' },
    {
      name: 'amountType',
      label: 'Charging amount type',
      type: 'radio',
      options: [
        { name: 'percentage', label: 'Percentage (%)' },
        { name: 'amount', label: `Amount (${convertToCurrencyFormat(0, { symbolOnly: true })})` },
      ],
    },
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
          onClick={onOpen}
        />
      ) : (
        <Button
          aria-label="Edit"
          rightIcon={<Edit2 size="18" />}
          colorScheme="blue"
          className="hover:bg-blue-100 text-blue-600"
          variant="outline"
          w="full"
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
            {t('Edit tax and charges')}
            <DrawerCloseButton className="sm:hidden" />
          </DrawerHeader>

          <Formik
            initialValues={{
              name: name ?? '',
              type: type ?? '',
              amount: amount ?? '',
              amountType: amountType ?? '',
              isAvailable: !!isAvailable,
            }}
            onSubmit={async (values, actions) => {
              try {
                actions.setSubmitting(true);
                const { data } = await axios.put(`/api/charges/${id}`, values);
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
            validationSchema={ChargesSchema}
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
