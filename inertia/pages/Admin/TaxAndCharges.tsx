import DeleteTaxAndCharges from '@/components/Admin/TaxAndCharges/DeleteTaxAndCharges';
import EditTaxAndCharges from '@/components/Admin/TaxAndCharges/EditTaxAndCharges';
import FilterTaxAndCharges from '@/components/Admin/TaxAndCharges/FilterTaxAndCharges';
import NewTaxAndCharge from '@/components/Admin/TaxAndCharges/NewTaxAndCharge';
import TaxAndChargeBulkUpdateBar from '@/components/Admin/TaxAndCharges/TaxAndChargeBulkUpdateBar';
import ToggleAvailability from '@/components/Admin/TaxAndCharges/ToggleAvailability';
import ViewTaxAndCharges from '@/components/Admin/TaxAndCharges/ViewTaxAndCharges';
import ToolBar from '@/components/Admin/ToolBar';
import DataTable from '@/components/common/DataTable';
import Layout from '@/components/common/Layout';
import useTableData from '@/data/use_table_data';
import useDebounce from '@/hooks/useDebounce';
import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import { Badge } from '@chakra-ui/react';
import { SortingState } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// filter options types
type FilterOptions = Partial<{
  available: string;
  type: string;
  amountType: string;
}>;

export default function TaxAndCharges() {
  const { t } = useTranslation();
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filter, setFilter] = useState<FilterOptions>({});
  const [selectedRows, setSelectedRows] = useState<Record<string, any>[]>([]);
  const [bulkAvailability, setBulkAvailability] = useState<boolean>(false);

  const searchedText = useDebounce(searchQuery, 300);

  const { items, meta, isLoading, refresh, isValidating } = useTableData('/api/charges', {
    page,
    limit,
    search: searchedText,
    available: filter.available,
    type: filter.type,
    amountType: filter.amountType,
  });

  // clear selected rows if data empty
  useEffect(() => {
    if (!isValidating && items.length === 0) {
      setSelectedRows([]);
    }
  }, [isValidating]);

  return (
    <Layout title={t('Tax and charges')}>
      <div className="p-6">
        <ToolBar
          bulkAction={{
            isBulkAction: !!selectedRows.length,
            BulkUpdateBar: () => (
              <TaxAndChargeBulkUpdateBar
                rows={selectedRows}
                reset={() => setSelectedRows([])}
                available={bulkAvailability}
                setAvailable={setBulkAvailability}
              />
            ),
          }}
          filter={<FilterTaxAndCharges filter={filter} setFilter={setFilter} />}
          AddNew={() => <NewTaxAndCharge refresh={refresh} />}
          setSearchQuery={setSearchQuery}
        />

        <DataTable
          data={items}
          isLoading={isLoading}
          sorting={sorting}
          setSorting={setSorting}
          onRowSelection={setSelectedRows}
          getRowId={(row: any) => row.id}
          enableMultiRowSelection
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
              header: () => t('Charge Name'),
            },
            {
              accessorKey: 'amount',
              header: () => t('Charge amount'),
              cell: ({ row }) => (
                <span className="font-bold">
                  {row.original?.amountType === 'percentage'
                    ? `${row.original?.amount}%`
                    : `${convertToCurrencyFormat(row.original?.amount)}`}
                </span>
              ),
            },
            {
              accessorKey: 'type',
              header: () => t('Charge type'),
              cell: ({ row }) => (
                <Badge
                  variant="solid"
                  colorScheme={row.original?.type === 'tax' ? 'teal' : 'primary'}
                >
                  {t(row.original?.type)}
                </Badge>
              ),
            },
            {
              accessorKey: 'amountType',
              header: () => t('Amount type'),
              cell: ({ row }) => (
                <Badge
                  variant="solid"
                  colorScheme={row.original?.amountType === 'amount' ? 'teal' : 'primary'}
                >
                  {t(row.original?.amountType)}
                </Badge>
              ),
            },
            {
              accessorKey: 'isAvailable',
              header: () => t('Availability'),
              cell: ({ row }) => (
                <ToggleAvailability
                  isAvailable={row.original?.isAvailable}
                  refresh={refresh}
                  id={row.original.id}
                />
              ),
            },
            {
              accessorKey: 'actions',
              header: () => t('Actions'),
              cell: ({ row }) => (
                <div className="flex gap-2">
                  <ViewTaxAndCharges data={row.original} refresh={refresh} />
                  <EditTaxAndCharges isIconButton data={row.original} refresh={refresh} />
                  <DeleteTaxAndCharges isIconButton id={row.original.id} refresh={refresh} />
                </div>
              ),
            },
          ]}
        />
      </div>
    </Layout>
  );
}
