import Layout from '@/components/common/Layout';
import { useTranslation } from 'react-i18next';
import { Divider, Badge } from '@chakra-ui/react';
import { useState } from 'react';
import useSWR from 'swr';
import fetcher from '@/lib/fetcher';
import OrderReportChart from '@/components/Admin/Reports/OrderReportChart';
import { startCase } from '@/utils/string_formatter';
import OrderStatusReportChart from '@/components/Admin/Reports/OrderStatusReportChart';
import OrderByDeliveryPersonReportChart from '@/components/Admin/Reports/OrderByDeliveryReportChart';
import ProductCard from '@/components/Admin/Reports/ProductCard';
import { OrderStatus } from '@/utils/order_status';

const orderStatus = new OrderStatus();

export default function OrderReports() {
  const { t } = useTranslation();
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toLocaleString('default', { month: 'long' })
  );

  // Fetch earning report
  const { data, isLoading } = useSWR('/api/reports/order-chart', fetcher);

  // find current month data
  const currentMonthData = (data: any, month: string) => {
    return data?.reports?.find(
      (report: any) => report.period?.toLowerCase() === month?.toLowerCase()
    );
  };

  const mostOrderedProductSelectedMonth = (data: any, month: string) => {
    return currentMonthData(data, month)?.mostOrderedMenuItem;
  };

  return (
    <Layout title={t('Order report')}>
      <div className="p-6 flex flex-col gap-4">
        {/* Content */}
        <div className="report-layout">
          <div className="report-layout__grid">
            <div className="report-layout__col-left flex flex-col gap-y-4 order-2 @3xl:order-1">
              {/* Total orders chart */}
              <div className="py-4 @lg:py-8 px-4 @lg:px-16 border border-secondary-200 flex flex-col items-stretch gap-8 rounded-lg bg-white">
                <div className="flex items-center gap-8 w-full">
                  <div className="flex-1 flex flex-col gap-2">
                    <h3 className="text-lg font-normal leading-[22px] text-secondary-400">
                      {t('Total Orders')}
                    </h3>
                    <h1 className="text-secondary-900 text-2xl font-bold">
                      {isLoading ? 0 : currentMonthData(data, selectedMonth)?.totalOrders}
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

                  <OrderReportChart
                    periodType = 'month'
                    data={data}
                    isLoading={isLoading}
                    onPeriodSelect={setSelectedMonth}
                  />
                </div>
              </div>

              {/* Order status chart */}
              <div className="py-4 @lg:py-8 px-4 @lg:px-16 border border-secondary-200 flex flex-col items-stretch gap-8 rounded-lg bg-white">
                <div className="flex items-center gap-8 w-full">
                  <div className="flex-1 flex flex-col gap-2">
                    <h1 className="text-secondary-900 text-2xl font-bold">{t('Orders')}</h1>
                    <h3 className="text-lg font-normal leading-[22px] text-secondary-400">
                      {t('by status')}
                    </h3>
                  </div>
                </div>

                <div>
                  <Divider className="border-secondary-300 mb-6" />

                  <OrderStatusReportChart
                    data={data}
                    isLoading={isLoading}
                    onMonthSelect={setSelectedMonth}
                  />
                </div>
              </div>

              {/* Order Report base delivery person */}
              <div className="py-4 @lg:py-8 px-4 @lg:px-16 border border-secondary-200 flex flex-col items-stretch gap-8 rounded-lg bg-white">
                <div className="flex items-center gap-8 w-full">
                  <div className="flex-1 flex flex-col gap-2">
                    <h1 className="text-secondary-900 text-2xl font-bold">{t('Orders')}</h1>
                    <h3 className="text-lg font-normal leading-[22px] text-secondary-400">
                      {t('by delivery person')}
                    </h3>
                  </div>
                </div>

                <div>
                  <Divider className="border-secondary-300 mb-6" />

                  <OrderByDeliveryPersonReportChart
                    data={data}
                    isLoading={isLoading}
                    month={selectedMonth}
                  />
                </div>
              </div>
            </div>

            {/* Right column content */}
            <div className="report-layout__col-right order-1 @3xl:order-2 @container flex-col">
              <div className="grid grid-cols-1 @md:grid-cols-2 gap-4">
                {/* Content Card */}
                {Object.entries(
                  (currentMonthData(data, selectedMonth)?.counts as { [key: string]: number }) || {
                    completed: 0,
                    canceled: 0,
                    returned: 0,
                  }
                ).map(([key, value]: [string, number]) => (
                  <div
                    key={key}
                    className="p-8 rounded-lg bg-white border-none border-t border-gray-200 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.06),0px_1px_3px_0px_rgba(0,0,0,0.1)]"
                  >
                    <div className="relative flex flex-col gap-1">
                      <Badge
                        variant="solid"
                        bg={orderStatus.getStatusDetails(key)?.fgColor}
                        color="white"
                        className="text-xs w-fit"
                      >
                        {t(startCase(key))}
                      </Badge>
                      <h1 className="text-secondary-900 text-2xl font-bold">{value}</h1>
                    </div>
                  </div>
                ))}
              </div>

              {/* Most ordered Product  */}
              {!isLoading && (
                <>
                  <ProductCard
                      product={mostOrderedProductSelectedMonth(data, selectedMonth) || null}
                      timePeriod={selectedMonth} 
                  />
                  <ProductCard
                    product={data.mostOrderedMenuItemAllTime}
                    timePeriod={"All Time"} 
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
