import DataTable from '@/components/common/DataTable';
import { Spinner, Text } from '@chakra-ui/react';
import { SortingState } from '@tanstack/react-table';
import { format } from 'date-fns';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function ExistingReservations({
  items,
  isLoading,
}: {
  items: any;
  isLoading: boolean;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { t } = useTranslation();

  return (
    <div className="lg:max-w-xl w-full h-full lg:min-h-[calc(100vh-76px)] bg-white lg:border-l border-black/10 px-4 py-6 space-y-6 shadow-primary lg:shadow-none rounded-md lg:rounded-none">
      {isLoading ? (
        <div className="flex justify-center items-center w-full h-32">
          <Spinner />
        </div>
      ) : (
        <>
          <h3 className="text-xl font-medium">{t('Existing reservations')}</h3>

          <div className="w-full overflow-x-auto">
            <DataTable
              data={items}
              sorting={sorting}
              setSorting={setSorting}
              padding={false}
              structure={[
                {
                  accessorKey: 'user.fullName',
                  header: () => t('Client'),
                  meta: { className: 'pr-2' },
                  cell: ({ row }) => (
                    <div>
                      <p className="text-sm font-medium">{row.original?.user.fullName}</p>
                      <p className="text-sm">{row.original?.user.phoneNumber}</p>
                    </div>
                  ),
                },
                {
                  accessorKey: 'numberOfPeople',
                  header: () => t('People'),
                  meta: {
                    className: 'px-2.5',
                    cellClassName: 'px-2.5',
                  },
                },
                {
                  accessorKey: 'tableNumber',
                  header: () => t('Table'),
                },
                {
                  accessorKey: 'reservationDate',
                  header: () => t('Time & Date'),
                  meta: { className: 'pl-2', cellClassName: 'pl-2' },
                  cell: ({ row }) => (
                    <div className="space-y-1 text-sm">
                      <p className="font-bold">
                        {format(row.original?.reservationDate, 'dd MMM yyyy')}
                      </p>
                      <Text as="p">{`${row.original?.startTime} to ${row.original?.startTime}`}</Text>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </>
      )}
    </div>
  );
}
