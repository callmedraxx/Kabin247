import useWindowSize from '@/hooks/useWindowSize';
import fetcher from '@/lib/fetcher';
import { OrderStatus, TOrderStatus } from '@/utils/order_status';
import { startCase } from '@/utils/string_formatter';
import {
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Text,
  Textarea,
} from '@chakra-ui/react';
import { ArrowDown2 } from 'iconsax-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { match } from 'ts-pattern';
import OrderItemList from './OrderItemList';

type OrderType = 'dine_in' | 'delivery' | 'pickup';

const orderStatus = new OrderStatus();

// Order details sidebar component
export default function OrderDetailsSidebar({
  isOpen,
  orderId,
  onClose,
  isValidating,
}: {
  isOpen: boolean;
  orderId: number;
  onClose: () => void;
  isValidating?: boolean;
}) {
  const { t } = useTranslation();
  const [status, setStatus] = React.useState<TOrderStatus>(orderStatus.getStatusDetails('quote_pending'));
  const [customerNote, setCustomerNote] = React.useState('');
  const [orderType, setOrderType] = React.useState<OrderType>();

  const windowSize = useWindowSize();

  // fetch order data
  const {
    data: orderItem,
    isLoading,
    mutate,
  } = useSWR(() => (orderId ? `/api/orders/${orderId}` : null), fetcher);

  React.useEffect(() => {
    mutate();
  }, [isValidating]);

  // Initialize states function
  const initStates = React.useCallback(() => {
    if (!isLoading && orderItem) {
      setStatus(orderStatus.getStatusDetails(orderItem.status));
      setOrderType(orderItem.type);
      setCustomerNote(orderItem.customerNote ?? '');
    }
  }, [orderItem, isLoading]);

  // Initialize states
  React.useEffect(() => {
    initStates();
  }, [initStates]);

  const content = (
    <div className="relative w-full h-full lg:h-[calc(100vh-76px)] bg-white border-l border-black/10">
      {match({ orderItem, isLoading })
        // is loading
        .with({ isLoading: true }, () => (
          <HStack justify="center" height="200px">
            <Spinner size="sm" />
            <Text className="text-secondary-500"> {t('Loading...')} </Text>
          </HStack>
        ))

        // if order not found
        .with({ orderItem: null, isLoading: false }, () => (
          <Text className="py-6 px-4 text-secondary-500"> {t('Order not found')} </Text>
        ))

        // render order details
        .otherwise(({ orderItem }) => (
          <>
            <div className="px-4 py-6 flex-1">
              <div className="order-details-container">
                <Text as="h3" className="font-medium text-xl text-secondary-600 mb-6">
                  {t('Order details')}
                </Text>

                {/* Order details */}
                <div className="order-details-grid md:gap-[30px]">
                  {/* Order Number */}
                  <div>
                    <div className="lg:w-fit flex flex-col gap-1 pb-[30px] lg:border-b border-black/5">
                      <Text className="text-base font-normal text-secondary-400">
                        {t('Order number')}
                      </Text>
                      <Text as="h3" className="text-secondary-600 text-xl font-semibold">
                        {orderItem?.orderNumber}
                      </Text>
                    </div>
                  </div>
                  {/* Order Type */}
                  <div>
                    <div className="md:w-fit flex flex-col gap-1 pb-[30px] border-b border-black/5">
                      <Text className="text-base font-normal text-secondary-400">
                        {t('Order type')}
                      </Text>

                      <Box className="border border-secondary-200 rounded-md p-2">
                        {t(startCase(orderType))}
                      </Box>
                    </div>
                  </div>
                  {/* Order Status */}
                  <div>
                    <div className="md:w-fit flex flex-col gap-1 pb-[30px] border-b border-black/5">
                      <Text className="text-base font-normal text-secondary-400">
                        {t('Status')}
                      </Text>

                      <Menu>
                        <MenuButton
                          as={Button}
                          variant="outline"
                          color={status?.fgColor}
                          borderColor={status?.fgColor}
                          rightIcon={<ArrowDown2 />}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {t(status?.label)}
                        </MenuButton>
                        <MenuList className="p-1">
                          {orderStatus.all().map(
                            (s, index) =>
                              (!s.orderType || orderType === s.orderType) && (
                                <MenuItem
                                  key={index}
                                  color={s.fgColor}
                                  onClick={() => setStatus(s)}
                                >
                                  {t(s.label)}
                                </MenuItem>
                              )
                          )}
                        </MenuList>
                      </Menu>
                    </div>
                  </div>
                  {/* Delivery date */}
                  <div>
                    <div className="md:w-fit flex flex-col gap-1">
                      <Text className="text-base font-normal text-secondary-400">
                        {t('Delivery date')}
                      </Text>
                      <Text as="h3" className="text-secondary-600 text-xl font-semibold">
                        {new Date(orderItem?.deliveryDate).toLocaleDateString()}
                      </Text>
                    </div>
                  </div>
                </div>
              </div>

              <Divider className="border-black/5" />

              {/* User note */}
              <div className="mt-3 mb-4">
                <div className="flex flex-col space-y-2">
                  <Text className="text-base font-normal text-secondary-400">
                    {t('Order note')}
                  </Text>
                  <Textarea
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    placeholder={t('Write client note')}
                  />
                </div>
              </div>

              {/* Order items */}
              <OrderItemList items={orderItem?.orderItems} />
            </div>

            <Box
              px="4"
              pt="2"
              pb="4"
              shadow="0px 1px 2px 0px rgba(0, 0, 0, 0.06),0px -1px 3px 0px rgba(0, 0, 0, 0.1)"
              className="absolute inset-x-0 bottom-0 bg-white z-10 flex flex-col gap-5"
            >
              <HStack className="w-full px-4">
                <Button onClick={onClose} variant="outline" className="flex-1">
                  {t('Close')}
                </Button>
              </HStack>
            </Box>
          </>
        ))}
    </div>
  );

  // drawer
  if (windowSize.width < 992) {
    return (
      <Drawer isOpen={isOpen} placement="right" size="md" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent className="p-0">
          <DrawerBody className="p-0 h-screen">{content}</DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  }

  // render
  if (isOpen) {
    return content;
  }
}
