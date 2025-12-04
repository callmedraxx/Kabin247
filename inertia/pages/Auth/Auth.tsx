import { Spinner, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { Link, usePage, router } from '@inertiajs/react';
import Login from '@/components/Auth/Login';
import SignUp from '@/components/Auth/SignUp';
import CustomerLayout from '@/components/Customer/CustomerLayout';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export default function Auth({ ...props }) {
  const { t } = useTranslation();
  const { url } = usePage();
  const path = url.split('/')[1] || 'login';

  useEffect(() => {
    if (props.auth) {
      router.visit('/');
    }
  }, [props.auth]);

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
        <div className="max-w-[638px] mx-auto bg-white py-12 px-6 sm:px-16 rounded-2xl shadow-auth">
          <h2 className="text-2xl font-semibold text-center mb-2">{t('Welcome')}</h2>
          <p className="text-center mb-8">{t('Sign in to continue')}</p>
          <Tabs defaultIndex={path === 'login' ? 0 : 1} variant="soft-rounded" colorScheme="green">
            <TabList className="auth-tab">
              <Tab as={Link} href="/login">
                {t('Login')}
              </Tab>
              <Tab as={Link} href="/signup">
                {t('Sign up')}
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel pb={0}>
                <Login />
              </TabPanel>
              <TabPanel pb={0}>
                <SignUp />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div>
      </div>
    </CustomerLayout>
  );
}
