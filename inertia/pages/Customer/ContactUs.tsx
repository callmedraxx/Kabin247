import Empty from '@/components/common/Empty';
import CustomerLayout from '@/components/Customer/CustomerLayout';
import { PageProps } from '@/types';
import { Call, DirectNormal, Location } from 'iconsax-react';
import { useTranslation } from 'react-i18next';

export default function ContactUs({ branding }: PageProps) {
  const { t } = useTranslation();

  const { email, phone, address, contactUsImage } = branding?.business || {};

  return (
    <CustomerLayout>
      <div className="bg-white min-h-[calc(100vh-200px)]">
        <div className="container p-6">
          {email || phone || address ? (
            <>
              {contactUsImage?.url && (
                <div className="relative w-full aspect-[2/1.5] max-h-[450px]">
                  <img
                    src={contactUsImage?.url}
                    alt={t('Contact us')}
                    className="absolute top-0 left-0 inset-0 w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="text-center py-12 flex flex-col gap-4 items-center">
                <h1 className="font-bold text-4xl"> {t('Contact us')} </h1>

                <div className="grid md:grid-cols-3 gap-4 [&>div]:p-4 [&>div]:bg-white [&>div]:rounded-md">
                  {email && (
                    <div className="flex items-center flex-col gap-4">
                      <DirectNormal size={32} variant="Bold" className="text-primary-400" />
                      <p> {email} </p>
                    </div>
                  )}

                  {phone && (
                    <div className="flex items-center flex-col gap-4">
                      <Call size={32} variant="Bold" className="text-green-500" />
                      <p> {phone} </p>
                    </div>
                  )}

                  {address && (
                    <div className="flex items-center flex-col gap-4">
                      <Location size={32} variant="Bold" className="text-teal-500" />
                      <p> {address} </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <Empty message="Content not available" />
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}
