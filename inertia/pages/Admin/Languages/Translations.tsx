import { useTranslation } from 'react-i18next';
import Layout from '@/components/common/Layout';
import DataTable from '@/components/common/DataTable';
import { useState } from 'react';
import { SortingState } from '@tanstack/react-table';
import useDebounce from '@/hooks/useDebounce';
import { Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import useTableData from '@/data/use_table_data';
import { SearchNormal } from 'iconsax-react';
import DeleteTranslation from '@/components/Admin/Languages/DeleteTranslation';
import ManageTranslation from '@/components/Admin/Languages/ManageTranslation';

const Translations = ({ code }: { code: string }) => {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const { t } = useTranslation();

  const searchedText = useDebounce(searchQuery, 300);

  const { items, refresh, meta, isLoading } = useTableData('/admin/languages/api/' + code, {
    page,
    limit,
    search: searchedText,
  });

  return (
    <Layout title={t('Editing') + ` - ${code}`}>
      <div className="p-6">
        <div className="flex justify-between mb-5">
          <div>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchNormal size={18} />
              </InputLeftElement>
              <Input
                type="search"
                placeholder={t('Search')}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white"
              />
            </InputGroup>
          </div>
          <ManageTranslation isEditing={false} items={{}} refresh={refresh} />
        </div>
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
            // {
            //   accessorKey: 'id',
            //   header: () => t('Id'),
            // },
            {
              accessorKey: 'key',
              header: () => t('Key'),
            },
            {
              accessorKey: 'value',
              header: () => t('Value'),
            },
            {
              accessorKey: 'actions',
              enableSorting: false,
              header: () => t('Actions'),
              cell: ({ row }) => (
                <div className="flex gap-2">
                  <DeleteTranslation isIconButton id={row.original.id} refresh={refresh} />
                  <ManageTranslation isEditing items={row.original} refresh={refresh} />
                </div>
              ),
            },
          ]}
        />
      </div>
    </Layout>
  );
};

export default Translations;
