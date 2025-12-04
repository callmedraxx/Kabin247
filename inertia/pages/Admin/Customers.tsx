import { useEffect, useState } from 'react';
import { Badge } from '@chakra-ui/react';
import { SortingState } from '@tanstack/react-table';
import DataTable from '@/components/common/DataTable';
import NewCustomer from '@/components/Admin/Customers/NewCustomer';
import Layout from '@/components/common/Layout';
import useDebounce from '@/hooks/useDebounce';
import { useTranslation } from 'react-i18next';
import CustomerBulkUpdateBar from '@/components/Admin/Customers/CustomerBulkUpdateBar';
import ToolBar from '@/components/Admin/ToolBar';
import useTableData from '@/data/use_table_data';
import FilterCustomer from '@/components/Admin/Customers/FilterCustomer';
import CustomerActionsMenu from '@/components/Admin/Customers/CustomerActionsMenu';

// filter options types
type FilterOptions = Partial<{
  emailVerified: string;
  suspended: string;
}>;

export default function Customers() {
  const { t } = useTranslation();
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filter, setFilter] = useState<FilterOptions>({});
  const [selectedRows, setSelectedRows] = useState<Record<string, any>[]>([]);
  const [bulkAvailability, setBulkAvailability] = useState<boolean>(false);

  const searchedText = useDebounce(searchQuery, 300);

  // fetch customers data
  const { items, meta, isLoading, refresh, isValidating } = useTableData('/api/users', {
    search: searchedText,
    page,
    limit,
    type: 'customer',
    emailVerified: filter.emailVerified,
    suspended: filter.suspended,
  });

  // reset selected row
  useEffect(() => {
    if (!isValidating && !items.length) {
      setSelectedRows([]);
    }
  }, [isValidating]);

  return (
    <Layout title={t('Clients')}>
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
          AddNew={() => <NewCustomer refresh={refresh} />}
          exportUrl="/api/users/export/all?type=customer"
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
              header: () => t('Client name'),
              cell: ({ row }) => (
                <div>
                  <div className="font-medium">
                    {row.original?.fullName || <span className="text-gray-400">{t('No name')}</span>}
                  </div>
                  {row.original?.companyName && (
                    <div className="text-sm text-gray-500">{row.original.companyName}</div>
                  )}
                </div>
              ),
            },
            {
              accessorKey: 'email',
              header: () => t('Email'),
              cell: ({ row }) => (
                <div>
                  <div>
                    {row.original?.email || <span className="text-gray-400">{t('No email')}</span>}
                  </div>
                  {row.original?.secondEmail && (
                    <div className="text-sm text-gray-500">{row.original.secondEmail}</div>
                  )}
                </div>
              ),
            },
            {
              accessorKey: 'phoneNumber',
              header: () => t('Contact number'),
              cell: ({ row }) => (
                <div>
                  <div>
                    {row.original?.phoneNumber || <span className="text-gray-400">{t('No phone')}</span>}
                  </div>
                  {row.original?.secondPhoneNumber && (
                    <div className="text-sm text-gray-500">{row.original.secondPhoneNumber}</div>
                  )}
                </div>
              ),
            },
            {
              accessorKey: 'clientAddress',
              header: () => t('Address'),
              cell: ({ row }) => (
                <div className="max-w-xs">
                  {row.original?.clientAddress?.trim() ? (
                    <div className="text-sm truncate" title={row.original.clientAddress}>
                      {row.original.clientAddress}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">{t('Not provided')}</span>
                  )}
                </div>
              ),
            },
            {
              accessorKey: 'isSuspended',
              header: () => t('Acc. Status'),
              cell: ({ row }) => (
                <Badge colorScheme={row.original?.isSuspended ? 'red' : 'green'}>
                  {Boolean(row.original?.isSuspended) ? t('Suspended') : t('Active')}
                </Badge>
              ),
            },
            {
              accessorKey: 'isEmailVerified',
              header: () => t('Email status'),
              cell: ({ row }) => (
                <Badge colorScheme={!row.original?.isEmailVerified ? 'red' : 'green'}>
                  {!row.original?.isEmailVerified ? t('Unverified') : t('Verified')}
                </Badge>
              ),
            },
            {
              accessorKey: 'actions',
              header: () => t('Actions'),
              enableSorting: false,
              cell: ({ row }) => (
                <CustomerActionsMenu customer={row.original} refresh={refresh} />
              ),
            },
          ]}
        />
      </div>
    </Layout>
  );
}
