import Empty from '@/components/common/Empty';
import CustomerLayout from '@/components/Customer/CustomerLayout';
import { PageProps } from '@/types';

export default function AboutUs({ branding }: PageProps) {
  const { aboutUsImage, aboutUsHeading, aboutUsDescription } = branding?.business || {};

  return (
    <CustomerLayout>
      <div className="bg-white min-h-[calc(100vh-200px)]">
        <div className="container p-6">
          {aboutUsHeading || aboutUsDescription ? (
            <>
              {aboutUsImage?.url && (
                <div className="relative w-full aspect-[2/1.5] max-h-[450px]">
                  <img
                    src={aboutUsImage?.url}
                    alt={aboutUsHeading}
                    className="absolute top-0 left-0 inset-0 w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="text-center py-12 flex flex-col gap-4 items-center">
                <h1 className="font-bold text-4xl"> {aboutUsHeading} </h1>
                <p className="max-w-[800px] text-gray-700 sm:text-lg tracking-[0.7px]">
                  {aboutUsDescription}
                </p>
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
