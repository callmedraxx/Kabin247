import StockInventoryTable from '@/components/Admin/StockInventory/StockInventoryTable';
import NewStockInventory from '@/components/Admin/StockInventory/NewStockInventory';
import FilterStockInventory from '@/components/Admin/StockInventory/FilterStockInventory';
import BulkDeleteButton from '@/components/common/BulkDeleteButton';
import Layout from '@/components/common/Layout';
import useTableData from '@/data/use_table_data';
import useDebounce from '@/hooks/useDebounce';
import ToolBar from '@/components/Admin/ToolBar';
import {
  Button,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
} from '@chakra-ui/react';
import { SortingState } from '@tanstack/react-table';
import axios from 'axios';
import { SearchNormal } from 'iconsax-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

// filter options types
type FilterOptions = Partial<{
  category: string;
  isActive: string;
}>;

export default function StockInventory() {
  const { t } = useTranslation();
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filter, setFilter] = useState<FilterOptions>({});
  const [selectedRows, setSelectedRows] = useState<Record<string, any>[]>([]);

  const searchedText = useDebounce(searchQuery, 300);
  const { items, meta, isLoading, refresh, isValidating } = useTableData('/api/stock-inventories', {
    page,
    limit,
    search: searchedText,
    ...filter,
  });

  // clear selected rows if data empty
  useEffect(() => {
    if (!isValidating && items.length === 0) {
      setSelectedRows([]);
    }
  }, [isValidating]);

  // delete selected rows
  const deleteSelectedRows = () => {
    toast.promise(
      axios.delete('/api/stock-inventories/bulk/delete', {
        data: {
          ids: selectedRows.map((row: any) => row.id),
        },
      }),
      {
        loading: t('Deleting...'),
        success: () => {
          refresh();
          setSelectedRows([]);
          return t('Stock inventories deleted successfully.');
        },
        error: () => {
          return t('Failed to delete stock inventories.');
        },
      }
    );
  };

  return (
    <Layout title={t('Stock and Inventory')}>
      <div className="p-6">
        <ToolBar
          bulkAction={{
            isBulkAction: !!selectedRows.length,
            BulkUpdateBar: () => (
              <div className="flex justify-end items-center gap-4">
                <BulkDeleteButton onDelete={deleteSelectedRows} />
              </div>
            ),
          }}
          filter={<FilterStockInventory filter={filter} setFilter={setFilter} />}
          AddNew={() => <NewStockInventory refresh={refresh} />}
          setSearchQuery={setSearchQuery}
        />

        <StockInventoryTable
          items={items}
          meta={meta}
          isLoading={isLoading}
          refresh={refresh}
          sorting={sorting}
          setSorting={setSorting}
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
          setSelectedRows={setSelectedRows}
        />
      </div>
    </Layout>
  );
}

