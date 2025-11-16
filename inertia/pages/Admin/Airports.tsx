import { useEffect, useState } from 'react';
import { SortingState } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import useDebounce from '@/hooks/useDebounce';
import Layout from '@/components/common/Layout';
import DataTable from '@/components/common/DataTable';
import NewAirport from '@/components/Admin/Airports/NewAirport';
import AirportBulkUpdateBar from '@/components/Admin/Airports/AirportBulkUpdateBar';
import ToolBar from '@/components/Admin/ToolBar';
import useTableData from '@/data/use_table_data';
import DeleteAirport from '@/components/Admin/Airports/DeleteAirport';
import EditAirport from '@/components/Admin/Airports/EditAirport';

// filter options types
type FilterOptions = Partial<{
  emailVerified: string;
  suspended: string;
}>;

export default function Airports() {
  const { t } = useTranslation();
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filter, setFilter] = useState<FilterOptions>({});
  const [selectedRows, setSelectedRows] = useState<Record<string, any>[]>([]);

  const searchedText = useDebounce(searchQuery, 300);

  const { items, meta, isLoading, refresh, isValidating } = useTableData('/api/airports', {
    q: searchedText,
    page,
    limit,
    ...filter,
  });

  console.log(meta)

  // reset selected row
  useEffect(() => {
    if (!isValidating && !items.length) {
      setSelectedRows([]);
    }
  }, [isValidating]);

  return (
    <Layout title={t('Airports')}>
      <div className="p-6">
        <ToolBar
          bulkAction={{
            isBulkAction: !!selectedRows.length,
            BulkUpdateBar: () => (
              <AirportBulkUpdateBar
                rows={selectedRows}
                reset={() => setSelectedRows([])}
              />
            ),
          }}
          AddNew={() => <NewAirport refresh={refresh} />}
          filter={<></>}
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
              accessorKey: 'name',
              header: () => t('Name'),
            },
            {
              accessorKey: 'fboName',
              header: () => t('FBO Name'),
            },
            {
              accessorKey: 'fboEmail',
              header: () => t('FBO Email'),
            },
            {
              accessorKey: 'fboPhone',
              header: () => t('FBO Phone'),
            },
            {
              accessorKey: 'iataCode',
              header: () => t('IATA Code'),
            },
            {
              accessorKey: 'icaoCode',
              header: () => t('ICAO Code'),
            },
            {
              accessorKey: 'actions',
              header: () => t('Actions'),
              cell: ({ row }) => (
                <div className="flex gap-2">
                  <DeleteAirport isIconButton id={row.original.id} refresh={refresh} />
                  <EditAirport isIconButton airport={row.original} refresh={refresh} />
                </div>
              ),
            },
          ]}
        />
      </div>
    </Layout>
  );
}
