import { useEffect, useState } from 'react';
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
} from '@chakra-ui/react';
import { TickCircle } from 'iconsax-react';
import CustomerLayout from '@/components/Customer/CustomerLayout';
import { useTranslation } from 'react-i18next';
import { Field, Form, Formik } from 'formik';
import axios from 'axios';
import { toast } from 'sonner';
import * as Yup from 'yup';
import { router } from '@inertiajs/react';

export default function NewPassword({ ...props }) {
  const { t } = useTranslation();
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const [resetComplete, setResetComplete] = useState(false);
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (props.auth) {
      window.location.href = '/';
    }
  }, []);

  if (props.auth) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const navigate = () => {
    router.visit('/login', { preserveScroll: false });
  };
  return (
    <CustomerLayout>
      <div className="py-14 px-4">
        <div className="max-w-[600px] mx-auto bg-white py-12 px-16 rounded-2xl shadow-auth">
          {!resetComplete ? (
            <div>
              <h2 className="text-2xl font-semibold text-center mb-2">
                {t('Create a new password')}
              </h2>
              <p className="text-center mb-8">{t("Set a new password and you're good to go!")}</p>
              <div className="space-y-4">
                <Formik
                  initialValues={{
                    password: '',
                    confirmPassword: '',
                    token,
                  }}
                  onSubmit={async (values, actions) => {
                    try {
                      actions.setSubmitting(true);
                      const { data } = await axios.post('/api/auth/reset-password', values);
                      if (data.success) {
                        setResetComplete(true);
                      }
                    } catch (e) {
                      toast.error(t(e.response.data.message || 'Invalid Credentials'));
                    } finally {
                      actions.setSubmitting(false);
                    }
                  }}
                  validationSchema={Yup.object().shape({
                    password: Yup.string()
                      .min(8, 'Password must be at least 8 characters')
                      .required('Password is required'),
                    confirmPassword: Yup.string()
                      .required('Confirm password is required')
                      .oneOf([Yup.ref('password')], 'Passwords must match'),
                  })}
                >
                  {({ isSubmitting }) => (
                    <Form className="space-y-4">
                      <Field name="password">
                        {({ field, form }: { field: any; form: any }) => (
                          <FormControl isInvalid={form.errors.password && form.touched.password}>
                            <FormLabel>{t('Password')}</FormLabel>
                            <InputGroup size="md">
                              <Input
                                {...field}
                                pr="4.5rem"
                                type={show ? 'text' : 'password'}
                                placeholder={t('New password')}
                              />
                              <InputRightElement width="4.5rem">
                                <Button h="1.75rem" size="sm" onClick={() => setShow(!show)}>
                                  {show ? t('Hide') : t('Show')}
                                </Button>
                              </InputRightElement>
                            </InputGroup>
                            <FormErrorMessage>{t(form.errors.password)}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="confirmPassword">
                        {({ field, form }: { field: any; form: any }) => (
                          <FormControl
                            isInvalid={form.errors.confirmPassword && form.touched.confirmPassword}
                          >
                            <FormLabel>{t('Confirm Password')}</FormLabel>
                            <InputGroup size="md">
                              <Input
                                {...field}
                                pr="4.5rem"
                                type={showConfirm ? 'text' : 'password'}
                                placeholder={t('Confirm new password')}
                              />
                              <InputRightElement width="4.5rem">
                                <Button
                                  h="1.75rem"
                                  size="sm"
                                  onClick={() => setShowConfirm(!showConfirm)}
                                >
                                  {showConfirm ? t('Hide') : t('Show')}
                                </Button>
                              </InputRightElement>
                            </InputGroup>
                            <FormErrorMessage>{t(form.errors.confirmPassword)}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <div className="flex justify-end">
                        <Button
                          isLoading={isSubmitting}
                          type="submit"
                          variant="solid"
                          colorScheme="primary"
                          className="button-primary"
                        >
                          {t('CREATE PASSWORD')}
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center gap-2">
              <TickCircle size={164} className="text-primary-400" variant="Bulk" />
              <h2 className="text-2xl font-semibold text-center">{t('Successful')}</h2>
              <p className="text-center mb-6">{t("We've reset your password. Sign in again.")}</p>
              <Button
                onClick={navigate}
                variant="solid"
                colorScheme="primary"
                className="button-primary"
              >
                {t('SIGN IN')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}
