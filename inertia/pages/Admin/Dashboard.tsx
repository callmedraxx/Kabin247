import AnalyticsCard from '@/components/Admin/Dashboard/AnalyticsCard';
import EarningReport from '@/components/Admin/Dashboard/EarningReport';
import OrderReport from '@/components/Admin/Dashboard/OrderReport';
import RecentOrdersTable from '@/components/Admin/Dashboard/RecentOrdersTable';
// import RecentReservationsTable from '@/components/Admin/Dashboard/RecentReservationsTable';
import Layout from '@/components/common/Layout';
import fetcher from '@/lib/fetcher';
import { PageProps } from '@/types';
import { startCase } from '@/utils/string_formatter';
import { Button, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import { format } from 'date-fns';
import {
  ArrowDown2,
  Check,
  CloseCircle,
  PlayCricle,
  TickCircle,
  Timer,
  TruckFast,
  User,
} from 'iconsax-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

export default function Dashboard({ auth }: PageProps) {
  const { t } = useTranslation();
  const [timeframe, setTimeframe] = useState('today');

  // Fetch counting order data
  const { data, isLoading } = useSWR(`/api/orders/count/status?timeframe=${timeframe}`, fetcher);

  return (
    <Layout title={t('Dashboard')}>
      <div className="@container">
        {/* Greeting section - full width at top on desktop */}
        <div className="p-6 @5xl:p-12 pb-6 @5xl:pb-6">
          <div className="flex flex-col">
            <h2 className="text-2xl font-semibold mb-2">
              {t('Hello')}, {auth?.fullName}
            </h2>
            <div className="flex items-center gap-2 text-base">
              <span>{t('Today is')}</span>
              <span className="text-primary-400">{format(new Date(), 'iii, dd MMM')}</span>
            </div>
          </div>
        </div>

        {/* Recent order table section - moved to top */}
        <section className="px-6 @5xl:px-12 pb-6">
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-medium">{t('Recent Orders')}</h3>
            <RecentOrdersTable />
          </div>
        </section>

        {/* Order analytics section - moved below Recent Orders */}
        <div className="p-6 @5xl:p-12 pt-0 @5xl:pt-0">
          <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
            <h3 className="text-lg font-medium">{t('Order analytics')}</h3>
            <Menu placement="bottom-end">
              <MenuButton
                as={Button}
                className="text-sm font-normal bg-white border border-gray-200"
                rightIcon={<ArrowDown2 size={16} />}
              >
                {t(
                  `${startCase(timeframe) === 'Today' ? 'Today' : `This ${startCase(timeframe)}`}`
                )}
              </MenuButton>
              <MenuList className="p-1">
                <MenuItem onClick={() => setTimeframe('today')}>{t('Today')}</MenuItem>
                <MenuItem onClick={() => setTimeframe('week')}>{t('This Week')}</MenuItem>
                <MenuItem onClick={() => setTimeframe('month')}>{t('This Month')}</MenuItem>
                <MenuItem onClick={() => setTimeframe('lifetime')}>{t('Lifetime')}</MenuItem>
              </MenuList>
            </Menu>
          </div>
          <div className="grid grid-cols-2 @md:grid-cols-2 @3xl:grid-cols-4 gap-3 mb-4">
            <AnalyticsCard
              size="large"
              title={t('All Orders')}
              icon={<Timer variant="Bulk" size={20} className="text-primary-400" />}
              value={isLoading ? 0 : data?.data?.quote_pending}
              link="/admin/order-status/all-orders"
            />
            <AnalyticsCard
              size="large"
              title={t('Quote Pending')}
              icon={<Timer variant="Bulk" size={20} className="text-primary-400" />}
              value={isLoading ? 0 : data?.data?.quote_pending}
              link="/admin/order-status/quote-pending"
            />
            <AnalyticsCard
              size="large"
              title={t('Quote Sent')}
              icon={<PlayCricle variant="Bulk" size={20} className="text-green-500" />}
              value={isLoading ? 0 : data?.data?.quote_sent}
              link="/admin/order-status/quote-sent"
            />

            <AnalyticsCard
              size="large"
              title={t('Awaiting Vendor Q.')}
              icon={<TickCircle variant="Bulk" size={20} className="text-purple-400" />}
              value={isLoading ? 0 : data?.data?.awaiting_vendor_quote || 0}
              link="/admin/order-status/awaiting-vendor-quote"
            />

            <AnalyticsCard
              size="large"
              title={t('Awaiting Vendor C.')}
              icon={<Check variant="Bulk" size={20} className="text-blue-400" />}
              value={isLoading ? 0 : data?.data?.awaiting_vendor_confirmation}
              link="/admin/order-status/awaiting-vendor-confirmation"
            />

            <AnalyticsCard
              size="large"
              title={t('Vendor Confirmed')}
              icon={<User variant="Bulk" size={20} className="text-blue-400" />}
              value={isLoading ? 0 : data?.data?.vendor_confirmed}
              link="/admin/order-status/vendor-confirmed"
            />

            <AnalyticsCard
              size="large"
              title={t('Awaiting Client C.')}
              icon={<Check variant="Bulk" size={20} className="text-blue-400" />}
              value={isLoading ? 0 : data?.data?.awaiting_client_confirmation}
              link="/admin/order-status/awaiting-client-confirmation"
            />

            <AnalyticsCard
              size="large"
              title={t('Client Confirmed')}
              icon={<TickCircle variant="Bulk" size={20} className="text-blue-400" />}
              value={isLoading ? 0 : data?.data?.client_confirmed}
              link="/admin/order-status/client-confirmed"
            />
          </div>
          <div className="grid grid-cols-1 @md:grid-cols-2 @xl:grid-cols-3 gap-3">
            <AnalyticsCard
              size="small"
              title={t('Out For Delivery')}
              icon={<TruckFast variant="Bulk" size={20} className="text-red-400" />}
              value={isLoading ? 0 : data?.data?.out_for_delivery}
              link="/admin/order-status/out-for-delivery"
            />

            <AnalyticsCard
              size="small"
              title={t('Completed')}
              icon={<TruckFast variant="Bulk" size={20} className="text-blue-400" />}
              value={isLoading ? 0 : data?.data?.completed}
              link="/admin/order-status/completed"
            />

            <AnalyticsCard
              size="small"
              title={t('Cancelled/Not Billable')}
              icon={<CloseCircle variant="Bulk" size={20} className="text-red-400" />}
              value={isLoading ? 0 : data?.data?.cancelled_not_billable || 0}
              link="/admin/order-status/cancelled-not-billable"
            />
            <AnalyticsCard
              size="small"
              title={t('Cancelled/Billable')}
              icon={<CloseCircle variant="Bulk" size={20} className="text-red-400" />}
              value={isLoading ? 0 : data?.data?.cancelled_billable}
              link="/admin/order-status/cancelled-billable"
            />
          </div>
        </div>
      </div>

      {/* Report Chart */}
      <section className="px-6 @5xl:px-12 mb-6">
        <div className="grid grid-cols-6 lg:grid-cols-6 xl:grid-cols-12 gap-4">
          <div className="col-span-6">
            <OrderReport periodType="week" />
          </div>

          <div className="col-span-6">
            <EarningReport periodType="week" />
          </div>
        </div>
      </section>
    </Layout>
  );
}
