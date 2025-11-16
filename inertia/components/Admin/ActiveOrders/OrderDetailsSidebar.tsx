import axios from 'axios';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { match } from 'ts-pattern';
import {
  Text,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Button,
  Flex,
  Divider,
  Textarea,
  HStack,
  Spinner,
  Box,
  Input,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerBody,
  Icon,
  Select,
} from '@chakra-ui/react';
import { ArrowDown2, User } from 'iconsax-react';
import fetcher from '../../../lib/fetcher';
import { startCase } from '../../../utils/string_formatter';
import { convertToCurrencyFormat } from '../../../utils/currency_formatter';
import OrderItemList from './OrderItemList';
import { toast } from 'sonner';
import UpdateDeliveryPerson from './UpdateDeliveryPerson';
import { OrderStatus, TOrderStatus } from '../../../utils/order_status';
import PrintInvoice from '../../../components/common/PrintInvoice';
import useWindowSize from '../../../hooks/useWindowSize';
import DiscountTypeRadioGroup from '../POS/DiscountTypeSelect';
import { usePage } from '@inertiajs/react';
import { PageProps } from '../../../types';
import { Charge } from '../../../types/pos_type';
import UpdateDeliveryAirport from './UpdateDeliveryAirport';

type OrderType = 'dine_in' | 'delivery' | 'pickup';
type PaymentType = 'cash' | 'card';

const orderStatus = new OrderStatus();

