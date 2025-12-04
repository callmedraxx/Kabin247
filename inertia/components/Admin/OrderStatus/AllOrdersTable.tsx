import axios from 'axios';
import DataTable from '@/components/common/DataTable';
import useTableData from '@/data/use_table_data';
import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import { Badge, HStack, Select, Text, Input, Box } from '@chakra-ui/react';
import { SortingState } from '@tanstack/react-table';
import { useEffect, useState, useRef, useMemo, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import UpdateOrderStatus from './UpdateOrderStatus';
import { toast } from 'sonner';
import UpdateDeliveryPerson from '../ActiveOrders/UpdateDeliveryPerson';
import UpdateDeliveryAirport from '../ActiveOrders/UpdateDeliveryAirport';
import OrderActionsMenu from './OrderActionsMenu';

// Memoized VendorCostCell component to prevent re-renders
const VendorCostCell = memo(({ orderId, initialValue, updateOrder }: {
  orderId: number;
  initialValue: number;
  updateOrder: (id: number, formData: Record<string, any>) => Promise<void>;
}) => {
  const orig = initialValue ?? 0;
  const [value, setValue] = useState<number | ''>(orig);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Sync with external value changes
  useEffect(() => {
    setValue(orig);
  }, [orig]);

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
      await updateOrder(orderId, { vendorCost: Number(value) });
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
          width="80px"
          bg="white"
          rounded="md"
          readOnly
          backgroundColor="#0000"
          fontSize="xs"
        />
      ) : (
        <Input
          size="xs"
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
          width="60px"
          bg="white"
          rounded="md"
          fontSize="xs"
        />
      ))}
      {(isEditing || dirty) && (
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={saveVendorCost}
          disabled={isSaving || !dirty}
          className="px-1.5 py-0.5 bg-primary-500 text-white rounded text-xs hover:bg-primary-600 disabled:opacity-50 w-16"
        >
          {isSaving ? 'Saving...' : 'Update'}
        </button>
      )}
    </HStack>
  );
});

VendorCostCell.displayName = 'VendorCostCell';

// Memoized ActionCell component to prevent re-renders
const ActionCell = memo(({ 
  orderId, 
  refresh, 
  sendEmail, 
  openMenuOrderId, 
  setOpenMenuOrderId 
}: {
  orderId: number;
  refresh: () => void;
  sendEmail: (orderId: number, target: 'client' | 'caterer') => Promise<void>;
  openMenuOrderId: number | null;
  setOpenMenuOrderId: (id: number | null) => void;
}) => {
  const [sendingClient, setSendingClient] = useState(false);
  const [sendingCaterer, setSendingCaterer] = useState(false);

  const onEmailClient = useCallback(async () => {
    if (sendingClient) return;
    setSendingClient(true);
    await sendEmail(orderId, 'client');
    setSendingClient(false);
  }, [orderId, sendEmail, sendingClient]);

  const onEmailCaterer = useCallback(async () => {
    if (sendingCaterer) return;
    setSendingCaterer(true);
    await sendEmail(orderId, 'caterer');
    setSendingCaterer(false);
  }, [orderId, sendEmail, sendingCaterer]);

  return (
    <OrderActionsMenu
      orderId={orderId}
      refresh={refresh}
      onEmailClient={onEmailClient}
      onEmailCaterer={onEmailCaterer}
      sendingClient={sendingClient}
      sendingCaterer={sendingCaterer}
      isOpen={openMenuOrderId === orderId}
      onOpen={() => setOpenMenuOrderId(orderId)}
      onClose={() => setOpenMenuOrderId(null)}
    />
  );
});

ActionCell.displayName = 'ActionCell';

