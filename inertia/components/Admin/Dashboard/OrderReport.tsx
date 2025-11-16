import { Divider } from '@chakra-ui/react';
import fetcher from '@/lib/fetcher';
import { useState } from 'react';
import useSWR from 'swr';
import OrderReportChart from '../Reports/OrderReportChart';
import { useTranslation } from 'react-i18next';

export default function OrderReport({ periodType } : { periodType: 'week' | 'month'} ) {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState(
    new Date().toLocaleString('default', periodType === 'week' ? { weekday: 'long' } : { month: 'long'})
  );

  // Fetch earning report
  const { data, isLoading } = useSWR(`/api/reports/order-chart?type=${periodType}`, fetcher);

  // find current period data
  const currentPeriodData = (data: any, period: string) => {
    return data?.reports?.find(
      (report: any) => report.period?.toLowerCase() === period?.toLowerCase()
    );
  };


  return (
    <div className="report-layout__col-left flex flex-col gap-4">
      {/* Total orders chart */}
      <div className="py-4 sm:py-6 @md:py-8 px-4 sm:px-6 @md:px-16 border border-secondary-200 flex flex-col items-stretch gap-8 rounded-lg bg-white">
        <div className="flex items-center gap-8 w-full">
          <div className="flex-1 flex flex-col gap-2">
            <h3 className="text-lg font-normal leading-[22px] text-secondary-400">
              {t('Total Orders')}
            </h3>
            <h1 className="text-secondary-900 text-2xl font-bold">
              {isLoading || !data ? 0 : currentPeriodData(data, selectedPeriod)?.totalOrders}
            </h1>
          </div>
          <div className="flex-1 flex items-end flex-col gap-2">
            <h3 className="text-lg font-normal leading-[22px] text-secondary-400">
              {t('Showing result for')}
            </h3>
            <h1 className="text-secondary-900 text-2xl font-bold">
              {t(selectedPeriod)}
            </h1>
          </div>
        </div>

        <div>
          <Divider className="border-secondary-300 mb-6" />

          {!data ? (
            <div className="w-full aspect-[3/2] max-h-64 flex items-center justify-center text-secondary-400">
              Data not found
            </div>
          ) : (
            <OrderReportChart periodType ={periodType} data={data} isLoading={isLoading} onPeriodSelect={setSelectedPeriod} />
          )}
        </div>
      </div>
    </div>
  );
}
