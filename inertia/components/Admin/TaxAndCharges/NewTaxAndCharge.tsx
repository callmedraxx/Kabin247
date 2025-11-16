import * as Yup from 'yup';
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
import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import useWindowSize from '@/hooks/useWindowSize';

// Validation schema for the form
const TaxAndChargesSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  type: Yup.string().required('Charge type is required'),
  amount: Yup.number().required('Amount is required'),
  amountType: Yup.string().required('Amount type is required'),
});

// Field items configuration
const fieldItems = [
  { name: 'name', label: 'Name', type: 'text', placeholder: 'Tax/charge name' },
  {
    name: 'type',
    label: 'Charge type',
    type: 'radio',
    options: [
      { name: 'tax', label: 'Tax' },
      { name: 'charge', label: 'Charge' },
    ],
  },
  { name: 'amount', label: 'Charging amount', type: 'number', placeholder: 'Add charge amount' },
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

export default function NewTaxAndCharge({ refresh }: { refresh: () => void }) {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);
  const windowSize = useWindowSize();

  return (
    <>
      <Button
        variant="solid"
        colorScheme="primary"
        className="bg-primary-400 hover:bg-primary-500"
        rightIcon={<Add />}
        onClick={onOpen}
      >
        {t('Create new')}
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
            {t('Create new tax/charge')}
            <DrawerCloseButton className="sm:hidden" />
          </DrawerHeader>

          <Formik
            initialValues={{
              name: '',
              type: '',
              amount: '',
              amountType: '',
              isAvailable: true,
            }}
            onSubmit={async (values, actions) => {
              try {
                actions.setSubmitting(true);
                const { data } = await axios.post('/api/charges', values);
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
            validationSchema={TaxAndChargesSchema}
          >
            {({ isSubmitting, setFieldValue }) => (
              <Form>
                <DrawerBody className="space-y-4">
                  {fieldItems.map((item) => (
                    <div
                      key={item.name}
                      className="flex flex-col gap-5 border-b border-black/5 pb-4"
                    >
                      <FieldRenderer key={item.name} item={item} setFieldValue={setFieldValue} />
                    </div>
                  ))}
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
