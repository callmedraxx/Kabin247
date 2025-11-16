import axios from 'axios';
import useWindowSize from '@/hooks/useWindowSize';
import { PageProps } from '@/types';
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react';
import { router, usePage } from '@inertiajs/react';
import { Field, Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface ProfileEditProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROFILE_FIELDS = [
  { name: 'firstName', label: 'First name', placeholder: 'Enter your first name', type: 'text' },
  { name: 'lastName', label: 'Last name', placeholder: 'Enter your last name', type: 'text' },
  { name: 'phone', label: 'Phone', placeholder: 'Enter your phone number', type: 'tel' },
  { name: 'email', label: 'Email', placeholder: 'Enter your email', type: 'email', disabled: true },
  { name: 'address', label: 'Airport', placeholder: 'Enter the airport nearist to you', type: 'text' },
];

const PASSWORD_FIELDS = [
  {
    name: 'password',
    label: 'Current password',
    type: 'password',
    placeholder: 'Enter current password',
  },
  { name: 'newPassword', label: 'Enter new password', type: 'password', placeholder: 'New password' },
  {
    name: 'confirmNewPassword',
    label: 'Confirm password',
    type: 'password',
    placeholder: 'Confirm new password',
  },
];

export default function ProfileEdit({ isOpen, onClose }: ProfileEditProps) {
  const { t } = useTranslation();
  const windowSize = useWindowSize();
  const {
    props: { auth },
  } = usePage() as { props: PageProps };

  const onSubmit = async (values: any, actions: any) => {
    actions.setSubmitting(true);

    try {
      const { data, status } = await axios.put('/api/users/profile/update', values);
      if ((data?.success && status === 200) || status === 201) {
        toast.success(t('Profile updated successfully'));
        router.reload();
      }
    } catch (error) {
      toast.error(t(error.response.data.message) || t('Something went wrong'));
    } finally {
      actions.setSubmitting(false);
    }
  };

  const content = (
    <Tabs className="h-full">
      <TabList>
        <Tab> {t('Profile')} </Tab>
        <Tab> {t('Password')} </Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <Formik
            initialValues={{
              firstName: auth?.firstName || '',
              lastName: auth?.lastName || '',
              email: auth?.email || '',
              phone: auth?.phoneNumber || '',
              address: auth?.address || '',
            }}
            onSubmit={onSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="space-y-3">
                  {PROFILE_FIELDS.map((item) => (
                    <Field name={item.name} key={item.name}>
                      {({ field, meta }: any) => (
                        <FormControl isInvalid={!!(meta.touched && meta.error)}>
                          <FormLabel>{t(item.label)}</FormLabel>
                          <Input {...field} {...item} />
                          <FormErrorMessage>
                            {meta.touched && meta.error ? t(meta.error) : ''}
                          </FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                  ))}
                </div>

                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  colorScheme="primary"
                  className="mt-4 bg-primary-400 hover:bg-primary-500"
                >
                  {t('Update profile')}
                </Button>
              </Form>
            )}
          </Formik>
        </TabPanel>

        <TabPanel>
          <Formik
            initialValues={{
              password: '',
              newPassword: '',
              confirmNewPassword: '',
            }}
            onSubmit={onSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="flex flex-col h-full">
                <div className="space-y-3">
                  {PASSWORD_FIELDS.map((item) => (
                    <Field name={item.name} key={item.name}>
                      {({ field, meta }: any) => (
                        <FormControl isInvalid={!!(meta.touched && meta.error)}>
                          <FormLabel>{t(item.label)}</FormLabel>
                          <Input {...field} {...item} />
                          <FormErrorMessage>
                            {meta.touched && meta.error ? t(meta.error) : ''}
                          </FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                  ))}
                </div>

                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  colorScheme="primary"
                  className="w-fit mt-4 bg-primary-400 hover:bg-primary-500"
                >
                  {t('Update password')}
                </Button>
              </Form>
            )}
          </Formik>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );

  // drawer view
  if (windowSize.width < 768) {
    return (
      <Drawer isOpen={isOpen} onClose={onClose} size="full" placement="bottom">
        <DrawerOverlay />
        <DrawerContent className="h-[80vh] rounded-t-xl">
          <DrawerHeader>{t('Profile information')}</DrawerHeader>
          <DrawerCloseButton />
          <DrawerBody className="mx-2 overflow-y-auto">{content}</DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  }

  // modal view
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('Profile information')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody className="pb-10 pt-0 mx-2 overflow-y-auto">{content}</ModalBody>
      </ModalContent>
    </Modal>
  );
}
