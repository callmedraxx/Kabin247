import ToggleAvailability from './Variants/ToggleAvailability';
import DataTable from '@/components/common/DataTable';
import { Badge, Text } from '@chakra-ui/react';
import { SortingState } from '@tanstack/react-table';
import { useState } from 'react';
import DeleteVariant from './Variants/DeleteVariant';
import EditVariant from './Variants/EditVariant';
import { useTranslation } from 'react-i18next';

export default function MenuItemVariantsTable({ variants }: { variants: any }) {
  const { t } = useTranslation();
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [sorting, setSorting] = useState<SortingState>([]);

  const { items, meta, isLoading, refresh } = variants;

  return (
    <DataTable
      data={items}
      isLoading={isLoading}
      sorting={sorting}
      setSorting={setSorting}
      pagination={{
        total: meta?.total,
        page,
        setPage,
        limit,
        setLimit,
      }}
      structure={[
        {
          accessorKey: 'name',
          header: () => t('Variant name'),
        },
        {
          accessorKey: 'value',
          header: () => t('Unique name'),
        },
        {
          accessorKey: 'variantOptions',
          header: () => t('Options'),
          cell: ({ row }) => (
            <Text fontWeight={500} className="line-clamp-1">
              {row.original?.variantOptions?.length}
            </Text>
          ),
        },
        {
          accessorKey: 'requirement',
          header: () => t('Required'),
          cell: ({ row }) =>
            row.original?.requirement === 'required' ? (
              <Badge colorScheme="blue">{t('Yes')}</Badge>
            ) : (
              <Badge colorScheme="primary">{t('No')}</Badge>
            ),
        },

        {
          accessorKey: 'allowMultiple',
          header: () => t('Multi-selection'),
          cell: ({ row }) =>
            row.original?.allowMultiple ? (
              <Badge colorScheme="blue">{t('Yes')}</Badge>
            ) : (
              <Badge colorScheme="primary">{t('No')}</Badge>
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
              <DeleteVariant isIconButton id={row.original.id} refresh={refresh} />
              <EditVariant isIconButton editData={row.original} refresh={refresh} />
            </div>
          ),
        },
      ]}
    />
  );
}
