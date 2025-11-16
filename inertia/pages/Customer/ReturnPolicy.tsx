import Empty from '@/components/common/Empty';
import CustomerLayout from '@/components/Customer/CustomerLayout';
import { PageProps } from '@/types';
import { useTranslation } from 'react-i18next';

export default function ReturnPolicy({ branding }: PageProps) {
  const { t } = useTranslation();
  const { returnPolicy } = branding?.business || {};

  return (
    <CustomerLayout>
      <div className="bg-white min-h-[calc(100vh-200px)]">
        <div className="container p-6">
          {returnPolicy ? (
            <div className="text-center py-12 flex flex-col gap-4 items-center">
              <h1 className="font-bold text-4xl"> {t('Return policy')} </h1>

              <p className="max-w-[800px] text-gray-700 sm:text-lg tracking-[0.7px]">
                {returnPolicy}
              </p>
            </div>
          ) : (
            <Empty message="Content not available" />
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}
