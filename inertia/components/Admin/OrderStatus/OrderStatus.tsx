import {
  Flex,
  HStack,
  Spinner,
  TabPanel,
  TabPanels,
  Tabs,
  Select,
} from '@chakra-ui/react';
import { router } from '@inertiajs/react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import BulkUpdateOrder from './BulkUpdateOrder';

const tabRoutes = [
  'all-orders',
  'quote-pending',
  'quote-sent',
  'awaiting-vendor-quote',
  'awaiting-vendor-confirmation',
  'vendor-confirmed',
  'awaiting-client-confirmation',
  'client-confirmed',
  'out-for-delivery',
  'completed',
  'cancelled-not-billable',
  'cancelled-billable',
];

const tabLabels = [
  'All Orders',
  'Quote Pending',
  'Quote Sent',
  'Awaiting Vendor Q.',
  'Awaiting Vendor C.',
  'Vendor Confirmed',
  'Awaiting Client C.',
  'Client Confirmed',
  'Out For Delivery',
  'Completed',
  'Cancelled/Not Billable',
  'Cancelled/Billable',
];

const components = [
  React.lazy(() => import('./AllOrdersTable')),
  React.lazy(() => import('./QuotePendingTable')),
  React.lazy(() => import('./QuoteSentTable')),
  React.lazy(() => import('./AwaitingVendorQuoteTable')),
  React.lazy(() => import('./AwaitingVendorConfirmationTable')),
  React.lazy(() => import('./VendorConfirmedTable')),
  React.lazy(() => import('./AwaitingClientConfirmationTable')),
  React.lazy(() => import('./ClientConfirmedTable')),
  React.lazy(() => import('./OutForDeliveryTable')),
  React.lazy(() => import('./CompletedTable')),
  React.lazy(() => import('./CancelledNotBillableTable')),
  React.lazy(() => import('./CancelledBillableTable')),
];

// Suspense wrapper
const Suspense = ({ children }: { children: React.ReactNode }) => (
  <React.Suspense
    fallback={
      <HStack className="flex items-center justify-center h-32 bg-white">
        <Spinner />
      </HStack>
    }
  >
    {children}
  </React.Suspense>
);

export default function OrderStatus({ index }: { index: number }) {
  const { t } = useTranslation();
  const [tabIndex, setTabIndex] = React.useState(index);
  const [selectedRow, setSelectedRow] = React.useState<Record<string, any>[]>([]);

  const handleTabChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newIndex = parseInt(e.target.value);
    setTabIndex(newIndex);
    router.visit(`/admin/order-status/${tabRoutes[newIndex]}`);
  };

  return (
    <div className="@container">
      <Tabs index={tabIndex} onChange={setTabIndex} isLazy>
        <Flex justify="space-between" className="h-12 flex-wrap gap-y-1.5 gap-x-4">
          {!selectedRow.length ? (
            <Select
              value={tabIndex}
              onChange={handleTabChange}
              maxW="300px"
              className="bg-white"
            >
              {tabLabels.map((label, i) => (
                <option key={i} value={i}>
                  {t(label)}
                </option>
              ))}
            </Select>
          ) : (
            <BulkUpdateOrder rows={selectedRow} />
          )}
        </Flex>

        <TabPanels>
          {components.map((Component, i) => (
            <TabPanel key={i}>
              <Suspense>
                <Component setSelectedRow={(rows: any) => setSelectedRow(rows)} />
              </Suspense>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </div>
  );
}
