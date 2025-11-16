import CustomerLayout from '@/components/Customer/CustomerLayout';
import { Button, FormControl, FormErrorMessage, FormLabel, Input, Spinner } from '@chakra-ui/react';
import { SmsNotification } from 'iconsax-react';
import { useTranslation } from 'react-i18next';
import { Field, Form, Formik } from 'formik';
import axios from 'axios';
import { toast } from 'sonner';
import * as Yup from 'yup';
import { useEffect, useState } from 'react';

export default function ForgotPassword({ ...props }) {
  const { t } = useTranslation();
  const [mailSent, setMailSent] = useState(false);

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

  return (
    <CustomerLayout>
      <div className="py-14 px-4">
        <div className="max-w-[600px] mx-auto bg-white py-12 px-8 md:px-16 rounded-2xl shadow-auth">
          {!mailSent ? (
            <div>
              <h2 className="text-2xl font-semibold text-center mb-2">
                {t('Forgot password? No worries.')}
              </h2>
              <p className="text-center mb-8">
                {t("We'll send you an email with password reset link")}
              </p>
              <div className="space-y-4">
                <Formik
                  initialValues={{
                    email: '',
                  }}
                  onSubmit={async (values, actions) => {
                    try {
                      actions.setSubmitting(true);
                      const { data } = await axios.post('/api/auth/forgot-password', values);
                      if (data.success) {
                        setMailSent(true);
                      }
                    } catch (e) {
                      toast.error(t(e.response.data.message) || t('Invalid Credentials'));
                    } finally {
                      actions.setSubmitting(false);
                    }
                  }}
                  validationSchema={Yup.object().shape({
                    email: Yup.string().email('Invalid email').required('Email is required'),
                  })}
                >
                  {({ isSubmitting }) => (
                    <Form className="space-y-4">
                      <Field name="email">
                        {({ field, form }: { field: any; form: any }) => (
                          <FormControl isInvalid={form.errors.email && form.touched.email}>
                            <FormLabel>{t('Email')}</FormLabel>
                            <Input {...field} type="email" placeholder={t('Enter your email')} />
                            <FormErrorMessage>{t(form.errors.email)}</FormErrorMessage>
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
                          {t('Reset Password')}
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center gap-2">
              <SmsNotification size={164} className="text-primary-400" variant="Bulk" />
              <h2 className="text-2xl font-semibold text-center">{t('Check your email')}</h2>
              <p className="text-center">
                {t("We've sent you an email with password reset link.")}
              </p>
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}
