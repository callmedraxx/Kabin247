import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import { OrderStatus, TOrderStatus } from '@/utils/order_status';
import { startCase } from '@/utils/string_formatter';
import { Badge, Box } from '@chakra-ui/react';
import { format } from 'date-fns';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

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
| 'cancelled_billable';

type Data = Record<string, any> & {
  id: number;
  orderNumber: string;
  type: 'delivery' | 'dine_in' | 'pickup';
  grandTotal: number;
  status: Status;
};

const orderStatus = new OrderStatus();

export default function OrderCardReadOnly({ data }: { data: Data }) {
  const { t } = useTranslation();
  const [status, setStatus] = React.useState<TOrderStatus>(() =>
    orderStatus.getStatusDetails(data.status || 'quote_pending')
  );

  React.useEffect(() => {
    setStatus(orderStatus.getStatusDetails(data.status));
  }, [data]);

  if (!data) return;

  const { orderNumber, type, grandTotal, orderItems, paymentStatus, createdAt } = data;

  return (
    <Box className="h-56 flex flex-col justify-between bg-white shadow-primary rounded-md p-4 select-none">
      <div className="flex items-start justify-between">
        <div>
          <Badge
            colorScheme={{ dine_in: 'cyan', delivery: 'primary', pickup: 'blue' }?.[type]}
            mb={1}
          >
            {t(startCase(type))}
          </Badge>
          <p className="text-secondary-600 font-bold mb-1">#{orderNumber}</p>
          <p className="text-secondary-400 text-sm">
            {format(new Date(createdAt), 'MMM dd, yyyy | hh:mm a')}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <Badge colorScheme={paymentStatus === 'paid' ? 'green' : paymentStatus === 'unpaid' ? 'orange' : 'cyan'} mb={1}>
            {paymentStatus === 'paid' ? t('Paid') : paymentStatus === 'unpaid' ? t('Unpaid') : t('Payment Requested')}
          </Badge>
          <p className="text-secondary-600 font-bold mb-1">{convertToCurrencyFormat(grandTotal)}</p>
          <p className="text-secondary-400 text-sm">
            {orderItems.length} {orderItems.length > 1 ? t('Item(s)') : t('Item')}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Box
          color={status?.fgColor}
          borderColor={status?.fgColor}
          className="flex items-center justify-between border rounded-md py-2 h-10 px-4 font-semibold"
        >
          {t(status?.label)}
        </Box>
      </div>
    </Box>
  );
}
