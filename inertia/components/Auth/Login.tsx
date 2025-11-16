import LoginSchema from '@/schemas/LoginSchema';
import { Button, Checkbox } from '@chakra-ui/react';
import { Link, router } from '@inertiajs/react';
import axios from 'axios';
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useState } from 'react';
import FormField from './FormField';
import { ROLE } from '@/utils/platform_roles';

export default function Login() {
  const { t } = useTranslation();
  const [showResendLink, setShowResendLink] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [emailError, setEmailError] = useState<any>(null);

  return (
    <Formik
      initialValues={{
        email: '',
        password: '',
        remember: false,
      }}
      onSubmit={async (values, actions) => {
        try {
          actions.setSubmitting(true);
          const { data } = await axios.post('/api/auth/login', values);
          if (!data.login && data.requiredVerification) {
            toast.success(t(data.message));
            setShowResendLink(true);
            setUserEmail(values.email);
            setEmailError(data.emailError || null);
          }
          if (data.login && data.user) {
            setShowResendLink(false);
            switch (data?.user?.roleId) {
              case ROLE.ADMIN:
                router.visit('/admin/dashboard');
                break;

              case ROLE.MANAGER:
                router.visit('/manager/dashboard');
                break;

              case ROLE.POS:
                router.visit('/pos/pos');
                break;

              case ROLE.DISPLAY:
                router.visit('/display');
                break;

              case ROLE.KITCHEN:
                router.visit('/kitchen');
                break;

              case ROLE.CUSTOMER:
                router.visit('/user/my-orders');
                break;

              default:
                router.visit('/signup');
            }
          }
        } catch (e) {
          toast.error(t(e.response.data.message) || t('Invalid Credentials'));
        } finally {
          actions.setSubmitting(false);
        }
      }}
      validationSchema={LoginSchema}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-4">
          {/* Email */}
          <FormField
            name="email"
            type="email"
            label={t('Email')}
            placeholder={t('Enter your email')}
          />

          {/* Password */}

          <FormField
            name="password"
            type="password"
            label={t('Password')}
            placeholder={t('Enter password')}
          />

          <div className="flex justify-between items-center flex-wrap">
            <Checkbox
              colorScheme="primary"
              className="text-secondary-800 rounded whitespace-nowrap"
              defaultChecked
            >
              {t('Remember me')}
            </Checkbox>
            <Link
              href="/forgot-password"
              className="font-medium underline hover:text-primary-400 transition whitespace-nowrap"
            >
              {t('Forgot password?')}
            </Link>
          </div>
          
          {showResendLink && (
            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const { data } = await axios.post('/api/auth/resend-verification', {
                      email: userEmail,
                    });
                    if (data.success) {
                      toast.success(t(data.message));
                      setEmailError(null);
                    } else {
                      toast.error(t(data.message));
                      setEmailError(data.error || null);
                    }
                  } catch (error: any) {
                    const errorMessage = error?.response?.data?.message || 'Failed to resend verification email';
                    toast.error(t(errorMessage));
                    setEmailError(error?.response?.data?.error || null);
                  }
                }}
                className="text-sm text-primary-500 hover:text-primary-600 underline"
              >
                {t('Resend verification email')}
              </button>
              
              {emailError && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-left text-xs">
                  <p className="font-semibold text-red-800 mb-1">Email Error Details:</p>
                  <div className="text-red-700 space-y-0.5">
                    <p><strong>Code:</strong> {emailError.code || 'N/A'}</p>
                    <p><strong>Message:</strong> {emailError.message || 'N/A'}</p>
                    {emailError.response && (
                      <p className="break-words"><strong>Response:</strong> {emailError.response}</p>
                    )}
                    {emailError.command && (
                      <p><strong>Command:</strong> {emailError.command}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end">
            <Button
              variant="solid"
              colorScheme="primary"
              isLoading={isSubmitting}
              type="submit"
              className="button-primary"
            >
              {t('Login')}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
