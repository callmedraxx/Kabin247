import { Button, Link } from '@chakra-ui/react';
import { usePage } from '@inertiajs/react';
import { ProfileCircle, ShoppingBag } from 'iconsax-react';
import { useTranslation } from 'react-i18next';

export default function ProfileNav() {
  const { t } = useTranslation();

  const page = usePage();

  return (
    <div className="max-w-[510px] flex w-full bg-secondary-100 rounded-full p-0.5 h-14">
      <Button
        as={Link}
        href="/user/my-orders"
        leftIcon={<ShoppingBag size={20} color="currentColor" />}
        variant="outline"
        data-active={page.url.startsWith('/user/my-orders')}
        className="w-full border-none uppercase h-[52px] data-[active=false]:bg-transparent rounded-full px-4 md:px-8 py-4 data-[active=true]:shadow-tab data-[active=true]:bg-white data-[active=true]:text-secondary-800 font-medium text-base leading-6 hover:no-underline"
      >
        {t('My orders')}
      </Button>
      <Button
        as={Link}
        href="/user/my-profile"
        variant="outline"
        leftIcon={<ProfileCircle size={20} color="currentColor" />}
        data-active={page.url.startsWith('/user/my-profile')}
        className="w-full border-none uppercase h-[52px] data-[active=false]:bg-transparent rounded-full px-4 md:px-8 py-4 data-[active=true]:shadow-tab data-[active=true]:bg-white data-[active=true]:text-secondary-800 font-medium text-base leading-6 hover:no-underline"
      >
        {t('My profile')}
      </Button>
    </div>
  );
}
