import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import { Divider } from '@chakra-ui/react';
import EarningReportChart from '../Reports/EarningReportChart';
import fetcher from '@/lib/fetcher';
import { useState } from 'react';
import useSWR from 'swr';
import { useTranslation } from 'react-i18next';

export default function EarningReport({ periodType } : { periodType: 'week' | 'month'} ) {
  const { t } = useTranslation();

  const [selectedPeriod, setSelectedPeriod] = useState(
    new Date().toLocaleString('default', periodType === 'week' ? { weekday: 'long' } : { month: 'long'})
  );

  // Fetch earning report
  const { data, isLoading } = useSWR(`/api/reports/earning-chart?type=${periodType}`, fetcher);

  // find current month data
  const currentPeriodData = (data: any, period: string) => {
    return data?.reports?.find(
      (report: any) => report.period?.toLowerCase() === period?.toLowerCase()
    );
  };

  return (
    <div className="p-4 sm:p-6 @md:py-8 @md:px-16 border border-secondary-200 flex flex-col items-stretch gap-8 rounded-lg bg-white">
      <div className="flex items-center gap-8 w-full">
        <div className="flex-1 flex flex-col gap-2">
          <h3 className="text-lg font-normal leading-[22px] text-secondary-400">
            {t('Total Sale')}
          </h3>
          <h1 className="text-secondary-900 text-2xl font-bold">
            {convertToCurrencyFormat(
              isLoading || !data ? 0 : currentPeriodData(data, selectedPeriod)?.totalEarnings
            ) || 0}
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
          <EarningReportChart periodType ={periodType} data={data} isLoading={isLoading} onPeriodSelect={setSelectedPeriod} />
        )}
      </div>
    </div>
  );
}
