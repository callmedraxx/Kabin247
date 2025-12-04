import { Dispatch, SetStateAction } from 'react';
import { Badge, Text, HStack, Button, IconButton } from '@chakra-ui/react';
import { SortingState } from '@tanstack/react-table';
import DataTable from '@/components/common/DataTable';
import { useTranslation } from 'react-i18next';
import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import EditStockInventory from './EditStockInventory';
import AddQuantityStockInventory from './AddQuantityStockInventory';
import DeleteStockInventory from './DeleteStockInventory';
import { Add, Trash } from 'iconsax-react';

interface IStockInventoryTable<T> {
  items: T[];
  meta: Record<string, any>;
  isLoading: boolean;
  refresh: () => void;
  sorting: SortingState;
  setSorting: Dispatch<SetStateAction<SortingState>>;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  limit: number;
  setLimit: Dispatch<SetStateAction<number>>;
  setSelectedRows: (value: Record<string, any>[]) => void;
}

export default function StockInventoryTable<T>(props: IStockInventoryTable<T>) {
  const { t } = useTranslation();

  const { items, meta, isLoading, refresh, sorting, setSorting, page, setPage, limit, setLimit } =
    props;

  return (
    <DataTable
      data={items}
      isLoading={isLoading}
      sorting={sorting}
      setSorting={setSorting}
      onRowSelection={props.setSelectedRows}
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
          accessorKey: 'name',
          header: () => t('Item name'),
          cell: ({ row }) => (
            <Text fontWeight={600}>{row.original?.name || <Text as="span" color="gray.400">{t('Untitled')}</Text>}</Text>
          ),
        },
        {
          accessorKey: 'category',
          header: () => t('Category'),
          cell: ({ row }) => (
            <Text fontSize="sm" color="gray.600">
              {row.original?.category || <Text as="span" color="gray.400">{t('Not Set')}</Text>}
            </Text>
          ),
        },
        {
          accessorKey: 'quantity',
          header: () => t('Quantity'),
          cell: ({ row }) => {
            const quantity = row.original?.quantity || 0;
            const unit = row.original?.unit || '';
            const minimumQuantity = row.original?.minimumQuantity || 0;
            const isLowStock = quantity <= minimumQuantity;
            
            return (
              <HStack spacing={2}>
                <Text fontWeight={700} color={isLowStock ? 'red.500' : 'inherit'}>
                  {quantity} {unit}
                </Text>
                {isLowStock && (
                  <Badge colorScheme="red" fontSize="2xs">
                    {t('Low Stock')}
                  </Badge>
                )}
              </HStack>
            );
          },
        },
        {
          accessorKey: 'minimumQuantity',
          header: () => t('Min. Quantity'),
          cell: ({ row }) => (
            <Text fontSize="sm">
              {row.original?.minimumQuantity || 0} {row.original?.unit || ''}
            </Text>
          ),
        },
        {
          accessorKey: 'unitCost',
          header: () => t('Unit Cost'),
          cell: ({ row }) => (
            <Text fontWeight={600}>
              {row.original?.unitCost !== null 
                ? convertToCurrencyFormat(row.original.unitCost) 
                : <Text as="span" color="gray.400">{t('Not Set')}</Text>}
            </Text>
          ),
        },
        {
          accessorKey: 'totalValue',
          header: () => t('Total Value'),
          cell: ({ row }) => (
            <Text fontWeight={700} color="primary.500">
              {row.original?.totalValue !== null 
                ? convertToCurrencyFormat(row.original.totalValue) 
                : <Text as="span" color="gray.400">{t('Not Set')}</Text>}
            </Text>
          ),
        },
        {
          accessorKey: 'supplier',
          header: () => t('Supplier'),
          cell: ({ row }) => (
            <Text fontSize="sm" color="gray.600">
              {row.original?.supplier || <Text as="span" color="gray.400">{t('Not Set')}</Text>}
            </Text>
          ),
        },
        {
          accessorKey: 'location',
          header: () => t('Location'),
          cell: ({ row }) => (
            <Text fontSize="sm" color="gray.600">
              {row.original?.location || <Text as="span" color="gray.400">{t('Not Set')}</Text>}
            </Text>
          ),
        },
        {
          accessorKey: 'expiryDate',
          header: () => t('Expiry Date'),
          cell: ({ row }) => {
            const expiryDate = row.original?.expiryDate;
            if (!expiryDate) return <Text color="gray.400" fontSize="xs">-</Text>;
            
            const expiry = new Date(expiryDate);
            const today = new Date();
            const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <Text fontSize="xs" color={daysUntilExpiry < 7 ? 'red.500' : daysUntilExpiry < 30 ? 'orange.500' : 'inherit'}>
                {new Date(expiryDate).toLocaleDateString()}
                {daysUntilExpiry < 7 && (
                  <Badge colorScheme="red" fontSize="2xs" ml={2}>
                    {t('Expiring Soon')}
                  </Badge>
                )}
              </Text>
            );
          },
        },
        {
          accessorKey: 'isActive',
          header: () => t('Status'),
          cell: ({ row }) => (
            <Badge
              variant="solid"
              colorScheme={row.original?.isActive ? 'green' : 'gray'}
              fontSize="2xs"
            >
              {row.original?.isActive ? t('Active') : t('Inactive')}
            </Badge>
          ),
        },
        {
          accessorKey: 'actions',
          header: () => t('Actions'),
          enableSorting: false,
          cell: ({ row }) => (
            <HStack spacing={2}>
              <AddQuantityStockInventory stockInventory={row.original} refresh={refresh} />
              <EditStockInventory stockInventory={row.original} refresh={refresh} />
              <DeleteStockInventory stockInventory={row.original} refresh={refresh} />
            </HStack>
          ),
        },
      ]}
    />
  );
}

