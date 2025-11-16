import { useRef, useState } from 'react';
import axios from 'axios';
import {
  Button,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  IconButton,
} from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { toast } from 'sonner';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Edit2 } from 'iconsax-react';

export default function EditAirport({
  isIconButton,
  airport,
  refresh,
}: {
  isIconButton?: boolean;
  airport: {
    id: number;
    name: string;
    fboName: string;
    fboEmail: string;
    fboPhone: string;
    iataCode: string;
    icaoCode: string;
  };
  refresh: () => void;
}) {
  const { t } = useTranslation();
  const btnRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);

  const validationSchema = Yup.object().shape({
    name: Yup.string().required(t('Name is required')),
    fboName: Yup.string().required(t('FBO Name is required')),
    fboEmail: Yup.string().email(t('Invalid email'))
  });

  return (
    <>
      {isIconButton ? (
        <IconButton
          aria-label={t('Edit')}
          icon={<Edit2 size="18" color="currentColor" />}
          colorScheme="blue"
          className="hover:bg-blue-100 text-blue-600"
          variant="outline"
          onClick={openDrawer}
          ref={btnRef}
        />
      ) : (
        <Button
          aria-label="Edit"
          rightIcon={<Edit2 size="18" />}
          colorScheme="blue"
          width="full"
          className="hover:bg-blue-100 text-blue-600"
          variant="outline"
          onClick={openDrawer}
          ref={btnRef}
        >
          {t('Edit')}
        </Button>
      )}
      <Drawer isOpen={isOpen} placement="right" size="md" onClose={closeDrawer} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent className='h-full'>
          <DrawerHeader className="border-b border-black/5 h-full">
            {t('Edit airport')}
          </DrawerHeader>

          <Formik
            initialValues={{
              name: airport.name ?? '',
              fboName: airport.fboName ?? '',
              fboEmail: airport.fboEmail ?? '',
              fboPhone: airport.fboPhone ?? '',
              iataCode: airport.iataCode ?? '',
              icaoCode: airport.icaoCode ?? '',
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, actions) => {
              try {
                const payload = {
                  name: values.name || '',
                  fbo_name: values.fboName || '',
                  fbo_email: values.fboEmail || '',
                  fbo_phone: values.fboPhone || '',
                  iata_code: values.iataCode || '',
                  icao_code: values.icaoCode || ''
                };
                const { data } = await axios.put(`/api/airports/${airport.id}`, payload);
                if (data?.success) {
                  closeDrawer();
                  refresh();
                  toast.success(t(data?.message || 'Caterer updated successfully'));
                }
              } catch (err: any) {
                toast.error(t(err?.response?.data?.message || 'Something went wrong'));
              } finally {
                actions.setSubmitting(false);
              }
            }}
          >
            {({ values, errors, touched, isSubmitting, handleChange }) => (
              <Form className='h-full'>
                <DrawerBody className="space-y-4 h-full">
                  <FormControl isInvalid={!!errors.name && touched.name} isRequired>
                    <FormLabel>{t('Name')}</FormLabel>
                    <Input name="name" value={values.name} onChange={handleChange} />
                    <FormErrorMessage>{errors.name}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.fboName && touched.fboName} isRequired>
                    <FormLabel>{t('FBO Name')}</FormLabel>
                    <Input name="fboName" value={values.fboName} onChange={handleChange} />
                    <FormErrorMessage>{errors.fboName}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.fboEmail && touched.fboEmail}>
                    <FormLabel>{t('FBO Email')}</FormLabel>
                    <Input name="fboEmail" value={values.fboEmail} onChange={handleChange} />
                    <FormErrorMessage>{errors.fboEmail}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.fboPhone && touched.fboPhone}>
                    <FormLabel>{t('FBO Phone')}</FormLabel>
                    <Input name="fboPhone" value={values.fboPhone} onChange={handleChange} />
                    <FormErrorMessage>{errors.fboPhone}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.iataCode && touched.iataCode}>
                    <FormLabel>{t('IATA Code')}</FormLabel>
                    <Input name="iataCode" value={values.iataCode} onChange={handleChange} />
                    <FormErrorMessage>{errors.iataCode}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.icaoCode && touched.icaoCode}>
                    <FormLabel>{t('ICAO Code')}</FormLabel>
                    <Input name="icaoCode" value={values.icaoCode} onChange={handleChange} />
                    <FormErrorMessage>{errors.icaoCode}</FormErrorMessage>
                  </FormControl>

                </DrawerBody>
                <DrawerFooter
                  borderTopWidth="1px"
                  borderColor="secondary.200"
                  className="absolute bg-white w-full bottom-0"
                >
                  <Button variant="outline" w="full" mr={3} onClick={closeDrawer}>
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