export default function AllOrdersTable({
  setSelectedRow,
}: {
  setSelectedRow: (rows: Record<string, any>[]) => void;
}) {
  const { t } = useTranslation();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [openMenuOrderId, setOpenMenuOrderId] = useState<number | null>(null);

  // fetch all pending orders
  const { items, isLoading, refresh, meta, isValidating } = useTableData('/api/orders', {
    page,
    limit,
    status: '',
  });

  // reset selected rows
  useEffect(() => {
    if (!isValidating && items.length === 0) {
      setSelectedRow([]);
    }
  }, [isValidating]);

  // update order - memoized with useCallback
  const updateOrder = useCallback(async (id: number, formData: Record<string, any>) => {
    try {
      const { data } = await axios.patch(`/api/orders/${id}`, formData);
      if (data?.content?.id) {
        toast.success(t('Order updated successfully'));
        refresh();
      }
    } catch (e: any) {
      toast.error(t(e.response?.data?.message || 'Something went wrong'));
    }
  }, [t, refresh]);

  // send email notification -> then update order status based on target - memoized
  const sendEmail = useCallback(async (orderId: number, target: 'client' | 'caterer') => {
    try {
      await axios.post(`/api/orders/${orderId}/notify/${target}`);
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
  }, [t, updateOrder]);

  const handleRowClick = useCallback((row: any, event?: React.MouseEvent) => {
    // Open the actions menu for this row
    if (event && row?.original?.id) {
      // Don't open if clicking directly on interactive elements
      const target = event.target as HTMLElement;
      if (
        target.closest('button') ||
        target.closest('input') ||
        target.closest('select') ||
        target.closest('[role="menu"]') ||
        target.closest('[role="menuitem"]')
      ) {
        return;
      }
      setOpenMenuOrderId(row.original.id);
    }
  }, []);

  // Memoize structure array to prevent unnecessary re-renders
  const structure = useMemo(() => [
        {
          accessorKey: 'checkbox',
          id: 'checkbox',
          enableSorting: false,
          meta: { className: 'px-0.5', cellClassName: 'px-0.5' },
          header: ({ table }: any) => (
            <input
              type="checkbox"
              checked={table?.getIsAllRowsSelected()}
              onChange={table?.getToggleAllRowsSelectedHandler()}
              className="accent-primary-500 cursor-pointer scale-110"
            />
          ),
          cell: ({ row }: any) => (
            <input
              type="checkbox"
              checked={row?.getIsSelected()}
              onChange={row?.getToggleSelectedHandler()}
              className="accent-primary-500 cursor-pointer scale-110"
            />
          ),
        },
        // 1. Order Status
        {
          accessorKey: 'status',
          header: () => t('Order Status'),
          meta: { className: 'px-0.5', cellClassName: 'px-0.5' },
          cell: ({ row }: any) => (
            <UpdateOrderStatus
              orderId={row.original.id}
              status={row.original.status}
              refresh={refresh}
              type={row.original.type}
              isDeliveryPersonSelected={Boolean(row.original.deliveryManId)}
            />
          ),
        },
        // 2. Client Name
        {
          accessorKey: 'user.fullName',
          header: () => t('Client Name'),
          meta: { className: 'px-0.5', cellClassName: 'px-0.5' },
          cell: ({ row }: any) => <div className="text-xs">{row.original?.user?.fullName || 'Guest'}</div>,
        },
        // 3. Airport
        {
          accessorKey: 'deliveryAirport.name',
          header: () => t('Airport'),
          meta: { className: 'px-0.5', cellClassName: 'px-0.5' },
          cell: ({ row }: any) => {
            if (row.original.type !== 'delivery') {
              return <Text color="secondary.400" fontSize="xs">N/A</Text>;
            }
            const airport = row.original.deliveryAirport;
            // Format: "TEB - Jet Aviation" (ICAO/IATA - FBO Name)
            const airportCode = airport?.icaoCode || airport?.iataCode || '';
            const fboName = airport?.fboName || airport?.name || '';
            const airportDisplay = airportCode && fboName 
              ? `${airportCode} - ${fboName}`
              : airportCode || fboName || '-';
            return (
              <div className="max-w-[120px] overflow-hidden">
                <UpdateDeliveryAirport
                  airport={airport}
                  status={row.original.status}
                  orderId={row.original.id}
                  refresh={refresh}
                />
                {airport && (
                  <Text className="text-xs text-secondary-500 mt-1 truncate" title={airportDisplay}>
                    {airportDisplay}
                  </Text>
                )}
              </div>
            );
          },
        },
        // 4. Delivery Date & Time
        {
          accessorKey: 'deliveryDate',
          header: () => t('Delivery Date & Time'),
          meta: { className: 'px-0.5', cellClassName: 'px-0.5' },
          cell: ({ row }: any) => {
            if (!row.original.deliveryDate) {
              return <Text color="secondary.400" fontSize="xs">-</Text>;
            }
            return (
              <div>
                <Text fontSize="xs">{row.original.deliveryDate}</Text>
                {row.original.deliveryTime && (
                  <Text fontSize="2xs" color="secondary.500">{row.original.deliveryTime}</Text>
                )}
              </div>
            );
          },
        },
        // 5. FBO
        {
          accessorKey: 'fbo',
          header: () => t('FBO'),
          meta: { className: 'px-0.5', cellClassName: 'px-0.5' },
          cell: ({ row }: any) => {
            if (row.original.type !== 'delivery') {
              return <Text color="secondary.400" fontSize="xs">N/A</Text>;
            }
            const airport = row.original.deliveryAirport;
            const fboName = airport?.fboName || airport?.name || '-';
            return (
              <Text fontSize="xs">{fboName}</Text>
            );
          },
        },
        // 6. Tail#
        {
          accessorKey: 'tailNumber',
          header: () => t('Tail#'),
          meta: { className: 'px-0.5', cellClassName: 'px-0.5' },
          cell: ({ row }: any) => <Text fontSize="xs">{row.original.tailNumber || '-'}</Text>,
        },
        // 7. Invoice Amount
        {
          accessorKey: 'grandTotal',
          header: () => t('Invoice Amount'),
          meta: { className: 'px-0.5', cellClassName: 'px-0.5' },
          cell: ({ row }: any) => (
            <p className="font-bold text-xs">{convertToCurrencyFormat(row.original.grandTotal)}</p>
          ),
        },
        // 8. Payment Status
        {
          accessorKey: 'paymentStatus',
          header: () => t('Payment Status'),
          meta: { className: 'px-0.5', cellClassName: 'px-0.5' },
          cell: ({ row }: any) => (
            <Box maxW="80px">
              <Select
                value={row.original.paymentStatus}
                onChange={(e) => {
                  const selectedStatus = e.target.value;
                  updateOrder(row.original.id, { paymentStatus: selectedStatus });
                }}
                size="xs"
                width="100%"
                fontSize="2xs"
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
            </Box>
          ),
        },
        {
          accessorKey: 'action',
          header: () => t('Action'),
          enableSorting: false,
          meta: { className: 'px-0.5', cellClassName: 'px-0.5' },
          cell: ({ row }: any) => (
            <ActionCell
              orderId={row.original.id}
              refresh={refresh}
              sendEmail={sendEmail}
              openMenuOrderId={openMenuOrderId}
              setOpenMenuOrderId={setOpenMenuOrderId}
            />
          ),
        },
      ], [t, updateOrder, refresh, sendEmail, openMenuOrderId, setOpenMenuOrderId]);

  return (
    <>
      <DataTable
        data={items}
        sorting={sorting}
        setSorting={setSorting}
        isLoading={isLoading}
        onRowSelection={setSelectedRow}
        onRowClick={handleRowClick}
        enableMultiRowSelection
        getRowId={(row) => row.id}
        pagination={{
          total: meta?.total,
          page: meta?.currentPage,
          limit: meta?.perPage,
          setPage,
          setLimit,
        }}
        structure={structure}
      />
    </>
  );
}
