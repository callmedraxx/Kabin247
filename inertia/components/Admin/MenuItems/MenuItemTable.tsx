import { Dispatch, SetStateAction } from 'react';
import { Badge, Box, Text } from '@chakra-ui/react';
import { SortingState } from '@tanstack/react-table';
import DeleteMenuItem from '@/components/Admin/MenuItems/DeleteMenuItem';
import EditMenuItem from '@/components/Admin/MenuItems/EditMenuItem';
import ToggleAvailability from '@/components/Admin/MenuItems/ToggleAvailability';
import DataTable from '@/components/common/DataTable';
import { useTranslation } from 'react-i18next';
import ViewMenuItem from './ViewMenuItem';
import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import ToggleRecommended from './ToggleRecommended';

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
            <Box w="60px">
              <img
                className="w-[60px] h-[50px] object-cover rounded-md"
                src={row.original?.image?.url}
                onError={(e) => (e.currentTarget.src = '/default_fallback.png')}
              />
            </Box>
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
          accessorKey: 'discount',
          header: () => t('Discount'),
          cell: ({ row }) => {
            if (row.original?.discount === null) {
              return <Text fontWeight={700} color="gray.400">{t('Not Set')}</Text>;
            }
            if (row.original?.discount === 0) {
              return <Text fontWeight={700}>-</Text>;
            }
            return (
              <Text fontWeight={700}>
                {row.original?.discountType === 'percentage'
                  ? `${row.original.discount}%`
                  : convertToCurrencyFormat(row.original.discount)}
              </Text>
            );
          },
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
          accessorKey: 'actions',
          header: () => t('Actions'),
          cell: ({ row }) => (
            <div className="flex gap-2">
              <ViewMenuItem menuItem={row.original} refresh={refresh} />
              <EditMenuItem isIconButton editData={row.original} refresh={refresh} />
              <DeleteMenuItem isIconButton id={row.original.id} refresh={refresh} />
            </div>
          ),
        },
      ]}
    />
  );
}
