import OrderItemList from '@/components/Admin/ActiveOrders/OrderItemList';
import fetcher from '@/lib/fetcher';
import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import { OrderStatus, TOrderStatus } from '@/utils/order_status';
import { startCase } from '@/utils/string_formatter';
import {
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  Flex,
  HStack,
  Spinner,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { Eye } from 'iconsax-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { match } from 'ts-pattern';
import PrintInvoice from '@/components/common/PrintInvoice';

const orderStatus = new OrderStatus();

export default function ViewOrder({ orderId }: { orderId: number }) {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [status, setStatus] = React.useState<TOrderStatus>(orderStatus.getStatusDetails('quote_pending'));

  const btnRef = React.useRef<HTMLButtonElement>(null);

  // fetch order data
  const { data: orderItem, isLoading } = useSWR(
    () => (orderId && isOpen ? `/api/orders/${orderId}` : null),
    fetcher
  );

  // Initialize states function
  const initStates = React.useCallback(() => {
    if (!isLoading && orderItem) {
      setStatus(orderStatus.getStatusDetails(orderItem.status));
    }
  }, [orderItem, isLoading]);

  // Initialize states
  React.useEffect(() => {
    initStates();
  }, [initStates]);

  return (
    <>
      <Button
        onClick={onOpen}
        variant="outline"
        colorScheme="secondary"
        className="border-secondary-200 text-secondary-800 hover:bg-secondary-100"
        rightIcon={<Eye />}
      >
        {t('View')}
      </Button>
      <Drawer
        isOpen={isOpen}
        placement="right"
        size="lg"
        onClose={() => {
          onClose();
        }}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerBody className="p-0 md:px-4">
            <div className="w-full bg-white">
              {match({ orderItem, isLoading })
                // is loading
                .with({ isLoading: true }, () => (
                  <HStack className="mt-6 mx-4">
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
                    <div className="px-4 py-6">
                      <div className="order-details-container">
                        <Text as="h3" className="font-medium text-xl text-secondary-600 mb-6">
                          {t('Order details')}
                        </Text>

                        {/* Order details */}
                        <div className="order-details-grid md:gap-[30px]">
                          {/* Order Number */}
                          <div className="lg:w-fit flex flex-col gap-1 pb-[30px] lg:border-b border-black/5">
                            <Text className="text-base font-normal text-secondary-400">
                              {t('Order number')}
                            </Text>
                            <Text as="h3" className="text-secondary-600 text-xl font-semibold">
                              {orderItem?.orderNumber}
                            </Text>
                          </div>

                          {/* Order Type */}
                          <div className="md:w-fit flex flex-col gap-1 pb-[30px] border-b border-black/5">
                            <Text className="text-base font-normal text-secondary-400">
                              {t('Order type')}
                            </Text>

                            <Badge
                              w="fit-content"
                              colorScheme={
                                orderItem?.type === 'delivery'
                                  ? 'primary'
                                  : orderItem?.type === 'pickup'
                                    ? 'blue'
                                    : 'teal'
                              }
                            >
                              {t(startCase(orderItem?.type))}
                            </Badge>
                          </div>

                          {/* Order Status */}
                          <div className="md:w-fit flex flex-col gap-1 pb-[30px] border-b border-black/5">
                            <Text className="text-base font-normal text-secondary-400">
                              {t('Status')}
                            </Text>

                            <Box
                              className="flex items-center justify-center w-fit gap-2 py-1 rounded-md  px-3"
                              border="1px"
                              borderColor={status.fgColor}
                            >
                              <Text className="font-semibold text-sm" color={status.fgColor}>
                                {t(status?.label)}
                              </Text>
                            </Box>
                          </div>

                          {/* Delivery date */}
                          <div className="md:w-fit flex flex-col gap-1">
                            <Text className="text-base font-normal text-secondary-400">
                              {t('Delivery date')}
                            </Text>
                            <Text as="h3" className="text-secondary-600 text-xl font-semibold">
                              {new Date(orderItem?.deliveryDate).toLocaleDateString()}
                            </Text>
                          </div>

                          {/* Payment method */}
                          <div className="md:w-fit flex flex-col gap-1">
                            <Text className="text-base font-normal text-secondary-400">
                              {t('Payment method')}
                            </Text>
                            <Badge
                              colorScheme={orderItem?.paymentType === 'ach' ? 'primary' : 'blue'}
                              w="fit-content"
                            >
                              {t(startCase(orderItem?.paymentType))}
                            </Badge>
                          </div>

                          {/* Payment Status */}
                          <div className="md:w-fit flex flex-col gap-1">
                            <Text className="text-base font-normal text-secondary-400">
                              {t('Payment status')}
                            </Text>
                            <Flex
                              justifyContent="space-between"
                              className="text-secondary-600 text-xl font-semibold"
                            >
                              <Badge
                                variant="solid"
                                colorScheme="green"
                                size="sm"
                                className="py-0 leading-5 min-h-fit"
                              >
                                {t(orderItem?.paymentStatus ? 'PAID' : 'UNPAID')}
                              </Badge>
                            </Flex>
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
                          <p className="text-lg font-normal">{orderItem?.customerNote}</p>
                        </div>
                      </div>

                      {/* Order items */}
                      <OrderItemList items={orderItem?.orderItems} />

                      <div className="mt-4 flex flex-col gapy-2 [&>div]:border-b [&>div]:border-black/5 [&>div]:py-1 [&>div]:px-4">
                        {/* Subtotal */}
                        <div className="grid grid-cols-[1fr,150px] text-lg">
                          <div> {t('Subtotal')}: </div>
                          <h4 className="font-medium text-right">
                            {convertToCurrencyFormat(orderItem?.total)}
                          </h4>
                        </div>

                        {/* Vat/Tax */}
                        <div className="grid grid-cols-[1fr,150px] text-lg">
                          <div> {t('Vat/Tax')}: </div>
                          <h4 className="font-medium text-right">
                            {convertToCurrencyFormat(orderItem?.totalTax)}
                          </h4>
                        </div>

                        {/* Service charge */}
                        <div className="grid grid-cols-[1fr,150px] text-lg">
                          <div> {t('Service charge')}: </div>
                          <h4 className="font-medium text-right">
                            {convertToCurrencyFormat(orderItem?.totalCharges)}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </>
                ))}
            </div>
          </DrawerBody>

          <DrawerFooter className="p-0">
            <Box
              pt="2"
              pb="4"
              shadow="0px 1px 2px 0px rgba(0, 0, 0, 0.06),0px -1px 3px 0px rgba(0, 0, 0, 0.1)"
              className="w-full px-3 sm:px-8 bg-white z-10 flex flex-col gap-5"
            >
              <div className="grid grid-cols-[1fr,150px] text-lg px-4">
                <div> {t('Grand total')}: </div>
                <h4 className="font-bold text-right">
                  {convertToCurrencyFormat(orderItem?.grandTotal)}
                </h4>
              </div>
              <Divider className="border-black/5" />

              <HStack className="w-full px-4">
                <Button onClick={onClose} variant="outline" className="flex-1">
                  {t('Close')}
                </Button>
                <PrintInvoice orderId={orderItem?.id} />
              </HStack>
            </Box>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
