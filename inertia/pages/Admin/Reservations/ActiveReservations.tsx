import BulkUpdateReservation from '@/components/Admin/ActiveReservations/BulkUpdateReservation';
import FilterReservations from '@/components/Admin/ActiveReservations/FilterReservations';
import ToolBar from '@/components/Admin/ToolBar';
import DataTable from '@/components/common/DataTable';
import Layout from '@/components/common/Layout';
import useTableData from '@/data/use_table_data';
import useDebounce from '@/hooks/useDebounce';
import { reservationStatus } from '@/utils/reservation_status';
import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';
import { SortingState } from '@tanstack/react-table';
import axios from 'axios';
import { format } from 'date-fns';
import { ArrowDown2 } from 'iconsax-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import ReservationActionsMenu from '@/components/Admin/ActiveReservations/ReservationActionsMenu';

// filter options types
type FilterOptions = Partial<{
  status: string;
  reservationDate: Date;
}>;

export default function ActiveReservations() {
  const { t } = useTranslation();
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  const [filter, setFilter] = useState<FilterOptions>({});

  const { mutate } = useSWRConfig();

  const searchedText = useDebounce(searchQuery, 300);

  const { items, meta, isLoading, refresh, isValidating } = useTableData('/api/reservations', {
    search: searchedText,
    page,
    limit,
    status: filter.status,
    listType: 'active',
    reservationDate: filter?.reservationDate
      ? format(filter?.reservationDate, 'yyyy-MM-dd')
      : undefined,
  });

  useEffect(() => {
    setSelectedRows([]);
  }, [searchedText, page, limit, isValidating]);

  const handleReservationStatus = async (id: number, status: string) => {
    try {
      const { data } = await axios.patch(`/api/reservations/${id}`, {
        status,
      });
      if (data?.success) {
        toast.success(t(data?.message) || t('Reservation updated successfully'));
        mutate((key: string) => key.startsWith('/api/reservations'));
        refresh();
      }
    } catch (e) {
      toast.error(t(e.response.data.message) || t('Something went wrong'));
    }
  };

  return (
    <Layout title={t('Active reservations')}>
      <div className="p-6">
        <ToolBar
          bulkAction={{
            isBulkAction: !!selectedRows.length,
            BulkUpdateBar: () => (
              <BulkUpdateReservation rows={selectedRows} reset={() => setSelectedRows([])} />
            ),
          }}
          filter={<FilterReservations filter={filter} setFilter={setFilter} />}
          exportUrl="/api/reservations/export/all?listType=active"
          setSearchQuery={setSearchQuery}
        />

        <DataTable
          data={items}
          isLoading={isLoading}
          sorting={sorting}
          setSorting={setSorting}
          pagination={{
            total: meta?.total,
            page,
            limit,
            setPage,
            setLimit,
          }}
          onRowSelection={setSelectedRows}
          getRowId={(row) => row?.id}
          enableMultiRowSelection
          structure={[
            {
              accessorKey: 'checkbox',
              id: 'checkbox',
              enableSorting: false,
              header: ({ table }) => (
                <input
                  type="checkbox"
                  checked={table?.getIsAllRowsSelected()}
                  onChange={table?.getToggleAllRowsSelectedHandler()}
                  className="accent-primary-500 cursor-pointer scale-110"
                />
              ),
              cell: ({ row }) => (
                <input
                  type="checkbox"
                  checked={row?.getIsSelected()}
                  onChange={row?.getToggleSelectedHandler()}
                  className="accent-primary-500 cursor-pointer scale-110"
                />
              ),
            },
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

                  <p>{`${row.original?.startTime} to ${row.original?.endTime}`}</p>
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
                <Menu>
                  <MenuButton
                    as={Button}
                    size="sm"
                    variant="outline"
                    colorScheme="purple"
                    className="border-purple-500 text-purple-500 capitalize"
                    rightIcon={<ArrowDown2 />}
                  >
                    {t(row.original?.status)}
                  </MenuButton>
                  <MenuList className="p-1">
                    {reservationStatus.map((option) => (
                      <MenuItem
                        key={option.value}
                        color={option.fgColor}
                        onClick={() => handleReservationStatus(row.original.id, option.value)}
                      >
                        {t(option.label)}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              ),
            },
            {
              accessorKey: 'actions',
              header: () => t('Actions'),
              enableSorting: false,
              cell: ({ row }) => (
                <ReservationActionsMenu reservation={row.original} refresh={refresh} isActive />
              ),
            },
          ]}
        />
      </div>
    </Layout>
  );
}
