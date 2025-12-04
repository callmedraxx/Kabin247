import { convertToCurrencyFormat } from '../../../utils/currency_formatter';
import { OrderStatus, TOrderStatus } from '../../../utils/order_status';
import { startCase } from '../../../utils/string_formatter';
import { Badge, Box, Button, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import axios from 'axios';
import { ArrowDown2 } from 'iconsax-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { format } from 'date-fns';

type Status =
  | 'quote_pending'
  | 'quote_sent'
  | 'awaiting_vendor_quote'
  | 'awaiting_vendor_confirmation'
  | 'vendor_confirmed'
  | 'awaiting_client_confirmation'
  | 'client_confirmed'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled_not_billable'
  | 'cancelled_billable'
  | 'returned';

type Data = Record<string, any> & {
  id: number;
  orderNumber: string;
  type: 'delivery' | 'dine_in' | 'pickup';
  grandTotal: number;
  status: Status;
};

const orderStatus = new OrderStatus();

export default function OrderCard({
  onClick,
  data,
  refresh,
}: {
  onClick: (id: number) => void;
  data: Data;
  refresh: () => void;
}) {
  const { t } = useTranslation();
  const [status, setStatus] = React.useState<TOrderStatus>(() =>
    orderStatus.getStatusDetails(data.status || 'quote_pending')
  );

  React.useEffect(() => {
    setStatus(orderStatus.getStatusDetails(data.status));
  }, [data]);

  if (!data) return null;

  const { id, orderNumber, type, grandTotal, orderItems, paymentStatus, createdAt, user, deliveryAirport } = data;

  const handleStatusChange = async (status: TOrderStatus) => {
    if (
      !data.deliveryManId &&
      data.type === 'delivery' &&
      (status.value === 'completed')
    ) {
      toast.error(t('Select caterer first'));
      return;
    }

    try {
      const { data } = await axios.patch(`/api/orders/${id}`, {
        status: status.value,
      });

      if (data?.content?.id) {
        toast.success(t('Order updated successfully'));
        refresh();
      }
    } catch (e) {
      toast.error(t(e.response.data.message || 'Something went wrong'));
    }
  };

  // Format airport display - handle same codes with different FBO names
  const airportDisplay = deliveryAirport 
    ? `${deliveryAirport.fboName || deliveryAirport.name || ''}${deliveryAirport.iataCode || deliveryAirport.icaoCode ? ` (${[deliveryAirport.iataCode, deliveryAirport.icaoCode].filter(Boolean).join(' / ')})` : ''}`
    : '-';

  // Get order items summary
  const itemsSummary = orderItems?.slice(0, 2).map((item: any) => item.name).join(', ') + (orderItems?.length > 2 ? '...' : '');

  return (
    <Box
      className="h-64 flex flex-col justify-between bg-white shadow-primary rounded-md p-4 cursor-pointer"
      onClick={() => onClick?.(id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Badge
            colorScheme={{ dine_in: 'cyan', delivery: 'primary', pickup: 'blue' }?.[type]}
            mb={1}
          >
            {t(startCase(type))}
          </Badge>
          <p className="text-secondary-600 font-bold mb-1">#{orderNumber}</p>
          {itemsSummary && (
            <p className="text-secondary-500 text-xs mb-1 line-clamp-1" title={itemsSummary}>
              {itemsSummary}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end ml-2">
          <p className="text-secondary-400 text-xs mb-1">
            {orderItems?.length || 0} {orderItems?.length !== 1 ? t('Item(s)') : t('Item')}
          </p>
        </div>
      </div>

      {/* Delivery Information - Prioritized */}
      {type === 'delivery' && deliveryAirport && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-2 mb-2">
          <p className="text-blue-800 font-semibold text-sm mb-1">
            {t('Delivery Location')}
          </p>
          <p className="text-blue-700 text-sm font-medium">
            {airportDisplay}
          </p>
        </div>
      )}

      <p className="text-secondary-600 text-sm font-medium">
        <span className='font-bold text-[#0009]'>
          {t('Delivery Date')}:{" "}
        </span>
        {format(new Date(createdAt), 'MMM dd, yyyy | hh:mm a')}
      </p>

      <p className="text-secondary-500 text-sm">
        <span className='font-bold text-[#0009]'>
          {t('Client')}:{" "}
        </span>
        {user?.fullName || "-"}
      </p>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex flex-col gap-2 flex-1">
          <Menu>
            <MenuButton
              as={Button}
              w="full"
              variant="outline"
              textAlign="left"
              colorScheme={status?.scheme}
              color={status?.fgColor}
              borderColor={status?.fgColor}
              rightIcon={<ArrowDown2 />}
              onClick={(e) => e.stopPropagation()}
            >
              {t(status?.label)}
            </MenuButton>
            <MenuList className="p-1">
              {orderStatus.all().map(
                (s) =>
                  (!s.orderType || s.orderType === type) && (
                    <MenuItem
                      key={s.value}
                      color={s.fgColor}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(s);
                      }}
                    >
                      {t(s.label)}
                    </MenuItem>
                  )
              )}
            </MenuList>
          </Menu>
        </div>
        {/* Payment info moved to bottom right - secondary */}
        <div className="flex flex-col items-end ml-2 text-right">
          <Badge 
            colorScheme={paymentStatus === 'paid' ? 'green' : paymentStatus === 'unpaid' ? 'orange' : 'cyan'} 
            mb={1}
            fontSize="xs"
          >
            {paymentStatus === 'unpaid' ? t('UNPAID') : paymentStatus === 'payment_requested' ? t('PAYMENT REQUESTED') : t('PAID')}
          </Badge>
          <p className="text-secondary-500 text-sm font-medium">
            {convertToCurrencyFormat(grandTotal)}
          </p>
        </div>
      </div>
    </Box>
  );
}
