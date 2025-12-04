import DataTable from '@/components/common/DataTable';
import useTableData from '@/data/use_table_data';
import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import { OrderStatus } from '@/utils/order_status';
import { startCase } from '@/utils/string_formatter';
import { Select, Badge, Button, Menu, MenuButton, MenuItem, MenuList, Text, Box, HStack } from '@chakra-ui/react';
import { SortingState } from '@tanstack/react-table';
import axios from 'axios';
import { ArrowDown2, Eye } from 'iconsax-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { router } from '@inertiajs/react';

// order status
const orderStatus = new OrderStatus();

export default function RecentOrdersTable() {
  const { t } = useTranslation();
  const [sorting, setSorting] = useState<SortingState>([]);

  // fetch all pending orders
  const { items, isLoading, refresh } = useTableData('/api/orders', {
    page: 1,
    limit: 10,
  });

  // update order
  const updateOrder = async (id: number, formData: Record<string, any>) => {
    try {
      const { data } = await axios.patch(`/api/orders/${id}`, formData);
      if (data?.content?.id) {
        toast.success(t('Order updated successfully'));
        refresh();
      }
    } catch (e) {
      toast.error(t(e.response.data.message || 'Something went wrong'));
    }
  };

  return (
    <div className="[&>div]:rounded-xl [&_table]:border-collapse">
      <style>{`
        [&_table] table {
          border-collapse: collapse;
        }
        [&_table] th, [&_table] td {
          padding: 0.15rem 0.35rem !important;
          white-space: nowrap;
        }
      `}</style>
      <DataTable
        data={items.filter(
          (item: any) => !['completed', 'failed', 'canceled'].includes(item.status)
        )}
        sorting={sorting}
        setSorting={setSorting}
        isLoading={isLoading}
        structure={[
          // 1. Priority
          {
            accessorKey: 'priority',
            id: 'priority',
            header: () => t('Priority'),
            meta: { className: 'px-1', cellClassName: 'px-1' },
            cell: ({ row }) => {
              if (!row.original.priority) {
                return <Text fontSize="xs" color="gray.400">-</Text>;
              }
              return (
                <Badge variant="subtle" colorScheme="orange" fontSize="xs">
                  {row.original.priority}
                </Badge>
              );
            },
          },
          // 2. Order Status (add "Delivered/Comped")
          {
            accessorKey: 'status',
            id: 'status',
            header: () => t('Order Status'),
            meta: { className: 'px-1', cellClassName: 'px-1' },
            cell: ({ row }) => {
              const statusDetails = orderStatus.getStatusDetails(row.original.status);
              const statusLabel = row.original.status === 'completed' 
                ? 'Delivered/Comped' 
                : statusDetails?.label || startCase(row.original.status);
              
              return (
                <Menu>
                  <MenuButton
                    as={Button}
                    variant="outline"
                    size="sm"
                    colorScheme={statusDetails?.scheme}
                    borderColor={statusDetails?.fgColor}
                    color={statusDetails?.fgColor}
                    rightIcon={<ArrowDown2 />}
                    onClick={(e) => e.stopPropagation()}
                    fontSize="xs"
                  >
                    {t(statusLabel)}
                  </MenuButton>
                  <MenuList className="p-1">
                    {orderStatus.all().map(
                      (s) =>
                        (!s.orderType || s.orderType === row.original.type) && (
                          <MenuItem
                            key={s.value}
                            color={s.fgColor}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOrder(row.original.id, { status: s.value });
                            }}
                          >
                            {t(s.value === 'completed' ? 'Delivered/Comped' : s.label)}
                          </MenuItem>
                        )
                    )}
                  </MenuList>
                </Menu>
              );
            },
          },
          // 3. Client Name
          {
            accessorKey: 'user.fullName',
            id: 'userFullName',
            header: () => t('Client Name'),
            meta: { className: 'px-1', cellClassName: 'px-1' },
            cell: ({ row }) => (
              <div className="font-medium text-sm">{row.original?.user?.fullName || 'Guest'}</div>
            ),
          },
          // 4. Airport (format: "TEB - Jet Aviation")
          {
            accessorKey: 'deliveryAirport.name',
            id: 'deliveryAirport',
            header: () => t('Airport'),
            meta: { className: 'px-1', cellClassName: 'px-1' },
            cell: ({ row }) => {
              if (row.original.type !== 'delivery') {
                return <Text fontSize="xs" color="gray.400">N/A</Text>;
              }
              const airport = row.original.deliveryAirport;
              if (!airport) {
                return <Text fontSize="xs" color="gray.400">-</Text>;
              }
              // Format: "TEB - Jet Aviation" (ICAO/IATA - FBO Name)
              const airportCode = airport.icaoCode || airport.iataCode || '';
              const fboName = airport.fboName || airport.name || '';
              const airportDisplay = airportCode && fboName 
                ? `${airportCode} - ${fboName}`
                : airportCode || fboName || '-';
              return (
                <div className="max-w-[200px]">
                  <Text fontSize="xs" className="truncate" title={airportDisplay}>
                    {airportDisplay}
                  </Text>
                </div>
              );
            },
          },
          // 5. Delivery Date & Time
          {
            accessorKey: 'deliveryDate',
            id: 'deliveryDate',
            header: () => t('Delivery Date & Time'),
            meta: { className: 'px-1', cellClassName: 'px-1' },
            cell: ({ row }) => {
              if (!row.original.deliveryDate) {
                return <Text fontSize="xs" color="gray.400">-</Text>;
              }
              return (
                <div>
                  <Text fontSize="xs">{row.original.deliveryDate}</Text>
                  {row.original.deliveryTime && (
                    <Text fontSize="2xs" color="gray.500">
                      {row.original.deliveryTime}
                    </Text>
                  )}
                </div>
              );
            },
          },
          // 6. Tail#
          {
            accessorKey: 'tailNumber',
            id: 'tailNumber',
            header: () => t('Tail#'),
            meta: { className: 'px-1', cellClassName: 'px-1' },
            cell: ({ row }) => (
              <Text fontSize="xs">{row.original.tailNumber || '-'}</Text>
            ),
          },
          // 7. Order Type
          {
            accessorKey: 'type',
            id: 'type',
            header: () => t('Order Type'),
            meta: { className: 'px-1', cellClassName: 'px-1' },
            cell: ({ row }) => {
              const colorScheme = {
                dine_in: 'teal',
                delivery: 'primary',
                pickup: 'blue',
                qe_serv_hub: 'purple',
              };

              return (
                <Badge
                  variant="solid"
                  colorScheme={
                    colorScheme[row.original.type as keyof typeof colorScheme] || 'secondary'
                  }
                  fontSize="xs"
                >
                  {t(row.original.type?.replace('_', '-'))}
                </Badge>
              );
            },
          },
          // 8. Action Button (View Order)
          {
            accessorKey: 'actions',
            id: 'actions',
            header: () => t('Actions'),
            enableSorting: false,
            meta: { className: 'px-1', cellClassName: 'px-1' },
            cell: ({ row }) => (
              <Button
                size="xs"
                colorScheme="blue"
                variant="outline"
                leftIcon={<Eye size="14" />}
                onClick={(e) => {
                  e.stopPropagation();
                  router.visit(`/admin/active-orders?orderId=${row.original.id}`);
                }}
              >
                {t('View Order')}
              </Button>
            ),
          },
          // 9. Notes
          {
            accessorKey: 'notes',
            id: 'notes',
            header: () => t('Notes'),
            meta: { className: 'px-1', cellClassName: 'px-1' },
            cell: ({ row }) => {
              const notes = [];
              if (row.original.dietaryRes) {
                notes.push(`Dietary: ${row.original.dietaryRes}`);
              }
              if (row.original.packagingNote) {
                notes.push(`Packaging: ${row.original.packagingNote}`);
              }
              if (row.original.customerNote) {
                notes.push(`Customer: ${row.original.customerNote}`);
              }
              if (row.original.note) {
                notes.push(`Note: ${row.original.note}`);
              }
              if (notes.length === 0) {
                return <Text fontSize="xs" color="gray.400">-</Text>;
              }
              return (
                <div className="max-w-[200px]">
                  {notes.slice(0, 2).map((note, idx) => (
                    <Text key={idx} fontSize="2xs" color="gray.600" className="truncate">
                      {note}
                    </Text>
                  ))}
                  {notes.length > 2 && (
                    <Text fontSize="2xs" color="gray.500">
                      +{notes.length - 2} more
                    </Text>
                  )}
                </div>
              );
            },
          },
          // Items column removed as per requirements
        ]}
      />
    </div>
  );
}
