import { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  const {
    props: { branding },
  } = usePage() as { props: PageProps };

  const footerMenus = [
    { id: 1, name: t('About us'), link: '/about-us' },
    { id: 2, name: t('Contact us'), link: 'contact-us' },
    { id: 3, name: t('Terms and conditions'), link: '/terms-and-conditions' },
    { id: 4, name: t('Privacy policy'), link: '/privacy-policy' },
    { id: 5, name: t('Return policy'), link: '/return-policy' },
  ];
  const socialLinks = [
    { id: 3, name: 'Instagram', img: '/instagram.svg', accessor: 'instagram' },
  ];

  return (
    <footer className="bg-secondary-50">
      <div className="container py-16 space-y-8 border-b border-b-secondary-200">
        <img
          src={branding?.business?.logo?.url || '/logo.png'}
          alt={branding?.business?.name || 'Logo'}
          className="h-16"
        />

        <p className="text-gray-500 max-w-[600px]">{branding?.business?.companySlogan}</p>
        <div className="flex items-center flex-wrap gap-x-8 gap-y-4">
          {footerMenus.map((menu) => (
            <a
              key={menu?.id}
              href={menu.link}
              className="text-gray-500 hover:text-gray-800 font-semibold"
            >
              {t(menu.name)}
            </a>
          ))}
        </div>
      </div>
      <div className="container flex items-center flex-col md:flex-row justify-between gap-4 mt-8 mb-12">
        <p>{t(branding?.business?.copyrightText || '')}</p>
        <div className="flex items-center gap-8">
          {socialLinks.map((menu) => (
            <a
              key={menu?.id}
              href={branding?.business?.[menu.accessor as 'facebook' | 'twitter' | 'instagram']}
            >
              <img src={menu?.img} alt={menu?.name} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
