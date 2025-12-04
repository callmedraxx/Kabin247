import { Dispatch, SetStateAction } from 'react';
import { Badge, Text } from '@chakra-ui/react';
import { SortingState } from '@tanstack/react-table';
import ToggleAvailability from '@/components/Admin/MenuItems/ToggleAvailability';
import DataTable from '@/components/common/DataTable';
import { useTranslation } from 'react-i18next';
import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import ToggleRecommended from './ToggleRecommended';
import MenuItemActionsMenu from './MenuItemActionsMenu';

interface IMenuItemTable<T> {
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

export default function MenuItemTable<T>(props: IMenuItemTable<T>) {
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
            <Text>{row.original?.name || <Text as="span" color="gray.400">{t('Untitled')}</Text>}</Text>
          ),
        },
        {
          accessorKey: 'description',
          header: () => t('Description'),
          cell: ({ row }) => (
            <Text fontSize="sm" noOfLines={2} color="gray.600" maxW="300px">
              {row.original?.description || <Text as="span" color="gray.400">{t('No description')}</Text>}
            </Text>
          ),
        },
        {
          accessorKey: 'addons',
          header: () => t('Addons'),
          cell: ({ row }) => {
            if (!row.original?.addons) {
              return <Badge variant="solid" colorScheme="gray">{t('Not Set')}</Badge>;
            }
            return row.original.addons.length > 0 ? (
              <Badge variant="solid" colorScheme="blue">{t('Yes')}</Badge>
            ) : (
              <Badge variant="subtle" colorScheme="gray">{t('No')}</Badge>
            );
          }
        },

        {
          accessorKey: 'foodType',
          header: () => t('Food type'),
          cell: ({ row }) => {
            if (!row.original?.foodType) {
              return <Badge variant="subtle" colorScheme="gray">{t('Not Set')}</Badge>;
            }
            return row.original.foodType === 'veg' ? (
              <Badge variant="solid" colorScheme="green">
                {t('VEG')}
              </Badge>
            ) : (
              <Badge variant="solid" colorScheme="red">
                {t('NON-VEG')}
              </Badge>
            );
          },
        },

        {
          accessorKey: 'isRecommended',
          header: () => t('Recommended'),
          cell: ({ row }) => (
            <ToggleRecommended
              isRecommended={row.original?.isRecommended}
              id={row.original.id}
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
          accessorKey: 'price',
          header: () => t('Price'),
          cell: ({ row }) => (
            <Text fontWeight={700}>
              {row.original?.price !== null 
                ? convertToCurrencyFormat(row.original.price) 
                : <Text as="span" color="gray.400">{t('Not Set')}</Text>}
            </Text>
          ),
        },

        {
          accessorKey: 'actions',
          header: () => t('Actions'),
          enableSorting: false,
          cell: ({ row }) => (
            <MenuItemActionsMenu menuItem={row.original} refresh={refresh} />
          ),
        },
      ]}
    />
  );
}
