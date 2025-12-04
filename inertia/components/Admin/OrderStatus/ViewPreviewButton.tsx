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
  Badge,
  Flex,
  Divider,
  Textarea,
  HStack,
  Spinner,
  Box,
  Input,
  useDisclosure,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerBody,
  DrawerFooter,
  Select,
  IconButton,
} from '@chakra-ui/react';
import { ArrowDown2, Eye, Add, Trash } from 'iconsax-react';
import { POSItemModal } from '../POS/POSItemModal';
import fetcher from '@/lib/fetcher';
import { startCase } from '@/utils/string_formatter';
import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import { toast } from 'sonner';
import PrintInvoice from '@/components/common/PrintInvoice';
import { OrderStatus, TOrderStatus } from '@/utils/order_status';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import DiscountTypeRadioGroup from '../POS/DiscountTypeSelect';
import UpdateDeliveryPerson from '../ActiveOrders/UpdateDeliveryPerson';
import UpdateDeliveryAirport from '../ActiveOrders/UpdateDeliveryAirport';
import { POSItem } from '@/types/pos_type';

const orderStatus = new OrderStatus();

type OrderType = 'dine_in' | 'delivery' | 'pickup';
type PaymentType = 'card' | 'ach' | 'paypal' | 'stripe';
type PaymentStatus = 'unpaid' | 'payment_requested' | 'paid';

interface OrderItem {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  total: number;
  subTotal: number;
  discount?: number;
  discountType?: 'amount' | 'percentage';
  image?: {
    url: string;
  };
  addons?: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    image?: {
      url: string;
    };
  }>;
  variants?: Array<{
    id: number;
    name: string;
    price?: number;
    option: Array<{
      id: number;
      name: string;
      price: number;
      variantId: number;
    }>;
  }>;
}

interface Order {
  id: number;
  orderNumber: string;
  type: OrderType;
  status: string;
  paymentType: PaymentType;
  paymentStatus: PaymentStatus;
  userId: number;
  deliveryDate: string;
  deliveryTime: string;
  total: number;
  grandTotal: number;
  manualDiscount: number;
  totalTax: number;
  totalCharges: number;
  deliveryCharge: number;
  customerNote?: string;
  tailNumber?: string;
  dietaryRes?: string;
  packagingNote?: string;
  reheatMethod?: string;
  priority?: string;
  deliveryAirport?: any;
  deliveryMan?: any;
  orderItems?: OrderItem[];
}

