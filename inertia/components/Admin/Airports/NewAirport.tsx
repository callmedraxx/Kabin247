import axios from 'axios';
import { Form, Formik } from 'formik';
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
} from '@chakra-ui/react';
import { Add } from 'iconsax-react';
import { toast } from 'sonner';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

export default function NewAirport({ refresh }: { refresh: () => void }) {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);

  const validationSchema = Yup.object().shape({
    name: Yup.string().required(t('Name is required')),
    fbo_name: Yup.string().required(t('FBO Name is required')),
    fbo_email: Yup.string().email(t('Invalid email')).required(t('Email is required')),
  });

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
      <Drawer isOpen={isOpen} placement="right" size="md" onClose={onClose} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader className="border-b border-black/5">
            {t('Create new airport')}
          </DrawerHeader>

          <Formik
            initialValues={{
              name: '',
              fbo_name: '',
              fbo_email: '',
              fbo_phone: '',
              iata_code: '',
              icao_code: ''
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, actions) => {
              try {
                actions.setSubmitting(true);
                const payload = {
                  name: values.name,
                  fbo_name: values.fbo_name,
                  fbo_email: values.fbo_email,
                  fbo_phone: values.fbo_phone,
                  iata_code: values.iata_code,
                  icao_code: values.icao_code
                };
                const { data } = await axios.post('/api/airports', payload);
                if (data?.id) {
                  onClose();
                  refresh();
                  toast.success(t('Caterer created successfully'));
                }
              } catch (e) {
                toast.error(t(e.response?.data?.message) || t('Something went wrong'));
              } finally {
                actions.setSubmitting(false);
              }
            }}
          >
            {({ values, errors, touched, isSubmitting, handleChange }) => (
              <Form className='h-full'>
                <DrawerBody className="space-y-5 h-full">
                  <FormControl isRequired isInvalid={!!errors.name && touched.name}>
                    <FormLabel>{t('Name')}</FormLabel>
                    <Input name="name" value={values.name} onChange={handleChange} />
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.fbo_name && touched.fbo_name}>
                    <FormLabel>{t('FBO Name')}</FormLabel>
                    <Input name="fbo_name" value={values.fbo_name} onChange={handleChange} />
                  </FormControl>

                  <FormControl isInvalid={!!errors.fbo_email && touched.fbo_email}>
                    <FormLabel>{t('FBO Email')}</FormLabel>
                    <Input name="fbo_email" value={values.fbo_email} onChange={handleChange} />
                  </FormControl>

                  <FormControl isInvalid={!!errors.fbo_phone && touched.fbo_phone}>
                    <FormLabel>{t('FBO Phone')}</FormLabel>
                    <Input name="fbo_phone" value={values.fbo_phone} onChange={handleChange} />
                  </FormControl>

                  <FormControl isInvalid={!!errors.iata_code && touched.iata_code}>
                    <FormLabel>{t('IATA Code')}</FormLabel>
                    <Input name="iata_code" value={values.iata_code} onChange={handleChange} />
                  </FormControl>

                  <FormControl isInvalid={!!errors.icao_code && touched.icao_code}>
                    <FormLabel>{t('ICAO Code')}</FormLabel>
                    <Input name="icao_code" value={values.icao_code} onChange={handleChange} />
                  </FormControl>

                </DrawerBody><DrawerFooter
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
      </Drawer >
    </>
  );
}
