import axios from 'axios';
import { OrderStatus } from '@/utils/order_status';
import { startCase } from '@/utils/string_formatter';
import { Menu, MenuButton, Button, MenuList, MenuItem } from '@chakra-ui/react';
import { ArrowDown2 } from 'iconsax-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const orderStatus = new OrderStatus();

export default function UpdateOrderStatus({
  orderId,
  status,
  refresh,
  type,
  isDeliveryPersonSelected,
}: {
  orderId: number;
  status: string;
  refresh: () => void;
  type: 'delivery' | 'dine_in' | 'pickup';
  isDeliveryPersonSelected?: boolean;
}) {
  const { t } = useTranslation();

  // update order
  const updateOrder = async (id: number, formData: Record<string, any>) => {
    if (
      !isDeliveryPersonSelected &&
      type === 'delivery' &&
      (formData.status === 'on_delivery' || formData.status === 'completed')
    ) {
      toast.error(t('Select delivery person first'));
      return;
    }

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
    <div>
      <Menu>
        <MenuButton
          as={Button}
          size="sm"
          variant="outline"
          colorScheme={orderStatus.getStatusDetails(status)?.scheme}
          borderColor={orderStatus.getStatusDetails(status)?.fgColor}
          color={orderStatus.getStatusDetails(status)?.fgColor}
          rightIcon={<ArrowDown2 />}
          onClick={(e) => e.stopPropagation()}
        >
          {t(startCase(status))}
        </MenuButton>
        <MenuList className="p-1">
          {orderStatus.all().map((status) =>
            type !== 'delivery' && status.value === 'on_delivery' ? null : (
              <MenuItem
                key={status.value}
                color={status.fgColor}
                onClick={(e) => {
                  e.stopPropagation();
                  updateOrder(orderId, { status: status.value });
                }}
              >
                {t(status.label)}
              </MenuItem>
            )
          )}
        </MenuList>
      </Menu>
    </div>
  );
}
