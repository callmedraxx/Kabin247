import ProfileLayout from '@/components/Customer/Profile/ProfileLayout';
import fetcher from '@/lib/fetcher';
import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import { generateInvoice } from '@/utils/generate_invoice';
import { OrderStatus } from '@/utils/order_status';
import { startCase } from '@/utils/string_formatter';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Button,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  HStack,
} from '@chakra-ui/react';
import { DocumentDownload } from 'iconsax-react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

const orderStatus = new OrderStatus();

/** Coerce unknown -> array safely (handles JSON strings too) */
function toArray<T = any>(val: any): T[] {
  if (Array.isArray(val)) return val as T[];
  if (val == null) return [];
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

/** Normalize the response shape and deep fields */
function normalizeOrders(raw: any): any[] {
  const list = toArray(raw?.data ?? raw?.orders ?? raw);

  return list.map((order: any) => {
    const items = toArray(order?.orderItems).map((item: any) => {
      const variants = toArray(item?.variants).map((v: any) => ({
        ...v,
        variantOptions: toArray(v?.variantOptions),
      }));
      const addons = toArray(item?.addons);
      const charges = toArray(item?.charges);
      return { ...item, variants, addons, charges };
    });
    return { ...order, orderItems: items };
  });
}

/** Get payment URL from common shapes (uses paymentInfo.url first) */
function getPaymentUrl(order: any): string | null {
  return (
    order?.paymentInfo?.url ??
    order?.redirectUrl ??
    order?.payment?.redirectUrl ??
    order?.data?.redirectUrl ??
    order?.order?.redirectUrl ??
    null
  );
}

/** Default payment type to 'stripe' if missing */
function getPaymentType(order: any): string {
  const val = order?.paymentType ?? 'stripe';
  return typeof val === 'string' ? val.toLowerCase() : 'stripe';
}

/** Helpers */
const joinedVariantNames = (variantsUnsafe: any): string => {
  const variants = toArray<any>(variantsUnsafe);
  if (variants.length === 0) return '';
  const size = variants.length;
  return variants
    .map((variant: any, idx: number) => {
      const opts = toArray<any>(variant?.variantOptions)
        .map((opt) => opt?.name)
        .filter(Boolean)
        .join(', ');
      return `${opts}${idx + 1 === size ? '' : ' | '}`;
    })
    .join('');
};

const joinedAddonNames = (addonsUnsafe: any): string => {
  const addons = toArray<any>(addonsUnsafe);
  if (addons.length === 0) return '';
  return addons.map((a) => `${a?.name ?? ''} x ${a?.quantity ?? 0}`).join(', ');
};

export default function MyOrders() {
  const { data, isLoading, error } = useSWR('/api/user/orders', fetcher);
  const { t } = useTranslation();
  const [payingId, setPayingId] = useState<number | null>(null);

  const orders = useMemo(() => normalizeOrders(data ?? []), [data]);

  const handlePay = async (order: any) => {
    try {
      setPayingId(order.id);

      const paymentType = getPaymentType(order);
      if (paymentType === 'ach') {
        toast.info(t('This order was placed with ACH payment.'));
        return;
      }

      const url = getPaymentUrl(order);
      if (url) {
        window.location.href = url;
        return;
      }

      toast.error(t('Unable to start checkout.'));
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t('Failed to start checkout'));
    } finally {
      setPayingId(null);
    }
  };

  if (error) console.error('Failed to fetch orders:', error);

  return (
    <ProfileLayout>
      <div className="px-4 w-full h-full flex justify-center mx-auto">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Spinner />
          </div>
        ) : orders.length === 0 ? (
          <Text>{t('No orders found.')}</Text>
        ) : (
          <Accordion allowToggle className="w-full flex flex-col gap-y-4">
            {toArray(orders).map((order: any) => {
              const status = orderStatus.getStatusDetails(order.status);
              const isUnpaid = order.paymentStatus === 'unpaid';
              const paymentType = getPaymentType(order);
              const isAch = paymentType === 'ach';

              return (
                <AccordionItem
                  key={order.id}
                  className="border-secondary-100 p-4 shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.06),0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-2xl"
                >
                  <AccordionButton className="rounded-2xl px-0 bg-white hover:bg-white flex items-center gap-8 focus-visible:outline-0 focus-visible:shadow-none">
                    <HStack as="span" flex="1" textAlign="left" className="flex-wrap">
                      <HStack className="gap-10 flex-1">
                        {[
                          { label: t('Order no'), value: order.orderNumber },
                          { label: t('Items'), value: toArray(order.orderItems).length },
                          { label: t('Total'), value: convertToCurrencyFormat(order.grandTotal ?? 0) },
                        ].map((m, i) => (
                          <Box key={i}>
                            <Text as="p" className="text-sm font-normal leading-5 text-secondary-400">
                              {t(m.label)}
                            </Text>
                            <Text
                              className={`${m.label === 'Total' ? 'font-semibold' : 'font-medium'} text-base text-secondary-600 whitespace-nowrap`}
                            >
                              {m.value}
                            </Text>
                          </Box>
                        ))}

                        {/* PAYMENT STATUS BADGE (clickable for unpaid non-cash) */}
                        <Badge
                          variant="subtle"
                          colorScheme={
                            isUnpaid ? 'orange' : order.paymentStatus === 'paid' ? 'green' : 'cyan'
                          }
                          borderWidth="1px"
                          borderColor="blackAlpha.200"
                          px="4"
                          py="1.5"
                          rounded="full"
                          className={isUnpaid && !isAch ? 'cursor-pointer capitalize' : 'capitalize'}
                          title={isUnpaid && !isAch ? t('Click to pay') : undefined}
                          onClick={(e) => {
                            if (!(isUnpaid && !isAch)) return;
                            e.stopPropagation();
                            handlePay(order);
                          }}
                        >
                          {t(isUnpaid ? 'Unpaid' : order.paymentStatus === 'paid' ? 'Paid' : 'Payment Requested')}
                        </Badge>
                      </HStack>

                      <HStack className="gap-2">
                        {order.paymentStatus !== 'paid' && (
                          <Button
                            as="div"
                            size="sm"
                            className="rounded-full px-4 py-1 text-sm leading-5 font-medium capitalize"
                            onClick={(e) => {
                              e.stopPropagation();
                              generateInvoice(order.id, t, true);
                            }}
                            leftIcon={<DocumentDownload size={16} variant="Bulk" />}
                          >
                            {t('Invoice')}
                          </Button>
                        )}

                        {/* Only show "Pay now" for unpaid + non-cash (defaults to stripe) */}
                        {isUnpaid && !isAch && (
                          <Button
                            size="sm"
                            colorScheme="primary"
                            className="rounded-full px-4 py-1 text-sm leading-5 font-medium capitalize"
                            isLoading={payingId === order.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePay(order);
                            }}
                          >
                            {t('Pay now')}
                          </Button>
                        )}

                        {/* ORDER TYPE BADGE */}
                        <Badge
                          variant="subtle"
                          colorScheme="gray"
                          px="4"
                          py="1.5"
                          rounded="full"
                          borderWidth="1px"
                          borderColor="blackAlpha.200"
                          className="capitalize"
                        >
                          {t(startCase(order.type))}
                        </Badge>

                        {/* ORDER STATUS BADGE (uses fg/bg from your OrderStatus helper) */}
                        <Badge
                          variant="subtle"
                          px="4"
                          py="1.5"
                          rounded="full"
                          borderWidth="1px"
                          borderColor="blackAlpha.200"
                          className="capitalize"
                          bg={status?.bgColor}
                          color={status?.fgColor}
                        >
                          {t(status?.label)}
                        </Badge>
                      </HStack>
                    </HStack>
                    <AccordionIcon className="hidden sm:block" />
                  </AccordionButton>

                  <AccordionPanel className="px-0">
                    <Box
                      border="1px"
                      borderColor="secondary.200"
                      className="rounded-md flex-1 shadow-[0_1px_2px_rgba(0,0,0,6%),0_1px_3px_rgba(0,0,0,10%)] w-full overflow-x-auto"
                    >
                      <Table variant="simple">
                        <Thead className="[&>tr>th]:border-none">
                          <Tr>
                            <Th className="w-full">{t('ITEMS')}</Th>
                            <Th className="w-[120px]">{t('QTY')}</Th>
                            <Th className="w-[120px]">{t('PRICE')}</Th>
                            <Th className="w-[120px]">{t('TOTAL')}</Th>
                          </Tr>
                        </Thead>

                        <Tbody className="[&>tr>td]:border-none">
                          {toArray(order.orderItems).length > 0 ? (
                            toArray(order.orderItems).map((item: any) => {
                              const variants = toArray(item?.variants);
                              const addons = toArray(item?.addons);
                              const hasVariants = variants.length > 0;
                              const hasAddons = addons.length > 0;
                              const subtitle =
                                (hasVariants ? joinedVariantNames(variants) : '') +
                                (hasVariants && hasAddons ? ' | ' : '') +
                                (hasAddons ? joinedAddonNames(addons) : '');

                              return (
                                <Tr
                                  key={item.id}
                                  fontSize={14}
                                  lineHeight={5}
                                  fontWeight={400}
                                  className="odd:bg-secondary-50"
                                >
                                  <Td className="w-full pl-6 pr-1.5">
                                    <HStack className="flex-1">
                                      <Box className="flex-1 flex items-center gap-6">
                                        <div className="w-[60px] h-[40px] rounded aspect-[3/2] relative">
                                          <img
                                            src={item?.menuItem?.image?.url || '/default_fallback.png'}
                                            alt={item?.name ?? 'item'}
                                            width={60}
                                            height={40}
                                            className="w-[60px] h-[40px] rounded aspect-[3/2] object-cover"
                                            onError={(e) => {
                                              e.currentTarget.src = '/default_fallback.png';
                                            }}
                                          />
                                        </div>
                                        <div className="flex-1 text-sm">
                                          <Text noOfLines={1} fontWeight={500}>
                                            {t(item?.name ?? '')}
                                          </Text>
                                          {subtitle ? <Text noOfLines={1}>{subtitle}</Text> : null}
                                        </div>
                                      </Box>
                                    </HStack>
                                  </Td>
                                  <Td className="p-0 text-center font-medium">
                                    {item?.quantity ?? 0}
                                  </Td>
                                  <Td isNumeric className="px-2">
                                    {convertToCurrencyFormat(item?.price ?? 0)}
                                  </Td>
                                  <Td isNumeric className="pl-2 pr-6">
                                    {convertToCurrencyFormat(item?.grandPrice ?? 0)}
                                  </Td>
                                </Tr>
                              );
                            })
                          ) : (
                            <Tr>
                              <Td colSpan={4} className="border-none">
                                <Text className="text-secondary-500 font-medium text-sm">
                                  {t('No items have been added yet.')}
                                </Text>
                              </Td>
                            </Tr>
                          )}
                        </Tbody>
                      </Table>
                    </Box>
                  </AccordionPanel>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>
    </ProfileLayout>
  );
}
