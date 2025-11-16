import { useEffect, useState } from 'react';
import {
  Badge,
  HStack,
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverBody,
  PopoverTrigger,
  Portal,
  Text,
  Icon
} from '@chakra-ui/react';
import { SortingState } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import useDebounce from '@/hooks/useDebounce';
import Layout from '@/components/common/Layout';
import DataTable from '@/components/common/DataTable';
import DeleteDelivery from '@/components/Admin/DeliveryPerson/DeleteDelivery';
import EditDelivery from '@/components/Admin/DeliveryPerson/EditDelivery';
import NewDelivery from '@/components/Admin/DeliveryPerson/NewDelivery';
import CustomerBulkUpdateBar from '@/components/Admin/Customers/CustomerBulkUpdateBar';
import FilterCustomer from '@/components/Admin/Customers/FilterCustomer';
import ToolBar from '@/components/Admin/ToolBar';
import useTableData from '@/data/use_table_data';
import { Location } from 'iconsax-react';

// filter options types
type FilterOptions = Partial<{
  emailVerified: string;
  suspended: string;
}>;

export default function DeliveryPerson() {
  const { t } = useTranslation();
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filter, setFilter] = useState<FilterOptions>({});
  const [selectedRows, setSelectedRows] = useState<Record<string, any>[]>([]);
  const [bulkAvailability, setBulkAvailability] = useState<boolean>(false);

  const searchedText = useDebounce(searchQuery, 300);

  const { items, meta, isLoading, refresh, isValidating } = useTableData('/api/users', {
    search: searchedText,
    page,
    limit,
    type: 'delivery',
    ...filter,
  });

  // reset selected row
  useEffect(() => {
    if (!isValidating && !items.length) {
      setSelectedRows([]);
    }
  }, [isValidating]);

  return (
    <Layout title={t('Caterer')}>
      <div className="p-6">
        <ToolBar
          bulkAction={{
            isBulkAction: !!selectedRows.length,
            BulkUpdateBar: () => (
              <CustomerBulkUpdateBar
                rows={selectedRows}
                reset={() => setSelectedRows([])}
                available={bulkAvailability}
                setAvailable={setBulkAvailability}
              />
            ),
          }}
          filter={<FilterCustomer filter={filter} setFilter={setFilter} />}
          AddNew={() => <NewDelivery refresh={refresh} />}
          exportUrl="/api/users/export/all?type=delivery"
          setSearchQuery={setSearchQuery}
        />
        <DataTable
          data={items}
          isLoading={isLoading}
          sorting={sorting}
          setSorting={setSorting}
          getRowId={(row: any) => row.id}
          enableMultiRowSelection
          onRowSelection={setSelectedRows}
          pagination={{
            total: meta?.total,
            page,
            setPage,
            limit,
            setLimit,
          }}
          structure={[
            {
              accessorKey: 'checkbox',
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
              accessorKey: 'fullName',
              header: () => t('Caterer name'),
            },
            {
              accessorKey: 'email',
              header: () => t('Email'),
            },
            {
              accessorKey: 'phoneNumber',
              header: () => t('Phone number'),
            },
            {
              accessorKey: 'address',
              header: () => t('Airport'),
              cell: ({ row }) => (
                <Popover trigger='hover' placement='top-end' openDelay={100} closeDelay={100}>
                  <PopoverTrigger>
                    <div className="flex-1 font-normal text-left border py-2 px-3 rounded-[6px] border-secondary-200 bg-secondary-50 hover:bg-primary-50">
                      <HStack>
                        <Icon as={Location} size="sm" />
                        <span>{row.original?.airport?.name || ""}</span>
                      </HStack>
                    </div>
                  </PopoverTrigger>

                  {row.original?.fullName && (
                    <Portal>
                      <PopoverContent w="sm" p={2}>
                        <PopoverArrow />
                        <PopoverBody fontSize="sm">
                          <Text><strong>{t('Name')}:</strong> {row.original?.airport?.name || '-'}</Text>
                          <Text><strong>{t('Email')}:</strong> {row.original?.airport?.fboEmail || '-'}</Text>
                          <Text><strong>{t('Phone')}:</strong> {row.original?.airport?.fboPhone || '-'}</Text>
                          <Text><strong>{t('IATA Code')}:</strong> {row.original?.airport?.iataCode || '-'}</Text>
                          <Text><strong>{t('ICAO Code')}:</strong> {row.original?.airport?.icaoCode || '-'}</Text>
                        </PopoverBody>
                      </PopoverContent>
                    </Portal>
                  )}
                </Popover>
              )
            },
            {
              accessorKey: 'isSuspended',
              header: () => t('Acc. Status'),
              cell: ({ row }) => (
                <Badge colorScheme={row.original?.isSuspended ? 'red' : 'green'}>
                  {row.original?.isSuspended ? t('Suspended') : t('Active')}
                </Badge>
              ),
            },
            {
              accessorKey: 'isEmailVerified',
              header: () => t('Email status'),
              cell: ({ row }) => (
                <Badge colorScheme={row.original?.isEmailVerified ? 'green' : 'red'}>
                  {row.original?.isEmailVerified ? t('Verified') : t('Unverified')}
                </Badge>
              ),
            },
            {
              accessorKey: 'actions',
              header: () => t('Actions'),
              cell: ({ row }) => (
                <div className="flex gap-2">
                  <DeleteDelivery isIconButton id={row.original.id} refresh={refresh} />
                  <EditDelivery isIconButton delivery={row.original} refresh={refresh} />
                </div>
              ),
            },
          ]}
        />
      </div>
    </Layout>
  );
}
