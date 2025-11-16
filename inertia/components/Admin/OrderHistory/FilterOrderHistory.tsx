import useTableData from '@/data/use_table_data';
import useDebounce from '@/hooks/useDebounce';
import { OrderStatus } from '@/utils/order_status';
import { startCase } from '@/utils/string_formatter';
import {
  Menu,
  Text,
  Popover,
  PopoverTrigger,
  Button,
  PopoverContent,
  PopoverBody,
  MenuButton,
  MenuList,
  MenuOptionGroup,
  MenuItemOption,
  PopoverFooter,
  Input,
  MenuDivider,
  Box,
  HStack,
  Spinner,
} from '@chakra-ui/react';
import { t } from 'i18next';
import { FilterSearch, ArrowDown2 } from 'iconsax-react';
import { useState } from 'react';

// filter options types
type FilterOptions = Partial<{
  status: string;
  category: string;
  type: string;
  paymentType: string;
  paymentStatus: string;
  user: string;
  userName: string;
  deliveryMan: string;
  deliveryManName: string;
  startDate: string;
  endDate: string;
}>;

type FilterProps = {
  filter: FilterOptions;
  setFilter: (data: Record<string, any>) => void;
};

// customer data type
type CustomerType = Record<string, any> & {
  id: number;
  fullName: string;
};

const orderStatus = new OrderStatus();