// Order details sidebar component
export default function OrderPreviewButton({
  orderId,
  refresh,
}: {
  orderId: number;
  refresh: () => void;
}) {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<POSItem | null>(null);

  // Convert OrderItem to POSItem
  const convertToPOSItem = (item: OrderItem): POSItem => {
    return {
      id: item.id || 0,
      name: item.name || '',
      quantity: Number(item.quantity) || 1,
      price: Number(item.price) || 0,
      total: Number(item.total) || 0,
      subTotal: Number(item.total) || 0,
      description: item.description || '',
      discount: Number(item.discount) || 0,
      discountType: item.discountType || 'amount',
      addons: (item.addons || []).map(addon => ({
        ...addon,
        quantity: Number(addon.quantity) || 1,
        price: Number(addon.price) || 0,
        total: Number(addon.price * (Number(addon.quantity) || 1)) || 0,
        image: addon.image ? { ...addon.image } : { url: '' }
      })),
      variants: (item.variants || []).map(variant => ({
        ...variant,
        price: Number(variant.price) || 0,
        option: (variant.option || []).map(opt => ({
          ...opt,
          price: Number(opt.price) || 0
        }))
      })),
      image: item.image ? { ...item.image } : { url: '' },
    };
  };
  const [status, setStatus] = React.useState<TOrderStatus>(orderStatus.getStatusDetails('quote_pending'));
  const [tailNumber, setTailNumber] = React.useState('');
  const [customerNote, setCustomerNote] = React.useState('');
  const [dietaryRes, setDietaryRes] = React.useState('');
  const [packagingNote, setPackagingNote] = React.useState('');
  const [reheatMethod, setReheatMethod] = React.useState('');
  const [priority, setPriority] = React.useState('');
  const [orderType, setOrderType] = React.useState<OrderType>();
  const [paymentType, setPaymentType] = React.useState<PaymentType>();
  const [paymentStatus, setPaymentStatus] = React.useState<string>('');
  const [deliveryDate, setDeliveryDate] = React.useState('');
  const [deliveryTime, setDeliveryTime] = React.useState('');
  const [isUpdating, setIsUpdating] = React.useState(false);
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

  const btnRef = React.useRef<HTMLButtonElement>(null);

  // fetch order data
  const {
    data: orderItem,
    isLoading,
    mutate,
  } = useSWR(() => (orderId && isOpen ? `/api/orders/${orderId}` : null), fetcher);

  // Initialize states function
  const initStates = React.useCallback(() => {
    if (!isLoading && orderItem) {
      setDiscount({
        show: false,
        type: 'amount',
        value: orderItem.manualDiscount,
      });
      setCalculatedDiscount(orderItem.manualDiscount);
      setStatus(orderStatus.getStatusDetails(orderItem.status)!);
      setOrderType(orderItem.type);
      setTailNumber(orderItem.tailNumber ?? '');
      setCustomerNote(orderItem.customerNote ?? '');
      setDietaryRes(orderItem.dietaryRes ?? '');
      setPackagingNote(orderItem.packagingNote ?? '');
      setReheatMethod(orderItem.reheatMethod);
      setPriority(orderItem.priority);
      setPaymentType(orderItem.paymentType);
      setDeliveryDate(orderItem.deliveryDate);
      setDeliveryTime(orderItem.deliveryTime);
      setPaymentStatus(orderItem.paymentStatus);
    }
  }, [orderItem, isLoading]);

  // Initialize states
  React.useEffect(() => {
    initStates();
  }, [initStates]);

  // Update Order
  const updateOrder = async (orderItem: Order) => {
    const formattedData = {
      userId: orderItem.userId,
      type: orderType,
      manualDiscount: calculatedDiscount,
      discountType: discount.type,
      paymentType: paymentType,
      customerNote: customerNote,
      dietaryRes: dietaryRes,
      packagingNote: packagingNote,
      reheatMethod: reheatMethod,
      priority: priority,
      paymentStatus: paymentStatus as PaymentStatus,
      deliveryDate: deliveryDate,
      deliveryTime: deliveryTime,
      status: status.value,
      tailNumber: tailNumber,
    };

    setIsUpdating(true);

    try {
      const { data } = await axios.put(`/api/orders/${orderItem.id}`, formattedData);

      if (data?.content?.id) {
        toast.success(t('Order updated successfully'));
        await mutate(); // Refresh the order data
        refresh?.(); // Call parent refresh if provided
        onClose(); // Close the drawer after successful update
      }
    } catch (e: any) {
      toast.error(t(e.response?.data?.message) || t('Something went wrong'));
    } finally {
      setIsUpdating(false);
    }
  };

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'red.100';
      case 'high':
        return 'orange.100';
      case 'vip':
        return 'purple.100';
      case 'scheduled':
        return 'blue.100';
      case 'normal':
        return 'gray.100';
      default:
        return 'white';
    }
  };

  return (
    <>
      <Button
        onClick={onOpen}
        variant="outline"
        colorScheme="secondary"
        className="border-secondary-200 text-secondary-800 hover:bg-secondary-100 px-1"
      >
        <Eye />
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
        <DrawerContent className="@container">
          <DrawerBody className="p-0 px-4">
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
                        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
                          <Text as="h3" className="font-semibold text-2xl text-gray-800">
                            {t('Order Details')}
                          </Text>
                          <Badge
                            colorScheme={status?.fgColor === '#10B981' ? 'green' : status?.fgColor === '#F59E0B' ? 'yellow' : 'red'}
                            size="lg"
                            variant="subtle"
                            className="px-3 py-1"
                          >
                            {t(status?.label)}
                          </Badge>
                        </div>

                        {/* Order details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                          {/* Order Number */}
                          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <Text className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wide">
                              {t('Order Number')}
                            </Text>
                            <Text as="h3" className="text-gray-900 text-lg font-bold">
                              {orderItem?.orderNumber}
                            </Text>
                          </div>

                          {/* Order Type */}
                          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <Text className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
                              {t('Order Type')}
                            </Text>

                            <Menu matchWidth>
                              <MenuButton
                                as={Button}
                                variant="outline"
                                rightIcon={<ArrowDown2 />}
                                onClick={(e) => e.stopPropagation()}
                                className="text-left w-full justify-between"
                                size="sm"
                                borderColor="gray.300"
                                _hover={{ borderColor: "gray.400" }}
                                _focus={{ borderColor: "blue.500" }}
                              >
                                {t(startCase(orderType))}
                              </MenuButton>
                              <MenuList className="p-1 shadow-lg border border-gray-200">
                                {['dine_in', 'delivery', 'pickup'].map((item) => (
                                  <MenuItem
                                    key={item}
                                    isDisabled={Boolean(
                                      !branding?.business?.[
                                      item as keyof (typeof branding)['business']
                                      ]
                                    )}
                                    onClick={() => setOrderType(item as OrderType)}
                                    className="rounded-md"
                                    _hover={{ bg: "gray.100" }}
                                  >
                                    {t(startCase(item))}
                                  </MenuItem>
                                ))}
                              </MenuList>
                            </Menu>
                          </div>

                          {/* Order Status */}
                          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <Text className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
                              {t('Status')}
                            </Text>

                            <Menu matchWidth>
                              <MenuButton
                                as={Button}
                                variant="outline"
                                color={status?.fgColor}
                                borderColor={status?.fgColor}
                                rightIcon={<ArrowDown2 />}
                                onClick={(e) => e.stopPropagation()}
                                className="text-left w-full justify-between"
                                size="sm"
                                _hover={{ borderColor: status?.fgColor, opacity: 0.8 }}
                                _focus={{ borderColor: status?.fgColor }}
                              >
                                {t(status?.label)}
                              </MenuButton>
                              <MenuList className="p-1 shadow-lg border border-gray-200">
                                {orderStatus.all().map(
                                  (s) =>
                                    (!s.orderType || orderType === s.orderType) && (
                                      <MenuItem
                                        key={s.value}
                                        color={s.fgColor}
                                        onClick={() => setStatus(s)}
                                        className="rounded-md"
                                        _hover={{ bg: "gray.100" }}
                                      >
                                        {t(s.label)}
                                      </MenuItem>
                                    )
                                )}
                              </MenuList>
                            </Menu>
                          </div>

                          {/* Delivery date */}
                          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <Text className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wide">
                              {t('Delivery Date')}
                            </Text>
                            <Text as="h3" className="text-gray-900 text-lg font-semibold">
                              {new Date(orderItem?.deliveryDate).toLocaleDateString() ||
                                <span className="text-gray-400 text-sm">Not provided</span>
                              }
                            </Text>
                          </div>

                          {/* Payment method */}
                          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <Text className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
                              {t('Payment Method')}
                            </Text>

                            <Menu matchWidth>
                              <MenuButton
                                as={Button}
                                variant="outline"
                                rightIcon={<ArrowDown2 />}
                                onClick={(e) => e.stopPropagation()}
                                className="text-left w-full justify-between"
                                size="sm"
                                borderColor="gray.300"
                                _hover={{ borderColor: "gray.400" }}
                                _focus={{ borderColor: "blue.500" }}
                              >
                                {t(startCase(paymentType))}
                              </MenuButton>
                              <MenuList className="p-1 shadow-lg border border-gray-200">
                                {['card', 'ach'].map((item) => (
                                  <MenuItem
                                    key={item}
                                    onClick={() => setPaymentType(item as PaymentType)}
                                    className="rounded-md"
                                    _hover={{ bg: "gray.100" }}
                                  >
                                    {t(startCase(item))}
                                  </MenuItem>
                                ))}
                              </MenuList>
                            </Menu>
                          </div>

                          {/* Payment Status */}
                          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <Text className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
                              {t('Payment Status')}
                            </Text>
                            <Flex alignItems="center" gap={3}>
                              <Select
                                value={paymentStatus}
                                onChange={(e) => setPaymentStatus(e.target.value)}
                                size="sm"
                                flex="1"
                                className={`${paymentStatus === "paid"
                                    ? "bg-green-50 border-green-300 text-green-800"
                                    : paymentStatus === "payment_requested"
                                      ? "bg-blue-50 border-blue-300 text-blue-800"
                                      : "bg-red-50 border-red-300 text-red-800"
                                  } font-medium`}
                                borderRadius="md"
                                _focus={{ borderColor: "blue.500" }}
                              >
                                <option value="unpaid" className='text-gray-800 bg-white'>{t('Unpaid')}</option>
                                <option value="payment_requested" className='text-gray-800 bg-white'>{t('Payment Requested')}</option>
                                <option value="paid" className='text-gray-800 bg-white'>{t('Paid')}</option>
                              </Select>
                              <Badge
                                variant="solid"
                                colorScheme={paymentStatus === 'paid' ? 'green' : paymentStatus === 'payment_requested' ? 'blue' : 'red'}
                                size="sm"
                                className="px-3 py-1 rounded-full text-xs font-semibold"
                              >
                                {t(paymentStatus === 'paid' ? 'PAID' : paymentStatus === 'payment_requested' ? 'PAYMENT REQUESTED' : 'UNPAID')}
                              </Badge>
                            </Flex>
                          </div>

                        </div>
                      </div>

                      {orderItem?.type === 'delivery' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                          { /* Caterer */}
                          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <Text className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
                              {t('Caterer')}
                            </Text>

                            <UpdateDeliveryPerson
                              deliveryPerson={orderItem?.deliveryMan}
                              status={orderItem.status}
                              orderId={orderItem?.id}
                              refresh={refresh}
                            />
                          </div>

                          { /* Delivery Airport */}
                          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <Text className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
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
                      )}

                      <Divider className="border-gray-200 my-6" />

                      {/* Form Fields Section */}
                      <div className="space-y-4">
                        {/* Tail number */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <Text className="text-sm font-medium text-gray-700 mb-2">
                            {t('Aircraft Tail Number')}
                          </Text>
                          <Textarea
                            value={tailNumber}
                            rows={1}
                            onChange={(e) => setTailNumber(e.target.value)}
                            placeholder={t('Write tail number')}
                            borderColor="gray.300"
                            _hover={{ borderColor: "gray.400" }}
                            _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.6)" }}
                            bg="white"
                          />
                        </div>

                        {/* User note */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <Text className="text-sm font-medium text-gray-700 mb-2">
                            {t('Customer Note')}
                          </Text>
                          <Textarea
                            value={customerNote}
                            rows={2}
                            onChange={(e) => setCustomerNote(e.target.value)}
                            placeholder={t('Write client note')}
                            borderColor="gray.300"
                            _hover={{ borderColor: "gray.400" }}
                            _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.6)" }}
                            bg="white"
                          />
                        </div>

                        {/* Dietary Restrictions */}
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                          <Text className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
                            ⚠️ {t('Dietary Restrictions')}
                          </Text>
                          <Textarea
                            rows={2}
                            placeholder={t('Allergies, dietary restrictions, special requirements')}
                            value={dietaryRes}
                            onChange={(e) => setDietaryRes(e.target.value)}
                            borderColor="red.300"
                            _hover={{ borderColor: "red.400" }}
                            _focus={{ borderColor: "red.500", boxShadow: "0 0 0 1px rgba(239, 68, 68, 0.6)" }}
                            bg="white"
                            _placeholder={{ color: "red.600" }}
                          />
                        </div>

                        {/* Packaging note */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <Text className="text-sm font-medium text-gray-700 mb-2">
                            {t('Packaging Instructions')}
                          </Text>
                          <Textarea
                            value={packagingNote}
                            rows={2}
                            onChange={(e) => setPackagingNote(e.target.value)}
                            placeholder={t('Write packaging note')}
                            borderColor="gray.300"
                            _hover={{ borderColor: "gray.400" }}
                            _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.6)" }}
                            bg="white"
                          />
                        </div>
                      </div>

                      <Divider className="border-gray-200 my-6" />

                      {/* Settings Section */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                        {/* Reheat method selection */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <Text className="text-sm font-medium text-blue-700 mb-2">
                            {t('Reheating Instructions')}
                          </Text>
                          <Select
                            placeholder={t('Select reheat method')}
                            value={reheatMethod}
                            onChange={(e) => setReheatMethod(e.target.value)}
                            borderColor="blue.300"
                            _hover={{ borderColor: "blue.400" }}
                            _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px rgba(59, 130, 246, 0.6)" }}
                            bg="white"
                            size="sm"
                          >
                            <option value="microwave_lid_open">📡 {t('Microwave (with lid slightly open)')}</option>
                            <option value="microwave_no_lid">📡 {t('Microwave (remove lid entirely)')}</option>
                            <option value="oven_180">🔥 {t('Oven (180°C / 350°F for 10 min)')}</option>
                            <option value="air_fryer">🍟 {t('Air Fryer (180°C / 350°F for 5 min)')}</option>
                            <option value="pan_fry">🍳 {t('Stovetop - Pan/Skillet')}</option>
                            <option value="boil_bag">🥣 {t('Boil-in-Bag (sealed pouch in boiling water)')}</option>
                            <option value="steam">💨 {t('Steam for 5–7 minutes')}</option>
                            <option value="grill">♨️ {t('Grill or Salamander (quick high-heat)')}</option>
                            <option value="sous_vide">🫧 {t('Sous Vide (if vacuum-sealed)')}</option>
                            <option value="cold_no_reheat">❄️ {t('No Reheating Required (served cold)')}</option>
                            <option value="not_suitable">🚫 {t('Not Suitable for Reheating')}</option>
                          </Select>
                        </div>

                        {/* Priority selection */}
                        <div className={`p-4 rounded-lg border ${getPriorityBg(priority) === 'red.100' ? 'bg-red-50 border-red-200' :
                          getPriorityBg(priority) === 'orange.100' ? 'bg-orange-50 border-orange-200' :
                            getPriorityBg(priority) === 'purple.100' ? 'bg-purple-50 border-purple-200' :
                              getPriorityBg(priority) === 'blue.100' ? 'bg-blue-50 border-blue-200' :
                                'bg-gray-50 border-gray-200'}`}>
                          <Text className={`text-sm font-medium mb-2 ${getPriorityBg(priority) === 'red.100' ? 'text-red-700' :
                              getPriorityBg(priority) === 'orange.100' ? 'text-orange-700' :
                                getPriorityBg(priority) === 'purple.100' ? 'text-purple-700' :
                                  getPriorityBg(priority) === 'blue.100' ? 'text-blue-700' :
                                    'text-gray-700'
                            }`}>
                            {t('Order Priority')}
                          </Text>
                          <Select
                            placeholder={t('Select Priority')}
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            bg={getPriorityBg(priority)}
                            borderColor={getPriorityBg(priority) === 'red.100' ? 'red.300' :
                              getPriorityBg(priority) === 'orange.100' ? 'orange.300' :
                                getPriorityBg(priority) === 'purple.100' ? 'purple.300' :
                                  getPriorityBg(priority) === 'blue.100' ? 'blue.300' :
                                    'gray.300'}
                            _hover={{
                              borderColor: getPriorityBg(priority) === 'red.100' ? 'red.400' :
                                getPriorityBg(priority) === 'orange.100' ? 'orange.400' :
                                  getPriorityBg(priority) === 'purple.100' ? 'purple.400' :
                                    getPriorityBg(priority) === 'blue.100' ? 'blue.400' :
                                      'gray.400'
                            }}
                            _focus={{
                              borderColor: getPriorityBg(priority) === 'red.100' ? 'red.500' :
                                getPriorityBg(priority) === 'orange.100' ? 'orange.500' :
                                  getPriorityBg(priority) === 'purple.100' ? 'purple.500' :
                                    getPriorityBg(priority) === 'blue.100' ? 'blue.500' :
                                      'gray.500'
                            }}
                            size="sm"
                          >
                            <option value="normal">✅ {t('Normal')}</option>
                            <option value="high">⚠️ {t('High')}</option>
                            <option value="urgent">🔥 {t('Urgent')}</option>
                            <option value="scheduled">⏰ {t('Scheduled')}</option>
                            <option value="vip">👑 {t('VIP')}</option>
                          </Select>
                        </div>
                      </div>

                      {/* Order items */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <Text className="text-lg font-semibold text-gray-800">
                            {t('Order Items')}
                          </Text>
                          <Badge variant="outline" colorScheme="blue" size="sm">
                            {orderItem?.orderItems?.length || 0} {t('items')}
                          </Badge>
                        </div>

                        {orderItem?.orderItems === 0 ? (
                          <div className='bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6'>
                            <div className="flex items-center justify-between">
                              <div className="text-center flex-1">
                                <Text color="gray.500" fontSize="sm" mb={2}>
                                  {t('No items added yet')}
                                </Text>
                                <Text color="gray.400" fontSize="xs">
                                  {t('Click the + button to add items')}
                                </Text>
                              </div>
                              <Button
                                onClick={() => setIsModalOpen(true)}
                                size="sm"
                                colorScheme="blue"
                                variant="outline"
                                leftIcon={<Add size={16} color="currentColor" />}
                              >
                                {t('Add Item')}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className='bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden'>
                            {orderItem?.orderItems?.map((item: OrderItem, index: number) => (
                              <div key={item.id}>
                                <Flex
                                  align="center"
                                  justify="space-between"
                                  py={4}
                                  px={4}
                                  _hover={{ bg: 'gray.50' }}
                                  cursor="pointer"
                                  onClick={() => {
                                    setEditingItem(convertToPOSItem(item));
                                    setIsModalOpen(true);
                                  }}
                                  className="transition-colors duration-200"
                                >
                                  <Box flex="1">
                                    <Text fontWeight="semibold" fontSize="md" color="gray.800" mb={1}>
                                      {item.name}
                                    </Text>
                                    <HStack spacing={4} fontSize="sm" color="gray.600">
                                      <Text>
                                        <strong>{t('Qty')}:</strong> {item.quantity}
                                      </Text>
                                      <Text>
                                        <strong>{t('Price')}:</strong> {convertToCurrencyFormat(item.price ?? 0)}
                                      </Text>
                                      {item.discount && (
                                        <Badge colorScheme="green" size="sm">
                                          {item.discountType === 'percentage'
                                            ? `${item.discount}% off`
                                            : `${convertToCurrencyFormat(item.discount)} off`}
                                        </Badge>
                                      )}
                                    </HStack>
                                  </Box>
                                  <HStack spacing={3}>
                                    <Text fontWeight="bold" fontSize="lg" color="gray.900">
                                      {convertToCurrencyFormat(item.total ?? 0)}
                                    </Text>
                                    <IconButton
                                      icon={<Trash size={16} />}
                                      aria-label="delete"
                                      size="sm"
                                      colorScheme="red"
                                      variant="ghost"
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        if (orderItem) {
                                          try {
                                            const updatedItems = orderItem.orderItems.filter((i: OrderItem) => i.id !== item.id);

                                            // Update order with new items through API
                                            const formattedData = {
                                              userId: orderItem.userId,
                                              type: orderType,
                                              manualDiscount: calculatedDiscount,
                                              discountType: discount.type,
                                              paymentType: paymentType,
                                              customerNote: customerNote,
                                              dietaryRes: dietaryRes,
                                              packagingNote: packagingNote,
                                              reheatMethod: reheatMethod,
                                              priority: priority,
                                              paymentStatus: paymentStatus as PaymentStatus,
                                              deliveryDate: deliveryDate || new Date().toISOString().split('T')[0],
                                              deliveryTime: deliveryTime,
                                              status: status.value,
                                              tailNumber: tailNumber,
                                              orderItems: updatedItems
                                            };

                                            await axios.put(`/api/orders/${orderItem.id}`, formattedData);
                                            await mutate();
                                            toast.success(t('Item removed successfully'));
                                          } catch (error) {
                                            toast.error(t('Failed to remove item'));
                                            console.error('Error removing item:', error);
                                          }
                                        }
                                      }}
                                    />
                                  </HStack>
                                </Flex>
                                {index < (orderItem?.orderItems?.length || 0) - 1 && (
                                  <Divider borderColor="gray.200" />
                                )}
                              </div>
                            ))}
                            <div className="p-4 bg-gray-50 border-t border-gray-200">
                              <Button
                                onClick={() => setIsModalOpen(true)}
                                size="sm"
                                variant="outline"
                                colorScheme="blue"
                                leftIcon={<Add size={16} color="currentColor" />}
                                width="full"
                              >
                                {t('Add Another Item')}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Item Edit Modal */}
                      <POSItemModal
                        isOpen={isModalOpen}
                        onClose={() => {
                          setIsModalOpen(false);
                        }}
                        initialItem={editingItem}
                        onSave={async (updatedItem: POSItem) => {
                          if (orderItem) {
                            try {
                              let updatedItems;
                              if (editingItem) {
                                // Update existing item
                                updatedItems = orderItem.orderItems.map((item: OrderItem) =>
                                  item.id === editingItem.id ? {
                                    ...item,
                                    name: updatedItem.name,
                                    description: updatedItem.description,
                                    price: updatedItem.price,
                                    quantity: updatedItem.quantity,
                                    total: updatedItem.total,
                                    discount: updatedItem.discount,
                                    discountType: updatedItem.discountType,
                                    addons: updatedItem.addons,
                                    variants: updatedItem.variants,
                                    image: updatedItem.image,
                                  } : item
                                );
                              } else {
                                // Add new item
                                updatedItems = [...(orderItem.orderItems || []), {
                                  ...updatedItem,
                                  id: Date.now(), // Ensure unique ID for new items
                                }];
                              }

                              // Update order with new items through API
                              const formattedData = {
                                userId: orderItem.userId,
                                type: orderType,
                                manualDiscount: calculatedDiscount,
                                discountType: discount.type,
                                paymentType: paymentType,
                                customerNote: customerNote,
                                dietaryRes: dietaryRes,
                                packagingNote: packagingNote,
                                reheatMethod: reheatMethod,
                                priority: priority,
                                paymentStatus: paymentStatus as PaymentStatus,
                                deliveryDate: deliveryDate || new Date().toISOString().split('T')[0],
                                deliveryTime: deliveryTime,
                                status: status.value,
                                tailNumber: tailNumber,
                                orderItems: updatedItems
                              };

                              await axios.put(`/api/orders/${orderItem.id}`, formattedData);

                              // Refresh the order data
                              await mutate();
                              toast.success(t('Item updated successfully'));
                            } catch (error) {
                              toast.error(t('Failed to update item'));
                              console.error('Error updating item:', error);
                            }
                          }
                          setIsModalOpen(false);
                          setEditingItem(null);
                        }}
                      />

                      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                          <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                            {t('Order Summary')}
                          </Text>
                        </div>

                        <div className="p-4 space-y-3">
                          {/* Items Total */}
                          <div className="flex justify-between items-center text-base">
                            <Text color="gray.600"> {t('Items Total')}: </Text>
                            <Text fontWeight="semibold" color="gray.800">
                              {convertToCurrencyFormat(orderItem?.orderItems?.reduce((sum: number, item: OrderItem) =>
                                sum + (item.price * item.quantity), 0) || 0)}
                            </Text>
                          </div>

                          {/* Addons Total */}
                          {orderItem?.orderItems?.some((item: OrderItem) => item.addons && item.addons.length > 0) && (
                            <div className="flex justify-between items-center text-base">
                              <Text color="gray.600"> {t('Addons')}: </Text>
                              <Text fontWeight="semibold" color="gray.800">
                                {convertToCurrencyFormat(orderItem?.orderItems?.reduce((sum: number, item: OrderItem) =>
                                  sum + (item.addons?.reduce((addonSum: number, addon) =>
                                    addonSum + (addon.price * addon.quantity), 0) || 0), 0))}
                              </Text>
                            </div>
                          )}

                          {/* Variants Total */}
                          {orderItem?.orderItems?.some((item: OrderItem) => item.variants && item.variants.length > 0) && (
                            <div className="flex justify-between items-center text-base">
                              <Text color="gray.600"> {t('Variants')}: </Text>
                              <Text fontWeight="semibold" color="gray.800">
                                {convertToCurrencyFormat(orderItem?.orderItems?.reduce((sum: number, item: OrderItem) =>
                                  sum + (item.variants?.reduce((varSum: number, variant) =>
                                    varSum + (variant.option?.reduce((optSum: number, opt) =>
                                      optSum + opt.price, 0) || 0), 0) || 0), 0))}
                              </Text>
                            </div>
                          )}

                          <Divider borderColor="gray.200" />

                          {/* Subtotal */}
                          <div className="flex justify-between items-center text-lg font-medium">
                            <Text color="gray.700"> {t('Subtotal')}: </Text>
                            <Text fontWeight="bold" color="gray.900">
                              {convertToCurrencyFormat(orderItem?.total)}
                            </Text>
                          </div>

                          {/* Item Discounts */}
                          {orderItem?.orderItems?.some((item: OrderItem) => item.discount) && (
                            <div className="flex justify-between items-center text-base text-red-600">
                              <Text> {t('Item Discounts')}: </Text>
                              <Text fontWeight="semibold">
                                -{convertToCurrencyFormat(orderItem?.orderItems?.reduce((sum: number, item: OrderItem) => {
                                  if (!item.discount) return sum;
                                  const itemTotal = item.price * item.quantity;
                                  return sum + (item.discountType === 'percentage'
                                    ? (itemTotal * (item.discount || 0) / 100)
                                    : (item.discount || 0));
                                }, 0))}
                              </Text>
                            </div>
                          )}

                          {/* Service charge */}
                          <div className="flex justify-between items-center text-base">
                            <Text color="gray.600"> {t('Service Charge')}: </Text>
                            <Text fontWeight="semibold" color="gray.800">
                              {convertToCurrencyFormat(orderItem?.totalCharges)}
                            </Text>
                          </div>

                          {/* Discount */}
                          <div className="flex justify-between items-center text-base">
                            <div className="flex items-center gap-3">
                              <Text color="gray.600">{t('Extra Discount')}:</Text>
                              {!discount.show && (
                                <Button
                                  size="xs"
                                  variant="outline"
                                  colorScheme="blue"
                                  onClick={() => setDiscount({ ...discount, show: true })}
                                >
                                  {t(discount.value === 0 ? 'Add' : 'Edit')}
                                </Button>
                              )}
                              {discount.show && (
                                <Button
                                  size="xs"
                                  variant="outline"
                                  colorScheme="red"
                                  onClick={() => {
                                    setDiscount({ ...discount, value: 0, show: false });
                                  }}
                                >
                                  {t('Remove')}
                                </Button>
                              )}
                            </div>
                            <Text fontWeight="semibold" color="red.600">
                              - {convertToCurrencyFormat(calculatedDiscount)}
                            </Text>
                          </div>

                          {discount.show && (
                            <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                              <HStack spacing={3} mb={3}>
                                <DiscountTypeRadioGroup
                                  onChange={(value) =>
                                    setDiscount((prev) => ({
                                      ...prev,
                                      type: value as 'amount' | 'percentage',
                                    }))
                                  }
                                />
                                <Input
                                  type="number"
                                  min={0}
                                  max={discount.type === 'percentage' ? 100 : orderItem?.total}
                                  value={discount.value}
                                  onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    if (isNaN(value) || value < 0) return;
                                    if (discount.type === 'percentage' && value > 100) return;
                                    if (discount.type === 'amount' && value > (orderItem?.total || 0)) return;
                                    setDiscount((prev) => ({ ...prev, value }));
                                  }}
                                  placeholder={t('Add discount')}
                                  onFocus={(e) => e.target.select()}
                                  size="sm"
                                  bg="white"
                                />
                              </HStack>
                              <Button
                                variant="solid"
                                colorScheme="blue"
                                size="sm"
                                width="full"
                                onClick={() => {
                                  const newDiscount = discount.type === 'percentage'
                                    ? (orderItem?.total || 0) * (discount.value / 100)
                                    : discount.value;

                                  if (newDiscount > (orderItem?.total || 0)) {
                                    toast.error(t('Discount cannot be greater than total amount'));
                                    return;
                                  }

                                  setDiscount((prev) => ({ ...prev, show: false }));
                                  setCalculatedDiscount(newDiscount);
                                }}
                              >
                                {t('Apply Discount')}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Delivery date and time */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <Text className="text-sm font-medium text-green-700 mb-2">
                            {t('Delivery Date')}
                          </Text>
                          <Input
                            type="date"
                            value={deliveryDate}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => {
                              const selectedDate = new Date(e.target.value);
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);

                              if (selectedDate < today) {
                                toast.error(t('Cannot select a past date'));
                                return;
                              }
                              setDeliveryDate(e.target.value);
                            }}
                            borderColor="green.300"
                            _hover={{ borderColor: "green.400" }}
                            _focus={{ borderColor: "green.500", boxShadow: "0 0 0 1px rgba(34, 197, 94, 0.6)" }}
                            bg="white"
                            size="sm"
                          />
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <Text className="text-sm font-medium text-green-700 mb-2">
                            {t('Delivery Time')} (24h)
                          </Text>
                          <Input
                            type="time"
                            value={deliveryTime}
                            onChange={(e) => {
                              const now = new Date();
                              const selectedDate = new Date(deliveryDate);
                              const [hours, minutes] = e.target.value.split(':');
                              selectedDate.setHours(parseInt(hours), parseInt(minutes));

                              if (selectedDate.getTime() < now.getTime() && deliveryDate === now.toISOString().split('T')[0]) {
                                toast.error(t('Cannot select a past time for today'));
                                return;
                              }
                              setDeliveryTime(e.target.value);
                            }}
                            borderColor="green.300"
                            _hover={{ borderColor: "green.400" }}
                            _focus={{ borderColor: "green.500", boxShadow: "0 0 0 1px rgba(34, 197, 94, 0.6)" }}
                            bg="white"
                            size="sm"
                          />
                        </div>
                      </div>
                    </div >
                  </>
                ))}
            </div >
          </DrawerBody>

          <DrawerFooter className="p-0 bg-white border-t border-gray-200">
            {/* Footer actions */}
            <Box
              pt="4"
              pb="4"
              className="w-full bg-white z-10 flex flex-col gap-4 px-6"
            >
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                <div className="flex justify-between items-center">
                  <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                    {t('Grand Total')}:
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="green.600">
                    {convertToCurrencyFormat(orderItem?.grandTotal)}
                  </Text>
                </div>
              </div>

              <HStack spacing={3} className="w-full">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                  borderColor="gray.300"
                  _hover={{ borderColor: "gray.400", bg: "gray.50" }}
                >
                  {t('Close')}
                </Button>

                <PrintInvoice orderId={orderItem?.id} />

                <Button
                  type="button"
                  onClick={() => updateOrder(orderItem)}
                  colorScheme="blue"
                  className="flex-1"
                  isLoading={isUpdating}
                  loadingText={t('Updating...')}
                >
                  {t('Update Order')}
                </Button>
              </HStack>
            </Box>
          </DrawerFooter>
        </DrawerContent>
      </Drawer >
    </>
  );
}
