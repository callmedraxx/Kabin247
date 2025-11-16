import AddonsBulkUpdateBar from '@/components/Admin/AddonItems/AddonsBulkUpdateBar';
import DeleteAddon from '@/components/Admin/AddonItems/DeleteAddon';
import EditAddon from '@/components/Admin/AddonItems/EditAddon';
import FilterAddonItems from '@/components/Admin/AddonItems/FilterAddonItems';
import NewAddon from '@/components/Admin/AddonItems/NewAddon';
import ToggleAvailability from '@/components/Admin/AddonItems/ToggleAvailability';
import ViewAddon from '@/components/Admin/AddonItems/ViewAddon';
import ToolBar from '@/components/Admin/ToolBar';
import DataTable from '@/components/common/DataTable';
import Layout from '@/components/common/Layout';
import useTableData from '@/data/use_table_data';
import useDebounce from '@/hooks/useDebounce';
import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import {
  Box,
  Text,
} from '@chakra-ui/react';
import { SortingState } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// filter options types
type FilterOptions = Partial<{
  available: string;
}>;

export default function AddonItems() {
  const { t } = useTranslation();
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filter, setFilter] = useState<FilterOptions>({});
  const [selectedRows, setSelectedRows] = useState<Record<string, any>[]>([]);
  const [bulkAvailability, setBulkAvailability] = useState<boolean>(false);

  const searchedText = useDebounce(searchQuery, 300);
  const { items, meta, isLoading, refresh, isValidating } = useTableData('/api/addons', {
    page,
    limit,
    search: searchedText,
    available: filter.available,
  });

  // clear selected rows if data empty
  useEffect(() => {
    if (!isValidating && items.length === 0) {
      setSelectedRows([]);
    }
  }, [isValidating]);

  return (
    <Layout title={t('Add-on items')}>
      <div className="p-6">
        <ToolBar
          bulkAction={{
            isBulkAction: !!selectedRows.length,
            BulkUpdateBar: () => (
              <AddonsBulkUpdateBar
                rows={selectedRows}
                reset={() => setSelectedRows([])}
                available={bulkAvailability}
                setAvailable={setBulkAvailability}
              />
            ),
          }}
          filter={<FilterAddonItems filter={filter} setFilter={setFilter} />}
          AddNew={() => <NewAddon refresh={refresh} />}
          setSearchQuery={setSearchQuery}
        />

        <DataTable
          data={items}
          isLoading={isLoading}
          sorting={sorting}
          setSorting={setSorting}
          onRowSelection={setSelectedRows}
          enableMultiRowSelection
          getRowId={(row: any) => row.id}
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
              accessorKey: 'image',
              header: () => '',
              meta: { className: 'px-2.5' },
              cell: ({ row }) => (
                <Box w="60px">
                  <img
                    className="w-[60px] h-[50px] object-cover rounded-md"
                    src={row.original?.image?.url}
                    alt={row.original?.name}
                    onError={(e) => (e.currentTarget.src = '/default_fallback.png')}
                  />
                </Box>
              ),
            },
            {
              accessorKey: 'name',
              header: () => t('Addon Name'),
            },
            {
              accessorKey: 'price',
              header: () => t('Price'),
              cell: ({ row }) => (
                <Text fontWeight={700}>{convertToCurrencyFormat(row.original?.price)}</Text>
              ),
            },
            {
              accessorKey: 'isAvailable',
              header: () => t('Availability'),
              cell: ({ row }) => (
                <ToggleAvailability
                  isAvailable={row.original?.isAvailable}
                  id={row.original.id}
                  refresh={refresh}
                />
              ),
            },
            {
              accessorKey: 'actions',
              header: () => t('Actions'),
              cell: ({ row }) => (
                <div className="flex gap-2">
                  <ViewAddon addon={row.original} />
                  <EditAddon addon={row.original} refresh={refresh} />
                  <DeleteAddon id={row.original.id} refresh={refresh} />
                </div>
              ),
            },
          ]}
        />
      </div>
    </Layout>
  );
}