export default function FilterOrderHistory({ filter, setFilter }: FilterProps) {
  const [customerSearch, setCustomerSearch] = useState('');
  const [deliveryManSearch, setDeliveryManSearch] = useState('');

  const customerSearchText = useDebounce(customerSearch, 300);
  const deliveryManSearchText = useDebounce(deliveryManSearch, 300);

  // Customers
  const { items: customers, isLoading: isCustomerLoading } = useTableData('/api/users', {
    search: customerSearchText,
    page: 1,
    limit: 20,
    customer: 'customer',
  });

  const { items: deliveryMan, isLoading: isDeliveryManLoading } = useTableData('/api/users', {
    search: deliveryManSearchText,
    page: 1,
    limit: 20,
    customer: 'delivery',
  });

  return (
    <Popover matchWidth>
      <PopoverTrigger>
        <Button variant="outline" leftIcon={<FilterSearch />}>
          {t('Filter')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px]">
        <PopoverBody className="w-full p-2.5 flex flex-col gap-3">
          {/* Order Date Range */}
          <div className="flex flex-col gap-1.5">
            <Text className="text-secondary-500">{t('Order date range')}</Text>
            <div className="flex gap-2">
              <div className="flex-1">
                <Text className="text-xs text-secondary-400 mb-1">{t('From')}</Text>
                <Input
                  type="date"
                  value={filter?.startDate || ''}
                  onChange={(e) => {
                    const startDate = e.target.value;
                    if (filter?.endDate && startDate > filter.endDate) {
                      setFilter((prevState: any) => ({ 
                        ...prevState, 
                        startDate,
                        endDate: startDate
                      }));
                    } else {
                      setFilter((prevState: any) => ({ 
                        ...prevState, 
                        startDate 
                      }));
                    }
                  }}
                  max={filter?.endDate || undefined}
                  className="w-full bg-secondary-50 border-none focus:ring-0"
                />
              </div>
              <div className="flex-1">
                <Text className="text-xs text-secondary-400 mb-1">{t('To')}</Text>
                <Input
                  type="date"
                  value={filter?.endDate || ''}
                  onChange={(e) => setFilter((prevState: any) => ({ 
                    ...prevState, 
                    endDate: e.target.value 
                  }))}
                  min={filter?.startDate || undefined}
                  className="w-full bg-secondary-50 border-none focus:ring-0"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <Menu matchWidth>
            <div className="flex flex-col gap-1.5">
              <Text className="text-secondary-500">{t('Order status')}</Text>
              <MenuButton
                as={Button}
                className="w-full text-left justify-start bg-secondary-50 font-normal"
                rightIcon={<ArrowDown2 />}
                color={filter?.status ? 'inherit' : 'secondary.500'}
              >
                {t(startCase(filter?.status)) || t('Status')}
              </MenuButton>
            </div>
            <MenuList className="w-full p-1">
              <MenuOptionGroup
                value={filter?.status || ''}
                onChange={(value) => setFilter((f: any) => ({ ...f, status: value as string }))}
                type="radio"
              >
                {orderStatus.all().map(
                  (status, index) =>
                    ['completed', 'failed', 'canceled'].includes(status.value) && (
                      <MenuItemOption
                        key={index}
                        value={status.value}
                        icon={null}
                        color={status.fgColor}
                      >
                        {t(status.label)}
                      </MenuItemOption>
                    )
                )}
              </MenuOptionGroup>
            </MenuList>
          </Menu>

          {/* Order type */}
          <Menu matchWidth>
            <div className="flex flex-col gap-1.5">
              <Text className="text-secondary-500">{t('Order type')}</Text>
              <MenuButton
                as={Button}
                className="w-full text-left justify-start bg-secondary-50 font-normal"
                rightIcon={<ArrowDown2 />}
                color={filter?.type ? 'inherit' : 'secondary.500'}
              >
                {t(startCase(filter?.type)) || t('Order type')}
              </MenuButton>
            </div>

            {/* Type */}
            <MenuList className="w-full p-1">
              <MenuOptionGroup
                value={filter?.type || ''}
                onChange={(value) =>
                  setFilter((prevState: any) => ({ ...prevState, type: value as string }))
                }
                type="radio"
              >
                {['dine_in', 'delivery', 'pickup'].map((status, index) => (
                  <MenuItemOption key={index} value={status} icon={null}>
                    {t(startCase(status))}
                  </MenuItemOption>
                ))}
              </MenuOptionGroup>
            </MenuList>
          </Menu>

          {/* Payment type */}
          <Menu matchWidth>
            <div className="flex flex-col gap-1.5">
              <Text className="text-secondary-500">{t('Payment type')}</Text>
              <MenuButton
                as={Button}
                className="w-full text-left justify-start bg-secondary-50 font-normal"
                rightIcon={<ArrowDown2 />}
                color={filter?.paymentType ? 'inherit' : 'secondary.500'}
              >
                {t(startCase(filter?.paymentType)) || t('Payment type')}
              </MenuButton>
            </div>

            {/* Type */}
            <MenuList className="w-full p-1">
              <MenuOptionGroup
                value={filter?.paymentType || ''}
                onChange={(value) =>
                  setFilter((prevState: any) => ({ ...prevState, paymentType: value as string }))
                }
                type="radio"
              >
                {['cash', 'card'].map((status, index) => (
                  <MenuItemOption key={index} value={status} icon={null}>
                    {t(startCase(status))}
                  </MenuItemOption>
                ))}
              </MenuOptionGroup>
            </MenuList>
          </Menu>

          {/* Payment Status */}
          <Menu matchWidth>
            <div className="flex flex-col gap-1.5">
              <Text className="text-secondary-500">{t('Payment status')}</Text>
              <MenuButton
                as={Button}
                className="w-full text-left justify-start bg-secondary-50 font-normal"
                rightIcon={<ArrowDown2 />}
                color={
                  filter?.paymentStatus === 'paid'
                    ? 'inherit'
                    : filter?.paymentStatus === 'unpaid'
                      ? 'secondary.500'
                      : 'cyan.300'
                }
              >
                {t(
                  startCase(
                    filter?.paymentStatus === 'paid'
                      ? 'Paid'
                      : filter?.paymentStatus === 'unpaid'
                        ? 'Unpaid'
                        : 'Payment Requested'
                  )
                ) || t('Payment status')}
              </MenuButton>
            </div>

            {/* Type */}
            <MenuList className="w-full p-1">
              <MenuOptionGroup
                value={filter?.paymentStatus || ''}
                onChange={(value) =>
                  setFilter((prevState: any) => ({ ...prevState, paymentStatus: value }))
                }
                type="radio"
              >
                {['unpaid', 'payment_requested', 'paid'].map((status, index) => (
                  <MenuItemOption key={index} value={status}>
                    {t(startCase(status))}
                  </MenuItemOption>
                ))}
              </MenuOptionGroup>
            </MenuList>
          </Menu>

          {/* Customer */}
          <Menu matchWidth>
            <div className="flex flex-col gap-1.5">
              <Text className="text-secondary-500">{t('Client')}</Text>
              <MenuButton
                as={Button}
                className="w-full text-left justify-start bg-secondary-50 font-normal"
                rightIcon={<ArrowDown2 />}
                color={filter?.user ? 'inherit' : 'secondary.500'}
              >
                {filter?.userName || t('Client name')}
              </MenuButton>
            </div>

            <MenuList className="w-full p-1">
              <Input
                type="search"
                name="customerSearch"
                placeholder={t('Search...')}
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
              />
              <MenuDivider />

              {isCustomerLoading ? (
                <Box>
                  <HStack color="secondary.500" className="py-2 px-4">
                    <Spinner size="sm" />
                    <Text> {t('Loading...')} </Text>
                  </HStack>
                </Box>
              ) : customers?.length > 0 ? (
                <MenuOptionGroup
                  value={filter?.userName || ''}
                  onChange={(value) =>
                    setFilter((prevState: any) => ({
                      ...prevState,
                      user: value as string,
                      userName: customers?.find((c: any) => c.id?.toString() === value)?.fullName,
                    }))
                  }
                  type="radio"
                >
                  {customers?.map((customer: CustomerType) => (
                    <MenuItemOption key={customer.id} value={customer.id?.toString()} icon={null}>
                      {customer.fullName}
                    </MenuItemOption>
                  ))}
                </MenuOptionGroup>
              ) : (
                <Box className="py-2 px-4">
                  <Text>{t("Clients doesn't exist")} </Text>
                </Box>
              )}
            </MenuList>
          </Menu>

          {/* Delivery man */}
          <Menu matchWidth>
            <div className="flex flex-col gap-1.5">
              <Text className="text-secondary-500">{t('Delivery person')}</Text>
              <MenuButton
                as={Button}
                className="w-full text-left justify-start bg-secondary-50 font-normal"
                rightIcon={<ArrowDown2 />}
                color={filter?.user ? 'inherit' : 'secondary.500'}
              >
                {filter?.deliveryManName || t('Delivery person')}
              </MenuButton>
            </div>

            <MenuList className="w-full p-1">
              <Input
                type="search"
                name="deliveryManName"
                placeholder={t('Search...')}
                value={deliveryManSearch}
                onChange={(e) => setDeliveryManSearch(e.target.value)}
              />
              <MenuDivider />

              {isDeliveryManLoading ? (
                <Box>
                  <HStack color="secondary.500" className="py-2 px-4">
                    <Spinner size="sm" />
                    <Text> {t('Loading...')} </Text>
                  </HStack>
                </Box>
              ) : deliveryMan?.length > 0 ? (
                <MenuOptionGroup
                  value={filter?.deliveryManName || ''}
                  onChange={(value) =>
                    setFilter((prevState: any) => ({
                      ...prevState,
                      deliveryMan: value as string,
                      deliveryManName: deliveryMan?.find((c: any) => c.id?.toString() === value)
                        ?.fullName,
                    }))
                  }
                  type="radio"
                >
                  {deliveryMan?.map((customer: CustomerType) => (
                    <MenuItemOption key={customer.id} value={customer.id?.toString()} icon={null}>
                      {customer.fullName}
                    </MenuItemOption>
                  ))}
                </MenuOptionGroup>
              ) : (
                <Box className="py-2 px-4">
                  <Text>{t("Delivery person doesn't exist")} </Text>
                </Box>
              )}
            </MenuList>
          </Menu>
        </PopoverBody>
        <PopoverFooter className="border-black/5">
          <Button size="md" className="w-full" onClick={() => setFilter({})}>
            {t('Clear')}
          </Button>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
}
