import CustomerLayout from '@/components/Customer/CustomerLayout';
import { Button } from '@chakra-ui/react';
import { SmsNotification } from 'iconsax-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'sonner';
import { router } from '@inertiajs/react';

export default function VerifyEmail(props: { success: boolean; message: string; email?: string }) {
  const { t } = useTranslation();
  const success = props.success;
  const message = props.message;
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState(props.email || '');
  const [errorDetails, setErrorDetails] = useState<any>(null);

  const handleResendVerification = async () => {
    if (!email) {
      const emailInput = prompt('Please enter your email address:');
      if (!emailInput) return;
      setEmail(emailInput);
    }

    setIsResending(true);
    setErrorDetails(null);
    try {
      const { data } = await axios.post('/api/auth/resend-verification', { email: email || props.email });
      if (data.success) {
        toast.success(t(data.message || 'Verification email sent successfully'));
        setErrorDetails(null);
      } else {
        toast.error(t(data.message || 'Failed to send verification email'));
        setErrorDetails(data.error || null);
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to send verification email';
      toast.error(t(errorMessage));
      setErrorDetails(error?.response?.data?.error || null);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <CustomerLayout>
      <div className="md:h-[calc(100vh-80px)] pt-14 px-4">
        <div className="max-w-[600px] mx-auto bg-white py-12 px-8 md:px-16 rounded-2xl shadow-auth">
          {success ? (
            <div className="flex flex-col items-center justify-center text-center gap-4">
              <SmsNotification size={164} className="text-primary-400" variant="Bulk" />
              <h2 className="text-2xl font-semibold text-center">{t('Verification success')}</h2>
              <p className="text-center">{t(message)}</p>
              <Button
                onClick={() => router.visit('/login')}
                colorScheme="primary"
                className="mt-4"
              >
                {t('Go to Login')}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center gap-4">
              <SmsNotification size={164} className="text-primary-400" variant="Bulk" />
              <h2 className="text-2xl font-semibold text-center">{t('Verification Failed')}</h2>
              <p className="text-center">{t(message)}</p>
              
              {errorDetails && (
                <div className="w-full mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                  <h3 className="font-semibold text-red-800 mb-2">Error Details:</h3>
                  <div className="text-sm text-red-700 space-y-1">
                    <p><strong>Code:</strong> {errorDetails.code || 'N/A'}</p>
                    <p><strong>Message:</strong> {errorDetails.message || 'N/A'}</p>
                    {errorDetails.response && (
                      <p><strong>Response:</strong> {errorDetails.response}</p>
                    )}
                    {errorDetails.command && (
                      <p><strong>Command:</strong> {errorDetails.command}</p>
                    )}
                    {errorDetails.details && (
                      <p><strong>Details:</strong> {errorDetails.details}</p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex flex-col gap-2 mt-4">
                <Button
                  onClick={handleResendVerification}
                  isLoading={isResending}
                  colorScheme="primary"
                  variant="solid"
                >
                  {t('Resend Verification Email')}
                </Button>
                <Button
                  onClick={() => router.visit('/login')}
                  variant="outline"
                  colorScheme="primary"
                >
                  {t('Back to Login')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}
