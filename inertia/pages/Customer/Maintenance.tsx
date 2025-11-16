import { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function Maintenance() {
  const { t } = useTranslation();

  const {
    props: { branding },
  } = usePage() as { props: PageProps };

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col justify-center">
      <div className="flex flex-col items-center gap-4">
        <div>
          <img src="/Maintenance.svg" width={200} height={200} />
        </div>

        <div className="flex flex-col items-center text-center">
          <h1 className="text-balance font-bold text-xl sm:text-3xl leading-[40px] sm:leading-[56px]">
            {t('Website Under Maintenance')}
          </h1>

          <p className="text-balance text-secondary-700 leading-5 sm:leading-8 text-sm sm:text-base">
            {t('We’re making improvements to serve you better. We’ll be back shortly!')}
          </p>

          <p className="text-balance text-secondary-700 leading-5 sm:leading-8 text-sm sm:text-base">
            {t('For urgent inquiries, contact us at')}:{' '}
            <a href={`mailto:${branding?.business?.email}`} className="text-blue-500">
              {branding?.business?.email}
            </a>
          </p>
          <p className="leading-5 sm:leading-8 text-secondary-700 text-sm sm:text-base">
            {t('Thank you for your patience!')}
          </p>
        </div>
      </div>
    </div>
  );
}
