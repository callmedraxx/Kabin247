import CategoriesBulkUpdateBar from '@/components/Admin/Categories/CategoriesBulkUpdateBar';
import DeleteCategory from '@/components/Admin/Categories/DeleteCategory';
import EditCategory from '@/components/Admin/Categories/EditCategory';
import FilterCategories from '@/components/Admin/Categories/FilterCategories';
import NewCategory from '@/components/Admin/Categories/NewCategory';
import PrioritySelection from '@/components/Admin/Categories/PrioritySelection';
import ToggleAvailability from '@/components/Admin/Categories/ToggleAvailability';
import ViewCategory from '@/components/Admin/Categories/ViewCategory';
import ToolBar from '@/components/Admin/ToolBar';
import DataTable from '@/components/common/DataTable';
import Layout from '@/components/common/Layout';
import useTableData from '@/data/use_table_data';
import useDebounce from '@/hooks/useDebounce';
import { Box, Text } from '@chakra-ui/react';
import { SortingState } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// filter options types
type FilterOptions = Partial<{
  available: string;
}>;

export default function Categories() {
  const { t } = useTranslation();
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filter, setFilter] = useState<FilterOptions>({});
  const [selectedRows, setSelectedRows] = useState<Record<string, any>[]>([]);
  const [bulkAvailability, setBulkAvailability] = useState<boolean>(false);

  const searchedText = useDebounce(searchQuery, 300);

  const { items, meta, isLoading, refresh, isValidating } = useTableData('/api/categories', {
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
    <Layout title={t('Categories')}>
      <div className="p-6">
        <ToolBar
          bulkAction={{
            isBulkAction: !!selectedRows.length,
            BulkUpdateBar: () => (
              <CategoriesBulkUpdateBar
                rows={selectedRows}
                reset={() => setSelectedRows([])}
                available={bulkAvailability}
                setAvailable={setBulkAvailability}
              />
            ),
          }}
          filter={<FilterCategories filter={filter} setFilter={setFilter} />}
          AddNew={() => <NewCategory refresh={refresh} />}
          setSearchQuery={setSearchQuery}
        />

        <DataTable
          data={items}
          isLoading={isLoading}
          sorting={sorting}
          setSorting={setSorting}
          enableMultiRowSelection
          getRowId={(row: any) => row.id}
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
            // {
            //   accessorKey: 'id',
            //   header: () => t('SL'),
            //   cell: (info) => info.row.index + 1,
            // },
            {
              accessorKey: 'image',
              header: () => '',
              meta: { className: 'px-2.5' },
              cell: ({ row }) => (
                <Box w="60px" rounded={1}>
                  <img
                    className="w-[60px] h-[50px] object-cover"
                    src={row.original?.image?.url}
                    alt={row.original?.name}
                    onError={(e) => (e.currentTarget.src = '/default_fallback.png')}
                  />
                </Box>
              ),
            },
            {
              accessorKey: 'name',
              header: () => t('Category name'),
            },
            {
              accessorKey: 'menuItems',
              header: () => t('Item count'),
              cell: ({ row }) => <Text>{row.original?.menuItems?.length}</Text>,
            },
            {
              accessorKey: 'priority',
              header: () => t('Priority'),
              cell: ({ row }) => (
                <PrioritySelection
                  defaultPriority={row.original?.priority}
                  id={row.original?.id}
                  total={meta.total}
                  refresh={refresh}
                />
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
                  <ViewCategory category={row.original} refresh={refresh} />
                  <EditCategory isIconButton category={row.original} refresh={refresh} />
                  <DeleteCategory isIconButton id={row.original?.id} refresh={refresh} />
                </div>
              ),
            },
          ]}
        />
      </div>
    </Layout>
  );
}
