import useDebounce from '@/hooks/useDebounce';
import { OrderStatus, TOrderStatus } from '@/utils/order_status';
import { startCase } from '@/utils/string_formatter';
import {
  Box,
  Button,
  HStack,
  Input,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Spinner,
  Select,
  Text,
} from '@chakra-ui/react';
import axios from 'axios';
import { t } from 'i18next';
import { ArrowDown2 } from 'iconsax-react';
import React from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';

const orderStatus = new OrderStatus();

export default function BulkUpdateOrder({ rows }: { rows: Record<string, any>[] }) {
  const [status, setStatus] = React.useState<TOrderStatus>();
  const [paymentStatus, setPaymentStatus] = React.useState<'unpaid' | 'payment_requested' | 'paid'>();

  const [deliveryPersonSearch, setDeliveryPersonSearch] = React.useState('');
  const [airportSearch, setAirportSearch] = React.useState('');

  const deliveryPersonSearchText = useDebounce(deliveryPersonSearch, 300);
  const airportSearchText = useDebounce(airportSearch, 300);

  const [deliveryPersonOptions, setDeliveryPersonOptions] = React.useState<any[]>([]);
  const [deliveryPersonLoading, setDeliveryPersonLoading] = React.useState(false);

  const [airportOptions, setAirportOptions] = React.useState<any[]>([]);
  const [airportLoading, setAirportLoading] = React.useState(false);

  const hasDeliveryTypeOrders = !!rows?.some((row: any) => row.type === 'delivery');

  const updateBulkStatus = async (formData: Record<string, any>) => {
    if (
      'status' in formData &&
      hasDeliveryTypeOrders &&
      (formData.status === 'on_delivery' || formData.status === 'completed')
    ) {
      const hasUnassignedOrder = rows.some((row: any) => !row.deliveryManId);
      if (hasUnassignedOrder) {
        toast.error(t('Select delivery man first'));
        return;
      }
    }

    try {
      const { data } = await axios.patch('/api/orders/bulk/update', {
        ids: rows.map((row: any) => row.id),
        ...formData,
      });

      if (data?.success) {
        toast.success(t('Order updated successfully'));
        await mutate((key: string) => key.startsWith('/api/orders'));
      } else {
        toast.error(t('Failed to update order'));
      }
    } catch (e: any) {
      const errorMessage = e?.response?.data?.message || t('Something went wrong');
      toast.error(errorMessage);
    }
  };

  React.useEffect(() => {
    if (deliveryPersonSearchText.length >= 2) {
      setDeliveryPersonLoading(true);
      axios
        .get(`/api/users?type=delivery&search=${deliveryPersonSearchText}`)
        .then((res) => setDeliveryPersonOptions(res.data || []))
        .catch(() => toast.error(t('Failed to load delivery persons')))
        .finally(() => setDeliveryPersonLoading(false));
    }
  }, [deliveryPersonSearchText]);

  React.useEffect(() => {
    if (airportSearchText.length >= 2) {
      setAirportLoading(true);
      axios
        .get(`/api/airports?q=${airportSearchText}`)
        .then((res) => setAirportOptions(res.data || []))
        .catch(() => toast.error(t('Failed to load airports')))
        .finally(() => setAirportLoading(false));
    }
  }, [airportSearchText]);

  const handleSelectDeliveryPerson = async (person: any) => {
    setDeliveryPersonSearch('');
    setDeliveryPersonOptions([]);
    await updateBulkStatus({ deliveryManId: person.id });
  };

  const handleSelectAirport = async (airport: any) => {
    setAirportSearch('');
    setAirportOptions([]);
    await updateBulkStatus({ deliveryAirportId: airport.id });
  };

  return (
    <div className="flex-wrap lg:flex-nowrap items-center gap-4 ml-auto flex">
      {/* Payment status */}
      <HStack gap={3}>
        <Text color="secondary.400" className="whitespace-nowrap">
          {t('Payment status')}
        </Text>
        <Select
          value={paymentStatus}
          onChange={(e) => {
            const selectedStatus = e.target.value;
            setPaymentStatus(selectedStatus as 'unpaid' | 'payment_requested' | 'paid');
            updateBulkStatus({ paymentStatus: selectedStatus });
          }}
          className={`${paymentStatus === "paid" ? "bg-green-300" : paymentStatus === "payment_requested" ? "bg-blue-300" : "bg-red-300"} text-white`}
          size="md"
          width="auto"
        >
          <option value="unpaid" className='text-black'>{t('Unpaid')}</option>
          <option value="payment_requested" className='text-black'>{t('Payment Requested')}</option>
          <option value="paid" className='text-black'>{t('Paid')}</option>
        </Select>
      </HStack>

      {/* Delivery person */}
      {hasDeliveryTypeOrders && (
        <Box minW="300px">
          <Box className="border relative rounded-[6px] border-pink-300 text-pink-800 hover:bg-primary-50">
            <div className='flex'>
              <Input
                placeholder={t('Search caterer')}
                value={deliveryPersonSearch}
                onChange={(e) => setDeliveryPersonSearch(e.target.value)}
              />
              {deliveryPersonLoading && (
                <HStack mt={2} justifyContent="center">
                  <Spinner size="sm" />
                </HStack>
              )}
            </div>
            {!deliveryPersonLoading && deliveryPersonOptions.length > 0 && (
              <Box mt={2} border="1px solid #eee" borderRadius="md" maxH="200px" overflowY="auto" className='absolute top-[100%] bg-white w-full' zIndex={10000}>
                {deliveryPersonOptions.map((person) => (
                  <Box
                    key={person.id}
                    px={4}
                    py={2}
                    cursor="pointer"
                    _hover={{ bg: 'gray.100' }}
                    onClick={() => handleSelectDeliveryPerson(person)}
                  >
                    {person.fullName}
                    <Text fontSize="xs" color="gray.500">
                      [{person.airport?.iataCode} / {person.airport?.icaoCode}]
                    </Text>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Delivery Airport */}
      {hasDeliveryTypeOrders && (
        <Box minW="300px">
          <Box className="border rounded-[6px] border-purple-300 text-purple-800 hover:bg-primary-50 relative">
            <div className='flex'>
              <Input
                placeholder={t('Search airport')}
                value={airportSearch}
                onChange={(e) => setAirportSearch(e.target.value)}
              />
              {airportLoading && (
                <HStack mt={2} justifyContent="center">
                  <Spinner size="sm" />
                </HStack>
              )}
            </div>
            {!airportLoading && airportOptions.length > 0 && (
              <Box mt={2} border="1px solid #eee" borderRadius="md" maxH="200px" overflowY="auto" className='absolute top-[100%] bg-white w-full' zIndex={10000}>
                {airportOptions.map((airport) => (
                  <Box
                    key={airport.id}
                    px={4}
                    py={2}
                    cursor="pointer"
                    _hover={{ bg: 'gray.100' }}
                    onClick={() => handleSelectAirport(airport)}
                  >
                    {airport.fboName}
                    <Text fontSize="xs" color="gray.500">
                      [{airport.iataCode} / {airport.icaoCode}]
                    </Text>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Order status */}
      <Menu>
        <MenuButton
          as={Button}
          variant="outline"
          rightIcon={<ArrowDown2 />}
          color={status ? status?.fgColor : ''}
          borderColor={status?.fgColor}
        >
          {status ? t(startCase(status?.label)) : t('Status')}
        </MenuButton>
        <MenuList className="p-1 min-w-[250px]">
          <MenuOptionGroup
            value={status?.value || ''}
            onChange={(value) => {
              setStatus(orderStatus.getStatusDetails(value as string));
              updateBulkStatus({ status: value as string });
            }}
          >
            {orderStatus.all().map((status: TOrderStatus) =>
              !hasDeliveryTypeOrders && status.value === 'on_delivery' ? null : (
                <MenuItemOption
                  key={status.value}
                  value={status.value}
                  color={status.fgColor}
                  icon={null}
                >
                  {t(status.label)}
                </MenuItemOption>
              )
            )}
          </MenuOptionGroup>
        </MenuList>
      </Menu>
    </div>
  );
}