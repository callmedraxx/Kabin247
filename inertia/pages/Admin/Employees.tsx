import CustomerBulkUpdateBar from '@/components/Admin/Customers/CustomerBulkUpdateBar';
import FilterCustomer from '@/components/Admin/Customers/FilterCustomer';
import NewEmployee from '@/components/Admin/Employees/NewEmployee';
import ToolBar from '@/components/Admin/ToolBar';
import DataTable from '@/components/common/DataTable';
import Layout from '@/components/common/Layout';
import useTableData from '@/data/use_table_data';
import useDebounce from '@/hooks/useDebounce';
import { PageProps } from '@/types';
import handleRoleColor from '@/utils/handle_role_color';
import handleRoleName from '@/utils/handle_role_name';
import { Badge, Button, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import { usePage } from '@inertiajs/react';
import { SortingState } from '@tanstack/react-table';
import axios from 'axios';
import { ArrowDown2 } from 'iconsax-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import EmployeeActionsMenu from '@/components/Admin/Employees/EmployeeActionsMenu';

// filter options types
type FilterOptions = Partial<{
  emailVerified: string;
  suspended: string;
}>;

export default function Employees() {
  const { t } = useTranslation();
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const { mutate } = useSWRConfig();
  const searchedText = useDebounce(searchQuery, 300);
  const [filter, setFilter] = useState<FilterOptions>({});
  const [selectedRows, setSelectedRows] = useState<Record<string, any>[]>([]);
  const [bulkAvailability, setBulkAvailability] = useState<boolean>(false);

  const { items, meta, isLoading, refresh, isValidating } = useTableData('/api/users', {
    search: searchedText,
    page,
    limit,
    type: 'employee',
    ...filter,
  });
  const {
    props: { auth },
  } = usePage() as { props: PageProps };

  const handleRoleChange = async (id: number, roleId: number) => {
    try {
      const { data } = await axios.patch(`/api/users/${id}`, {
        roleId,
      });
      if (data?.success) {
        mutate((key: string) => key.startsWith('/api/users'));
        toast.success(t('Employee role updated!'));
      }
    } catch (e) {
      toast.error(t(e.response.data.message) || t('Something went wrong'));
    }
  };

  // reset selected row
  useEffect(() => {
    if (!isValidating && !items.length) {
      setSelectedRows([]);
    }
  }, [isValidating]);

  return (
    <Layout title={t('Employees')}>
      <div className="p-6">
        <ToolBar
          bulkAction={{
            isBulkAction: !!selectedRows.length,
            BulkUpdateBar: () => (
              <CustomerBulkUpdateBar
                rows={selectedRows}
                reset={() => setSelectedRows([])}
                available={bulkAvailability}
                setAvailable={setBulkAvailability}
              />
            ),
          }}
          filter={<FilterCustomer filter={filter} setFilter={setFilter} />}
          AddNew={() => <NewEmployee refresh={refresh} />}
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
              accessorKey: 'fullName',
              header: () => t('Client name'),
            },
            {
              accessorKey: 'email',
              header: () => t('Email'),
            },
            {
              accessorKey: 'phoneNumber',
              header: () => t('Contact number'),
            },
            {
              accessorKey: 'roleId',
              header: () => t('Role'),
              cell: ({ row }) => {
                return (
                  <>
                    {row.original.id !== auth?.id ? (
                      auth?.roleId === 2 ? (
                        <Button
                          w="full"
                          variant="solid"
                          colorScheme="primary"
                          className={`${handleRoleColor(row.original?.roleId)} w-full uppercase gap-1`}
                        >
                          <span className="uppercase">
                            {t(handleRoleName(row.original?.roleId))}
                          </span>
                        </Button>
                      ) : (
                        <Menu placement="bottom-start">
                          <MenuButton
                            as={Button}
                            className={`${handleRoleColor(row.original?.roleId)} w-full uppercase`}
                            rightIcon={<ArrowDown2 size="16" />}
                          >
                            {t(handleRoleName(row.original?.roleId))}
                          </MenuButton>
                          <MenuList className="p-1">
                            <MenuItem onClick={() => handleRoleChange(row.original?.id, 1)}>
                              {t('Admin')}
                            </MenuItem>
                            <MenuItem onClick={() => handleRoleChange(row.original?.id, 3)}>
                              {t('POS Operator')}
                            </MenuItem>
                            <MenuItem onClick={() => handleRoleChange(row.original?.id, 2)}>
                              {t('Manager')}
                            </MenuItem>
                            <MenuItem onClick={() => handleRoleChange(row.original?.id, 4)}>
                              {t('Display')}
                            </MenuItem>
                            <MenuItem onClick={() => handleRoleChange(row.original?.id, 5)}>
                              {t('Kitchen')}
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      )
                    ) : (
                      <Button
                        w="full"
                        variant="solid"
                        colorScheme="primary"
                        className={`${handleRoleColor(row.original?.roleId)} w-full uppercase gap-1`}
                      >
                        <span className="uppercase">{t(handleRoleName(row.original?.roleId))}</span>
                        <span>({t('you')})</span>
                      </Button>
                    )}
                  </>
                );
              },
            },
            {
              accessorKey: 'isSuspended',
              header: () => t('Acc. Status'),
              cell: ({ row }) => (
                <Badge colorScheme={row.original?.isSuspended ? 'red' : 'green'}>
                  {row.original?.isSuspended ? t('Suspended') : t('Active')}
                </Badge>
              ),
            },
            {
              accessorKey: 'isEmailVerified',
              header: () => t('Email status'),
              cell: ({ row }) => (
                <Badge colorScheme={row.original?.isEmailVerified ? 'green' : 'red'}>
                  {row.original?.isEmailVerified ? t('Verified') : t('Unverified')}
                </Badge>
              ),
            },
            {
              accessorKey: 'actions',
              header: () => t('Actions'),
              enableSorting: false,
              cell: ({ row }) => (
                <EmployeeActionsMenu employee={row.original} refresh={refresh} />
              ),
            },
          ]}
        />
      </div>
    </Layout>
  );
}
