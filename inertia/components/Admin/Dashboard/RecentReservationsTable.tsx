import axios from 'axios';
import DataTable from '@/components/common/DataTable';
import useTableData from '@/data/use_table_data';
import { startCase } from '@/utils/string_formatter';
import { MenuButton, MenuList, MenuItem, Button, Menu } from '@chakra-ui/react';
import { SortingState } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ArrowDown2 } from 'iconsax-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { reservationStatus } from '@/utils/reservation_status';

export default function RecentReservationsTable() {
  const { t } = useTranslation();
  const [sorting, setSorting] = useState<SortingState>([]);

  // fetch reservations data
  const { items, isLoading, refresh } = useTableData('/api/reservations', {
    page: 1,
    limit: 10,
    listType: 'active',
  });

  const updateReservationStatus = async (id: number, formData: Record<string, any>) => {
    try {
      const { data } = await axios.patch(`/api/reservations/${id}`, formData);
      if (data?.content?.id) {
        toast.success(t('Reservation updated successfully'));
        refresh();
      }
    } catch (e) {
      if (Array.isArray(e.response.data.messages)) {
        e.response.data.messages.forEach((err: any) => {
          toast.error(t(err.message));
        });
      } else {
        toast.error(t(e.response.data.message || 'Something went wrong'));
      }
    }
  };

  return (
    <div className="[&>div]:rounded-xl">
      <DataTable
        data={items.filter((item: any) => item.status !== 'cancelled')}
        sorting={sorting}
        setSorting={setSorting}
        isLoading={isLoading}
        structure={[
          // {
          //   accessorKey: 'id',
          //   id: 'id',
          //   header: () => t('SL'),
          //   cell: (info) => info.row.index + 1,
          // },
          {
            accessorKey: 'createdAt',
            id: 'createdAt',
            header: () => t('Created On'),
            cell: ({ row }) => <div>{format(row.original.createdAt, 'dd/MM/yyyy-hh:mm a')}</div>,
          },
          {
            accessorKey: 'user.fullName',
            id: 'userFullName',
            header: () => t('Client name'),
            cell: ({ row }) => <div>{row.original.user.fullName}</div>,
          },
          {
            accessorKey: 'startTime',
            id: 'startTime',
            header: () => t('Start Time'),
            cell: ({ row }) => {
              const formattedDate = format(row.original.reservationDate, '13/2/24');

              return `${formattedDate}-${row.original.startTime}`;
            },
          },
          {
            accessorKey: 'endTime',
            id: 'endTime',
            header: () => t('End Time'),
            cell: ({ row }) => row.original.endTime,
          },
          {
            accessorKey: 'people',
            id: 'people',
            header: () => t('People'),
            cell: ({ row }) => row.original.numberOfPeople,
          },
          {
            accessorKey: 'tableNumber',
            id: 'tableNumber',
            header: () => t('Table no'),
            cell: ({ row }) => row.original.tableNumber,
          },
          {
            accessorKey: 'status',
            id: 'status',
            header: () => t('Status'),
            cell: ({ row }) => (
              <Menu>
                <MenuButton
                  as={Button}
                  variant="outline"
                  size="sm"
                  borderColor={
                    reservationStatus.find((status) => status.value === row.original.status)?.fgColor
                  }
                  colorScheme={
                    reservationStatus.find((status) => status.value === row.original.status)?.scheme
                  }
                  color={
                    reservationStatus.find((status) => status.value === row.original.status)?.fgColor
                  }
                  rightIcon={<ArrowDown2 />}
                  onClick={(e) => e.stopPropagation()}
                >
                  {t(startCase(row.original.status))}
                </MenuButton>
                <MenuList className="p-1">
                  {reservationStatus.map((s) => (
                    <MenuItem
                      key={s.value}
                      color={s.fgColor}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateReservationStatus(row.original.id, { status: s.value });
                      }}
                    >
                      {t(s.label)}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            ),
          },
        ]}
      />
    </div>
  );
}
