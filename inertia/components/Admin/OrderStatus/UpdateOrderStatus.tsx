import axios from 'axios';
import { OrderStatus } from '@/utils/order_status';
import { startCase } from '@/utils/string_formatter';
import { Menu, MenuButton, MenuList, MenuItem, Badge, Box } from '@chakra-ui/react';
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

  const statusDetails = orderStatus.getStatusDetails(status);
  
  return (
    <Box>
      <Menu>
        <MenuButton
          as={Box}
          onClick={(e) => e.stopPropagation()}
          cursor="pointer"
          display="inline-block"
        >
          <Badge
            variant="subtle"
            colorScheme={statusDetails?.scheme}
            fontSize="2xs"
            px={1.5}
            py={0.5}
            borderRadius="md"
            display="inline-flex"
            alignItems="center"
            gap={1}
            border="1px solid"
            borderColor={statusDetails?.fgColor || 'gray.300'}
            color={statusDetails?.fgColor}
          >
            <span className="text-[10px] leading-tight whitespace-nowrap">
              {t(startCase(status))}
            </span>
            <ArrowDown2 size={10} />
          </Badge>
        </MenuButton>
        <MenuList className="p-1" fontSize="xs">
          {orderStatus.all().map((status) =>
            type !== 'delivery' && status.value === 'on_delivery' ? null : (
              <MenuItem
                key={status.value}
                color={status.fgColor}
                fontSize="xs"
                py={1.5}
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
    </Box>
  );
}