export default function OrderDetailsSidebar({
  isOpen,
  orderId,
  refresh,
  onClose,
  isValidating,
}: {
  isOpen: boolean;
  orderId: number;
  refresh: () => void;
  onClose: () => void;
  isValidating?: boolean;
}) {
  const { t } = useTranslation();
  const [status, setStatus] = React.useState<TOrderStatus>(orderStatus.getStatusDetails('quote_pending'));
  const [customerNote, setCustomerNote] = React.useState('');
  const [orderType, setOrderType] = React.useState<OrderType>();
  const [paymentType, setPaymentType] = React.useState<PaymentType>();
  const [paymentStatus, setPaymentStatus] = React.useState<string>('unpaid');
  const [customer, setCustomer] = React.useState<boolean>();
  const [deliveryDate, setDeliveryDate] = React.useState('');
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [charges, setCharges] = React.useState<Charge[]>([]);
  const [calculatedDiscount, setCalculatedDiscount] = React.useState(0);
  const [discount, setDiscount] = React.useState<{
    type: 'percentage' | 'amount';
    value: number;
    show: boolean;
  }>({
    type: 'amount',
    value: 0,
    show: false,
  });

  const {
    props: { branding },
  } = usePage() as { props: PageProps };

  const windowSize = useWindowSize();

  const {
    data: orderItem,
    isLoading,
    mutate,
  } = useSWR(() => (orderId ? `/api/orders/${orderId}` : null), fetcher);

  React.useEffect(() => {
    mutate();
  }, [isValidating]);

  React.useEffect(() => {
    const POSCharges: Charge[] = [];
    orderItem?.orderCharges?.forEach((charge: Charge) => {
      let totalCharge = 0;
      totalCharge += charge.amount;
      const chargeIndex = POSCharges.findIndex((c) => c.name === charge.name);
      if (chargeIndex === -1) {
        POSCharges.push({ ...charge, amount: totalCharge });
      } else {
        POSCharges[chargeIndex].amount += totalCharge;
      }
    });
    setCharges(POSCharges);
  }, [orderItem]);

  const initStates = React.useCallback(() => {
    if (!isLoading && orderItem) {
      setDiscount({
        show: false,
        type: 'amount',
        value: orderItem.manualDiscount,
      });
      setCalculatedDiscount(orderItem.manualDiscount);
      setStatus(orderStatus.getStatusDetails(orderItem.status));
      setOrderType(orderItem.type);
      setCustomerNote(orderItem.customerNote ?? '');
      setPaymentType(orderItem.paymentType);
      setDeliveryDate(new Date(orderItem.deliveryDate).toISOString().split('T')[0]);
      setPaymentStatus(orderItem.paymentStatus);
      setCustomer(orderItem.user?.fullName || "-");
    }
  }, [orderItem, isLoading]);

  React.useEffect(() => {
    initStates();
  }, [initStates]);

  const updateOrder = async (orderItem: any) => {
    if (
      orderItem.type === 'delivery' &&
      (status.value === 'completed') &&
      !orderItem.deliveryManId
    ) {
      toast.error(t('Select delivery person first'));
      return;
    }

    const formattedData = {
      userId: orderItem.userId,
      type: orderType,
      manualDiscount: calculatedDiscount,
      discountType: discount.type,
      paymentType: paymentType,
      customerNote: customerNote,
      paymentStatus: paymentStatus,
      deliveryDate: deliveryDate,
      status: status.value,
    };

    setIsUpdating(true);

    try {
      const { data } = await axios.put(`/api/orders/${orderItem.id}`, formattedData);

      if (data?.content?.id) {
        refresh();
        mutate();
        toast.success(t('Order updated successfully'));
      }
    } catch (e) {
      toast.error(t(e.response.data.message) || t('Something went wrong'));
    } finally {
      setIsUpdating(false);
    }
  };

  const content = (
    <div className="relative w-full grid grid-rows-[1fr,9rem] h-screen lg:h-[calc(100vh-76px)] bg-white border-l border-black/10">
      {match({ orderItem, isLoading })
        .with({ isLoading: true }, () => (
          <HStack justify="center" height="200px">
            <Spinner size="sm" />
            <Text className="text-secondary-500">{t('Loading...')}</Text>
          </HStack>
        ))

        .with({ orderItem: null, isLoading: false }, () => (
          <Text className="py-6 px-4 text-secondary-500">{t('Order not found')}</Text>
        ))

        .otherwise(({ orderItem }) => (
          <>
            <div className="px-4 py-6 pb-6 flex-1 lg:h-[calc(100vh-220px)] overflow-y-auto">
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

                    {status.value === 'quote_pending' ? (
                      <Menu>
                        <MenuButton
                          as={Button}
                          variant="outline"
                          rightIcon={<ArrowDown2 />}
                          onClick={(e) => e.stopPropagation()}
                          isDisabled={orderItem?.userId === null}
                        >
                          {t(startCase(orderType))}
                        </MenuButton>
                        <MenuList className="p-1">
                          {['delivery'].map(
                            (item) =>
                              Boolean(
                                branding?.business?.[item as keyof (typeof branding)['business']]
                              ) && (
                                <MenuItem
                                  key={item}
                                  onClick={() => setOrderType(item as OrderType)}
                                >
                                  {t(startCase(item))}
                                </MenuItem>
                              )
                          )}
                        </MenuList>
                      </Menu>
                    ) : (
                      <Box className="w-fit border border-secondary-200 px-4 py-2 rounded-md h-10">
                        {t(startCase(orderType))}
                      </Box>
                    )}
                  </div>

                  {/* Order Status */}
                  <div className="md:w-fit flex flex-col gap-1 pb-[30px] border-b border-black/5">
                    <Text className="text-base font-normal text-secondary-400">{t('Status')}</Text>

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
                              <MenuItem key={index} color={s.fgColor} onClick={() => setStatus(s)}>
                                {t(s.label)}
                              </MenuItem>
                            )
                        )}
                      </MenuList>
                    </Menu>
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

                    <Menu>
                      <MenuButton
                        as={Button}
                        variant="outline"
                        rightIcon={<ArrowDown2 />}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {t(startCase(paymentType))}
                      </MenuButton>
                      <MenuList>
                        {['cash', 'card'].map((item) => (
                          <MenuItem key={item} onClick={() => setPaymentType(item as PaymentType)}>
                            {t(startCase(item))}
                          </MenuItem>
                        ))}
                      </MenuList>
                    </Menu>
                  </div>

                  {/* Payment Status */}
                  <div className="flex flex-col gap-1">
                    <Text className="text-base font-normal text-secondary-400">
                      {t('Payment status')}
                    </Text>
                    <Flex
                      justifyContent="space-between"
                      alignItems="center"
                      className="text-secondary-600 text-xl font-semibold"
                    >
                      <Select
                        value={paymentStatus}
                        onChange={(e) => {
                          setPaymentStatus(e.target.value)
                        }}
                        size="md"
                        width="auto"
                        className="bg-white"
                      >
                        <option value="unpaid">{t('Unpaid')}</option>
                        <option value="payment_requested">{t('Payment Requested')}</option>
                        <option value="paid">{t('Paid')}</option>
                      </Select>
                    </Flex>
                  </div>

                  {/* Customer */}
                  <div className='col-span-2'>
                    <span className='font-medium text-[#A0AEC0]'>
                      Client
                    </span>
                    <div className='flex items-center mt-1 p-2 px-4 w-full rounded-[6px] border border-solid border-[1px] border-orange-300 text-orange-800'>
                      <Icon as={User} size="sm" className='mr-2' />
                      {customer}
                    </div>
                  </div>

                  {/* Delivery person */}
                  {orderItem?.type === 'delivery' && (
                    <>
                      <div className="col-span-2">
                        <div className="flex flex-col gap-1">
                          <Text className="text-base font-normal text-secondary-400">
                            {t('Caterer')}
                          </Text>

                          <UpdateDeliveryPerson
                            deliveryPerson={orderItem?.deliveryMan}
                            status={orderItem.status}
                            orderId={orderItem?.id}
                            refresh={refresh}
                          />
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="flex flex-col gap-1">
                          <Text className="text-base font-normal text-secondary-400">
                            {t('Delivery Airport')}
                          </Text>

                          <UpdateDeliveryAirport
                            airport={orderItem?.deliveryAirport}
                            orderId={orderItem?.id}
                            status={orderItem.status}
                            refresh={refresh}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Divider className="border-black/5" />

              {/* User note */}
              <div className="mt-3 mb-4">
                <div className="flex flex-col space-y-2">
                  <Text className="text-base font-normal text-secondary-400">
                    {t('Order note')}
                  </Text>
                  {status.value !== 'quote_pending' ? (
                    <Text>
                      {customerNote || <span className="text-secondary-500"> {t('Empty')}</span>}
                    </Text>
                  ) : (
                    <Textarea
                      value={customerNote}
                      onChange={(e) => setCustomerNote(e.target.value)}
                      placeholder={t('Write customer note')}
                    />
                  )}
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
                {charges?.map((charge: any) => (
                  <div key={charge.id} className="grid grid-cols-[1fr,150px] text-lg">
                    <div>{charge?.name}: </div>
                    <h4 className="font-medium text-right">
                      {convertToCurrencyFormat(charge?.amount)}
                    </h4>
                  </div>
                ))}

                {orderItem?.type === 'delivery' && (
                  <div className="grid grid-cols-[1fr,150px] text-lg">
                    <div> {t('Delivery charge')}: </div>
                    <h4 className="font-medium text-right">
                      {convertToCurrencyFormat(orderItem?.deliveryCharge)}
                    </h4>
                  </div>
                )}

                {/* Service charge */}
                <div className="grid grid-cols-[1fr,150px] text-lg">
                  <div> {t('Discount')}: </div>
                  <h4 className="font-medium text-right">
                    - {convertToCurrencyFormat(orderItem?.discount)}
                  </h4>
                </div>

                {/* Discount */}
                <Box
                  as="div"
                  className="grid grid-cols-[1fr,100px] border-b py-1.5 border-black/5 text-lg"
                >
                  <Box className="flex flex-wrap @xs:flex-nowrap items-center gap-3">
                    {t('Extra Discount')}:
                    {!discount.show && (
                      <Button
                        size="sm"
                        className="px-3"
                        onClick={() => setDiscount({ ...discount, show: true })}
                      >
                        {t(discount.value === 0 ? t('Add Discount') : t('Edit Discount'))}
                      </Button>
                    )}
                    {discount.show && (
                      <Button
                        size="sm"
                        className="px-3"
                        onClick={() => {
                          setDiscount({ ...discount, value: 0, show: false });
                        }}
                      >
                        {t('Remove Discount')}
                      </Button>
                    )}
                  </Box>
                  <Text fontWeight={500} textAlign="right">
                    - {convertToCurrencyFormat(calculatedDiscount)}
                  </Text>
                </Box>
                {discount.show && (
                  <Box as="div" className="grid grid-cols-[1fr,100px] gap-4 pt-2">
                    <HStack className="flex gap-3">
                      <HStack>
                        <DiscountTypeRadioGroup
                          onChange={(value) =>
                            setDiscount((prev) => ({
                              ...prev,
                              type: value as 'amount' | 'percentage',
                            }))
                          }
                        />
                      </HStack>
                      <Input
                        type="number"
                        value={discount.value}
                        onChange={(e) =>
                          setDiscount((prev) => ({ ...prev, value: +e.target.value }))
                        }
                        placeholder={t('Add discount')}
                        onFocus={(e) => e.target.select()}
                      />
                    </HStack>
                    <Button
                      variant="outline"
                      colorScheme="blue"
                      type="button"
                      onClick={() => {
                        setDiscount((prev) => ({ ...prev, show: false }));
                        if (discount.type === 'percentage') {
                          setCalculatedDiscount(orderItem.total * discount.value * 0.01);
                        } else setCalculatedDiscount(discount.value);
                      }}
                    >
                      {t('Update')}
                    </Button>
                  </Box>
                )}
              </div>
            </div >

            {/* Footer actions */}
            < Box
              px="4"
              pt="2"
              pb="4"
              shadow="0px 1px 2px 0px rgba(0, 0, 0, 0.06),0px -1px 3px 0px rgba(0, 0, 0, 0.1)"
              className="absolute w-full h-36 bottom-0 bg-white z-10 flex flex-col justify-center gap-5"
            >
              <div className="grid grid-cols-[1fr,150px] text-lg px-4">
                <div> {t('Grand total')}: </div>
                <h4 className="font-bold text-right">
                  {convertToCurrencyFormat(
                    orderItem?.grandTotal - (calculatedDiscount - orderItem.manualDiscount)
                  )}
                </h4>
              </div>
              <Divider className="border-black/5" />

              <HStack className="w-full gap-2 px-4">
                <Button onClick={onClose} variant="outline" className="flex-1">
                  {t('Close')}
                </Button>
                <PrintInvoice orderId={orderItem.id} />
                <Button
                  type="button"
                  onClick={() => updateOrder(orderItem)}
                  colorScheme="blue"
                  className="flex-1"
                  isLoading={isUpdating}
                >
                  {t('Update')}
                </Button>
              </HStack>
            </Box>
          </>
        ))
      }
    </div >
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
