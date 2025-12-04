import axios from 'axios';
import DataTable from '@/components/common/DataTable';
import useTableData from '@/data/use_table_data';
import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import { Badge, HStack, Select, Text, Input } from '@chakra-ui/react';
import { SortingState } from '@tanstack/react-table';
import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import UpdateOrderStatus from './UpdateOrderStatus';
import { toast } from 'sonner';
import UpdateDeliveryPerson from '../ActiveOrders/UpdateDeliveryPerson';
import UpdateDeliveryAirport from '../ActiveOrders/UpdateDeliveryAirport';
import OrderActionsMenu from './OrderActionsMenu';

export default function QuotePendingTable({
  setSelectedRow,
}: {
  setSelectedRow: (rows: Record<string, any>[]) => void;
}) {
  const { t } = useTranslation();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // fetch all pending orders
  const { items, isLoading, refresh, meta, isValidating } = useTableData('/api/orders', {
    page,
    limit,
    status: 'quote_pending',
  });

  // reset selected rows
  useEffect(() => {
    if (!isValidating && items.length === 0) {
      setSelectedRow([]);
    }
  }, [isValidating]);

  // update order
  const updateOrder = async (id: number, formData: Record<string, any>) => {
    try {
      const { data } = await axios.patch(`/api/orders/${id}`, formData);
      if (data?.content?.id) {
        toast.success(t('Order updated successfully'));
        refresh();
      }
    } catch (e: any) {
      toast.error(t(e.response?.data?.message || 'Something went wrong'));
    }
  };

  // send email notification -> then update order status based on target
  const sendEmail = async (orderId: number, target: 'client' | 'caterer') => {
    try {
      await axios.post(`/api/orders/${orderId}/notify/${target}`); // adjust path if needed
      toast.success(
        target === 'client' ? t('Email sent to client') : t('Email sent to caterer')
      );

      // Only change status if email send succeeded
      const nextStatus =
        target === 'client' ? 'quote_sent' : 'awaiting_vendor_confirmation';

      await updateOrder(orderId, { status: nextStatus });
    } catch (e: any) {
      toast.error(t(e.response?.data?.message || 'Failed to send email'));
    }
  };

  return (
    <DataTable
      data={items}
      sorting={sorting}
      setSorting={setSorting}
      isLoading={isLoading}
      onRowSelection={setSelectedRow}
      onRowClick={(row) => {
        const rowElement = document.querySelector(`tr[data-row-id="${row.id}"]`);
        if (rowElement) {
          const actionButton = rowElement.querySelector('[aria-label*="actions"]') as HTMLElement;
          if (actionButton) {
            actionButton.click();
          }
        }
      }}
      enableMultiRowSelection
      getRowId={(row) => row.id}
      pagination={{
        total: meta?.total,
        page: meta?.currentPage,
        limit: meta?.perPage,
        setPage,
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
          accessorKey: 'action',
          header: () => t('Action'),
          cell: ({ row }) => {
            const [sendingClient, setSendingClient] = useState(false);
            const [sendingCaterer, setSendingCaterer] = useState(false);

            const onEmailClient = async () => {
              if (sendingClient) return;
              setSendingClient(true);
              await sendEmail(row.original.id, 'client');
              setSendingClient(false);
            };

            const onEmailCaterer = async () => {
              if (sendingCaterer) return;
              setSendingCaterer(true);
              await sendEmail(row.original.id, 'caterer');
              setSendingCaterer(false);
            };

            return (
              <OrderActionsMenu
                orderId={row.original.id}
                refresh={refresh}
                onEmailClient={onEmailClient}
                onEmailCaterer={onEmailCaterer}
                sendingClient={sendingClient}
                sendingCaterer={sendingCaterer}
              />
            );
          },
        },
        {
          accessorKey: 'orderNumber',
          header: () => t('Order No'),
          cell: ({ row }) => <span className="font-bold">{row.original.orderNumber}</span>,
        },
        {
          accessorKey: 'user.fullName',
          header: () => t('Client name'),
          cell: ({ row }) => <div>{row.original?.user?.fullName || 'Guest'}</div>,
        },
        {
          accessorKey: 'grandTotal',
          header: () => t('Total'),
          cell: ({ row }) => (
            <p className="font-bold">{convertToCurrencyFormat(row.original.grandTotal)}</p>
          ),
        },
        {
          accessorKey: 'vendorCost',
          header: () => t('Vendor Cost'),
          cell: ({ row }) => {
            const orig = row.original.vendorCost ?? 0;
            const [value, setValue] = useState<number | ''>(orig);
            const [isEditing, setIsEditing] = useState(false);
            const [isSaving, setIsSaving] = useState(false);
            const wrapperRef = useRef<HTMLDivElement | null>(null);

            const dirty = value !== '' && Number(value) !== orig;

            useEffect(() => {
              const onDocClick = (e: MouseEvent) => {
                if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                  setIsEditing(false);
                }
              };
              document.addEventListener('mousedown', onDocClick);
              return () => document.removeEventListener('mousedown', onDocClick);
            }, []);

            const saveVendorCost = async () => {
              if (!dirty) { setIsEditing(false); return; }
              try {
                setIsSaving(true);
                await updateOrder(row.original.id, { vendorCost: Number(value) });
              } finally {
                setIsSaving(false);
                setIsEditing(false);
              }
            };

            return (
              <HStack ref={wrapperRef} spacing={2}>
                {(!isEditing ? (
                  <Input
                    size="sm"
                    type="number"
                    value={value}
                    onFocus={() => setIsEditing(true)}
                    onChange={(e) => {
                      const v = e.target.value;
                      setValue(v === '' ? '' : Number(v));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveVendorCost();
                      if (e.key === 'Escape') { setIsEditing(false); setValue(orig); }
                    }}
                    width="140px"
                    bg="white"
                    rounded="md"
                    readOnly
                    backgroundColor="#0000"
                  />
                ) : (
                  <Input
                    size="sm"
                    type="number"
                    value={value}
                    onFocus={() => setIsEditing(true)}
                    onChange={(e) => {
                      const v = e.target.value;
                      setValue(v === '' ? '' : Number(v));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveVendorCost();
                      if (e.key === 'Escape') { setIsEditing(false); setValue(orig); }
                    }}
                    width="50px"
                    bg="white"
                    rounded="md"
                  />
                ))}
                {(isEditing || dirty) && (
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={saveVendorCost}
                    disabled={isSaving || !dirty}
                    className="px-2 py-1 bg-primary-500 text-white rounded text-sm hover:bg-primary-600 disabled:opacity-50 w-20"
                  >
                    {isSaving ? 'Saving...' : 'Update'}
                  </button>
                )}
              </HStack>
            );
          },
        },
        {
          accessorKey: 'paymentType',
          header: () => t('Payment'),
          cell: ({ row }) => (
            <Badge
              variant="subtle"
              colorScheme={row.original.paymentType === 'ach' ? 'primary' : 'blue'}
            >
              {t((row.original.paymentType === 'stripe' || row.original.paymentType === 'card') ? 'card' : (row.original.paymentType === 'ach' ? 'ach' : row.original.paymentType || 'card'))}
            </Badge>
          ),
        },
        {
          accessorKey: 'deliveryPerson.fullName',
          header: () => t('Caterer'),
          cell: ({ row }) => {
            if (row.original.type !== 'delivery') return <Text color="secondary.400">N/A</Text>;
            return (
              <div className="max-w-[260px] overflow-hidden">
                <UpdateDeliveryPerson
                  deliveryPerson={row.original.deliveryMan}
                  status={row.original.status}
                  orderId={row.original.id}
                  refresh={refresh}
                />
              </div>
            );
          },
        },
        {
          accessorKey: 'deliveryAirport.name',
          header: () => t('Delivery Airport'),
          cell: ({ row }) => {
            if (row.original.type !== 'delivery') return <Text color="secondary.400">N/A</Text>;
            return (
              <div className="max-w-[260px] overflow-hidden">
                <UpdateDeliveryAirport
                  airport={row.original.deliveryAirport}
                  status={row.original.status}
                  orderId={row.original.id}
                  refresh={refresh}
                />
              </div>
            );
          },
        },
        {
          accessorKey: 'paymentStatus',
          header: () => t('Payment Status'),
          cell: ({ row }) => (
            <Select
              value={row.original.paymentStatus}
              onChange={(e) => {
                const selectedStatus = e.target.value;
                updateOrder(row.original.id, { paymentStatus: selectedStatus });
              }}
              size="sm"
              width="auto"
              className={`${row.original.paymentStatus === 'paid'
                ? 'bg-green-300 hover:bg-green-400'
                : row.original.paymentStatus === 'payment_requested'
                  ? 'bg-blue-300 hover:bg-blue-400'
                  : 'bg-red-300 hover:bg-red-400'
                } text-white rounded-[6px] border border-1 border-solid border-gray-400`}
            >
              <option value="unpaid" className="text-black">
                {t('Unpaid')}
              </option>
              <option value="payment_requested" className="text-black">
                {t('Payment Requested')}
              </option>
              <option value="paid" className="text-black">
                {t('Paid')}
              </option>
            </Select>
          ),
        },
        {
          accessorKey: 'status',
          header: () => t('Status'),
          cell: ({ row }) => (
            <UpdateOrderStatus
              orderId={row.original.id}
              status={row.original.status}
              refresh={refresh}
              type={row.original.type}
              isDeliveryPersonSelected={Boolean(row.original.deliveryManId)}
            />
          ),
        },
        {
          accessorKey: 'createdAt',
          header: () => t('Created On'),
          cell: ({ row }) => (
            <div>
              {new Date(row.original.createdAt)
                .toLocaleString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })
                .replace(',', ' -')}
            </div>
          ),
        },
      ]}
    />
  );
}
