import FilterReservations from '@/components/Admin/ActiveReservations/FilterReservations';
import ViewReservation from '@/components/Admin/ActiveReservations/ViewReservation';
import ToolBar from '@/components/Admin/ToolBar';
import DataTable from '@/components/common/DataTable';
import Layout from '@/components/common/Layout';
import useTableData from '@/data/use_table_data';
import useDebounce from '@/hooks/useDebounce';
import {
  Badge,
} from '@chakra-ui/react';
import { SortingState } from '@tanstack/react-table';
import { format } from 'date-fns';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// filter options types
type FilterOptions = Partial<{
  status: string;
  reservationDate: Date;
}>;

export default function ReservationHistory() {
  const { t } = useTranslation();
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filter, setFilter] = useState<FilterOptions>({});

  const searchedText = useDebounce(searchQuery, 300);

  const { items, meta, isLoading } = useTableData('/api/reservations', {
    search: searchedText,
    page,
    limit,
    status: filter.status,
    listType: 'history',
    reservationDate: filter?.reservationDate
      ? format(filter?.reservationDate, 'yyyy-MM-dd')
      : undefined,
  });

  return (
    <Layout title={t('Reservations history')}>
      <div className="p-6">
        <ToolBar
          filter={<FilterReservations filter={filter} setFilter={setFilter} />}
          setSearchQuery={setSearchQuery}
          exportUrl="/api/reservations/export/all?listType=history"
        />

        <DataTable
          data={items}
          isLoading={isLoading}
          sorting={sorting}
          setSorting={setSorting}
          pagination={{
            total: meta?.total,
            page,
            setPage,
            limit,
            setLimit,
          }}
          structure={[
            {
              accessorKey: 'createdAt',
              header: () => t('Created On'),
              cell: ({ row }) => (
                <div className="space-y-1">
                  <p className="font-bold">
                    {format(new Date(row.original?.createdAt), 'dd MMM yyyy')}
                  </p>
                  <p>{format(new Date(row.original?.createdAt), 'hh:mm a')}</p>
                </div>
              ),
            },
            {
              accessorKey: 'user.fullName',
              header: () => t('Client name'),
            },
            {
              accessorKey: 'user.phoneNumber',
              header: () => t('Contact number'),
            },
            {
              accessorKey: 'reservationDate',
              header: () => t('Time & Date'),
              cell: ({ row }) => (
                <div className="space-y-1">
                  <p className="font-bold">
                    {format(row.original?.reservationDate, 'dd MMM yyyy')}
                  </p>
                  <p>
                    {row.original.startTime} {t('to')} {row.original.endTime}
                  </p>
                </div>
              ),
            },
            {
              accessorKey: 'numberOfPeople',
              header: () => t('People'),
              cell: ({ row }) => <span className="font-bold">{row.original?.numberOfPeople}</span>,
            },
            {
              accessorKey: 'tableNumber',
              header: () => t('Table No'),
              cell: ({ row }) => <span className="font-bold">{row.original?.tableNumber}</span>,
            },
            {
              accessorKey: 'status',
              header: () => t('Status'),
              cell: ({ row }) => (
                <Badge colorScheme={row.original?.status === 'cancelled' ? 'red' : 'green'}>
                  {t(row.original?.status)}
                </Badge>
              ),
            },

            {
              accessorKey: 'action',
              header: () => t('Action'),
              cell: ({ row }) => <ViewReservation reservation={row.original} refresh={() => {}} />,
            },
          ]}
        />
      </div>
    </Layout>
  );
}