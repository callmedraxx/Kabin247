import { useEffect, useMemo, useState } from 'react';
import {
  TableContainer,
  Table as TableChakra,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Button,
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  OnChangeFn,
  RowSelectionState,
} from '@tanstack/react-table';
import { ArrowDown2, ArrowLeft2, ArrowRight2 } from 'iconsax-react';
import Pagination from 'rc-pagination';
import { useTranslation } from 'react-i18next';

type Props = {
  data: any;
  isLoading?: boolean;
  structure: ColumnDef<any>[];
  sorting: SortingState;
  setSorting: OnChangeFn<SortingState>;
  onRowSelection?: (data: any) => void;
  getRowId?: (row: any) => any;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    setPage: (page: number) => void;
    setLimit: (page: number) => void;
  };
  padding?: boolean;
  enableMultiRowSelection?: boolean;
};

export default function DataTable({
  data,
  isLoading = false,
  structure,
  sorting,
  pagination = undefined,
  onRowSelection,
  setSorting,
  getRowId,
  enableMultiRowSelection = false,
  padding = true,
}: Props) {
  const { t } = useTranslation();
  const columns = useMemo<ColumnDef<any>[]>(() => structure, [structure]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data: data || [],
    columns,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    getRowId,
    enableMultiRowSelection,
    debugTable: false,
  });

  const selectedRows = useMemo(() => rowSelection, [rowSelection]);

  useEffect(() => {
    if (Object.keys(selectedRows).length) {
      const selectedRowsData = table.getSelectedRowModel().flatRows.map((row) => row.original);
      onRowSelection?.(selectedRowsData);
    } else {
      onRowSelection?.([]);
    }
  }, [selectedRows]);

  if (isLoading) {
    return (
      <TableContainer
        className={`${padding ? 'p-1' : 'p-0'} border border-secondary-200 rounded-md bg-white`}
      >
        <div className="flex justify-center items-center w-full h-32">
          <Spinner />
        </div>
      </TableContainer>
    );
  }

  if (!data?.length) {
    return (
      <TableContainer
        className={`${padding ? 'p-3' : 'p-0'} border border-secondary-200 rounded-md bg-white`}
      >
        <div className="flex flex-col justify-center items-center gap-4 w-full h-auto py-6">
          <img src="/DataEmpty.svg" alt="Data Empty" className='w-24' />
          {t('No data found!')}
        </div>
      </TableContainer>
    );
  }

  return (
    <TableContainer
      className={`${padding ? 'p-1' : 'p-0'} border border-secondary-200 w-full rounded-md overflow-x-auto bg-white`}
    >
      <TableChakra>
        <Thead className="bg-white">
          {table.getHeaderGroups().map((headerGroup) => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Th
                  key={header.id}
                  fontSize={12}
                  py={0}
                  className={(header?.column?.columnDef?.meta as { className?: string })?.className}
                >
                  {header.isPlaceholder ? null : (
                    <Button
                      colorScheme="transparent"
                      {...{
                        className:
                          'font-inter text-secondary-600 text-xs font-bold uppercase h-9 px-0 w-full flex justify-between items-center cursor-pointer py-1',
                        onClick: header.column.getToggleSortingHandler(),
                      }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() &&
                        ({
                          asc: (
                            <ArrowDown2
                              size="16"
                              className="text-secondary-600"
                              transform="rotate(180)"
                            />
                          ),
                          desc: <ArrowDown2 size="16" className="text-secondary-600" />,
                        }[header.column.getIsSorted() as string] ?? (
                          <ArrowDown2 size="16" className="text-transparent" />
                        ))}
                    </Button>
                  )}
                </Th>
              ))}
            </Tr>
          ))}
        </Thead>
        <Tbody>
          {table.getRowModel().rows.map((row, index) => (
            <Tr key={row.id} className={index % 2 === 1 ? 'bg-white' : 'bg-secondary-50'}>
              {row.getVisibleCells().map((cell) => {
                return (
                  <Td
                    key={cell.id}
                    // @ts-ignore
                    className={`${cell.column.columnDef.meta?.cellClassName || ''} text-secondary-600 font-medium text-sm`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Td>
                );
              })}
            </Tr>
          ))}
        </Tbody>
      </TableChakra>
      {pagination && pagination.total > 5 && (
        <div className="flex justify-between items-center py-4 sticky left-0 inset-0 flex-wrap md:flex-nowrap gap-y-2 gap-x-4">
          <Menu placement="top-start">
            <MenuButton
              as={Button}
              className="text-sm font-medium gap-2 rounded-md h-8 bg-white border border-black/10"
              rightIcon={<ArrowDown2 size="16" color="currentColor" />}
            >
              {`${pagination.limit} ${t('Items')}`}
            </MenuButton>
            <MenuList className="p-1">
              {[5, 10, 20, 30]?.map((page) => (
                <MenuItem key={page} onClick={() => pagination.setLimit(page)}>
                  {`${page} ${t('items')}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <div className="flex justify-between flex-row items-center gap-2">
            <Pagination
              showTotal={(total, range) =>
                t('Showing {{start}}-{{end}} of {{total}}', {
                  start: range[0],
                  end: range[1],
                  total,
                })
              }
              current={pagination.page}
              total={pagination.total}
              pageSize={pagination.limit}
              hideOnSinglePage
              showLessItems
              onChange={(page) => pagination.setPage(page)}
              className="flex justify-between flex-row items-center gap-2"
              prevIcon={<ArrowLeft2 size="18" />}
              nextIcon={<ArrowRight2 size="18" />}
            />
          </div>
        </div>
      )}
    </TableContainer>
  );
}
