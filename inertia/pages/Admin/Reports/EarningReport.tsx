import Layout from '@/components/common/Layout';
import { useTranslation } from 'react-i18next';
import { Divider } from '@chakra-ui/react';
import { useState } from 'react';
import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import EarningReportChart from '@/components/Admin/Reports/EarningReportChart';
import useSWR from 'swr';
import fetcher from '@/lib/fetcher';

export default function EarningReport() {
  const { t } = useTranslation();
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toLocaleString('default', { month: 'long' })
  );

  // Fetch earning report
  const { data, isLoading } = useSWR('/api/reports/earning-chart', fetcher);

  // find current month data
  const currentMonthData = (data: any, month: string) => {
    return data?.reports?.find(
      (report: any) => report.period?.toLowerCase() === month?.toLowerCase()
    );
  };

  return (
    <Layout title={t('Earning report')}>
      <div className="p-6 flex flex-col gap-4">
        {/* Content */}
        <div className="report-layout">
          <div className="report-layout__grid">
            <div className="report-layout__col-left flex flex-col items-stretch gap-8 rounded-lg bg-white order-2 @3xl:order-1">
              <div className="py-8 px-4 md:px-16 border border-secondary-200 flex flex-col items-stretch gap-8 rounded-lg bg-white">
                <div className="flex items-center gap-8 w-full">
                  <div className="flex-1 flex flex-col gap-2">
                    <h3 className="text-lg font-normal leading-[22px] text-secondary-400">
                      {t('Total Sale')}
                    </h3>
                    <h1 className="text-secondary-900 text-2xl font-bold">
                      {convertToCurrencyFormat(
                        isLoading ? 0 : currentMonthData(data, selectedMonth)?.totalEarnings
                      ) || 0}
                    </h1>
                  </div>
                  <div className="flex-1 flex items-end flex-col gap-2">
                    <h3 className="text-lg font-normal leading-[22px] text-secondary-400">
                      {t('Showing result for')}
                    </h3>
                    <h1 className="text-secondary-900 text-2xl font-bold">
                      {t(selectedMonth)}
                    </h1>
                  </div>
                </div>

                <div>
                  <Divider className="border-secondary-300 mb-6" />

                  <EarningReportChart
                    periodType = 'month'
                    data={data}
                    isLoading={isLoading}
                    onPeriodSelect={setSelectedMonth}
                  />
                </div>
              </div>
            </div>

            {/* Right column content */}
            <div className="report-layout__col-right order-1 @3xl:order-2 flex-col @sm:flex-row @3xl:flex-col">
              {/* Content Card */}
              <div className="flex-1 @3xl:flex-initial p-8 rounded-lg bg-white border-none border-t border-gray-200 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.06),0px_1px_3px_0px_rgba(0,0,0,0.1)]">
                <div className="relative flex flex-col gap-1 ">
                  <p className="text-sm font-medium text-secondary-700"> {t('Total Tax')} </p>
                  <h1 className="text-secondary-900 text-2xl font-bold">
                    {convertToCurrencyFormat(
                      isLoading ? 0 : currentMonthData(data, selectedMonth)?.totalTax || 0
                    )}
                  </h1>
                </div>
              </div>

              {/* Content Card */}
              {currentMonthData(data, selectedMonth)?.charges?.map((charge: any, index: number) => (
                <div
                  key={index}
                  className="flex-1 @3xl:flex-initial p-8 rounded-lg bg-white border-none border-t border-gray-200 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.06),0px_1px_3px_0px_rgba(0,0,0,0.1)]"
                >
                  <div className="relative flex flex-col gap-1 ">
                    <p className="text-sm font-medium text-secondary-700">{t(charge.name)}</p>
                    <h1 className="text-secondary-900 text-2xl font-bold">
                      {convertToCurrencyFormat(charge.total || 0)}
                    </h1>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
