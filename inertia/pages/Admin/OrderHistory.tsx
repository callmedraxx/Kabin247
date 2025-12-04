import UpdateDeliveryAirport from '@/components/Admin/ActiveOrders/UpdateDeliveryAirport';
import UpdateDeliveryPerson from '@/components/Admin/ActiveOrders/UpdateDeliveryPerson';
import FilterOrderHistory from '@/components/Admin/OrderHistory/FilterOrderHistory';
import ViewOrder from '@/components/Admin/OrderHistory/ViewOrder';
import ToolBar from '@/components/Admin/ToolBar';
import DataTable from '@/components/common/DataTable';
import Layout from '@/components/common/Layout';
import useTableData from '@/data/use_table_data';
import useDebounce from '@/hooks/useDebounce';
import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import { OrderStatus } from '@/utils/order_status';
import { Badge, Box, HStack, Text } from '@chakra-ui/react';
import { SortingState } from '@tanstack/react-table';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// filter options types
type FilterOptions = Partial<{
  status: string;
}>;

// status class instance
const orderStatus = new OrderStatus();

export default function OrderHistory() {
  const { t } = useTranslation();
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filter, setFilter] = useState<FilterOptions>({});

  const searchedText = useDebounce(searchQuery, 300);

  // fetch all pending orders
  const { items, isLoading, refresh, meta } = useTableData('/api/orders', {
    page,
    limit,
    search: searchedText,
    searchFields: ['orderNumber', 'user.fullName', 'deliveryMan.fullName', 'deliveryAirport.name', 'deliveryAirport.fboName', 'deliveryAirport.iataCode', 'deliveryAirport.icaoCode'],
    listType: 'history',
    ...filter,
  });

  return (
    <Layout title={t('Order history')}>
      <div className="p-6">
        <ToolBar
          filter={<FilterOrderHistory filter={filter} setFilter={setFilter} />}
          exportUrl="/api/orders/export/all?listType=history"
          setSearchQuery={setSearchQuery}
        />
        <div>
          <DataTable
            data={items}
            sorting={sorting}
            setSorting={setSorting}
            isLoading={isLoading}
            pagination={{
              total: meta?.total,
              page: meta?.currentPage,
              limit: meta?.perPage,
              setPage,
              setLimit,
            }}
            structure={[
              {
                accessorKey: 'orderNumber',
                id: 'orderNumber',
                header: () => t('Order No'),
                cell: ({ row }) => <span className="font-bold">{row.original.orderNumber}</span>,
              },
              {
                accessorKey: 'createdAt',
                id: 'createdAt',
                header: () => t('Created On'),
                cell: ({ row }) => (
                  <div>
                    {new Date(row.original.createdAt)
                      .toLocaleString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })
                      .replace(',', ' -')}
                  </div>
                ),
              },
              {
                accessorKey: 'user.fullName',
                id: 'userFullName',
                header: () => t('Client name'),
                cell: ({ row }) => <div>{row.original?.user?.fullName || 'Guest'}</div>,
              },
              {
                accessorKey: 'grandTotal',
                id: 'grandTotal',
                header: () => t('Total'),
                cell: ({ row }) => (
                  <p className="font-bold">{convertToCurrencyFormat(row.original.grandTotal)}</p>
                ),
              },
              {
                accessorKey: 'deliveryPerson.fullName',
                header: () => t('Caterer'),
                cell: ({ row }) => {
                  if (row.original.type !== 'delivery') return <Text color="secondary.400">N/A</Text>;
                  return (
                    <div className='max-w-[260px] overflow-hidden'>
                      <UpdateDeliveryPerson
                        deliveryPerson={row.original.deliveryMan}
                        status={row.original.status}
                        orderId={row.original.id}
                        refresh={refresh}
                      />
                    </div>
                  )
                },
              },
              {
                accessorKey: 'deliveryAirport.name',
                header: () => t('Delivery Airport'),
                cell: ({ row }) => {
                  if (row.original.type !== 'delivery') return <Text color="secondary.400">N/A</Text>;
                  return (
                    <div className='max-w-[260px] overflow-hidden'>
                      <UpdateDeliveryAirport
                        airport={row.original.deliveryAirport}
                        status={row.original.status}
                        orderId={row.original.id}
                        refresh={refresh}
                      />
                    </div>
                  )
                },
              },
              {
                accessorKey: 'paymentType',
                id: 'paymentType',
                header: () => t('Payment'),
                cell: ({ row }) => {
                  return (
                    <HStack>
                      <Badge
                        variant="solid"
                        colorScheme={row.original.paymentStatus === 'paid' ? 'green' : row.original.paymentStatus === 'unpaid' ? 'secondary' : 'cyan'}
                      >
                        {row.original.paymentStatus === 'paid' ? 'paid' : row.original.paymentStatus === 'paid' ? 'unpaid' : 'payment requested'}
                      </Badge>
                      <Badge
                        variant="subtle"
                        colorScheme={row.original.paymentType === 'ach' ? 'primary' : 'blue'}
                      >
                        {t(row.original.paymentType)}
                      </Badge>
                    </HStack>
                  );
                },
              },
              {
                accessorKey: 'status',
                id: 'status',
                header: () => t('Status'),
                cell: ({ row }) => {
                  const status = orderStatus.getStatusDetails(row.original.status);
                  return (
                    <Box
                      className="flex items-center justify-center w-fit gap-2 py-1 rounded-md  px-3"
                      border="1px"
                      borderColor={status.fgColor}
                    >
                      <Text className="font-semibold text-sm" color={status.fgColor}>
                        {t(status?.label)}
                      </Text>
                    </Box>
                  );
                },
              },

              {
                accessorKey: '',
                id: 'action',
                header: () => t('Action'),
                cell: ({ row }) => <ViewOrder orderId={row.original.id} />,
              },
            ]}
          />
        </div>
      </div>
    </Layout>
  );
}
