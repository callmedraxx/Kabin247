import { useState } from 'react';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { SearchNormal } from 'iconsax-react';
import Layout from '@/components/common/Layout';
import OrderCard from '@/components/Admin/ActiveOrders/OrderCard';
import OrderDetailsSidebar from '@/components/Admin/ActiveOrders/OrderDetailsSidebar';
import { useTranslation } from 'react-i18next';
import useDebounce from '@/hooks/useDebounce';
import useSWR from 'swr';
import fetcher from '@/lib/fetcher';
import { match, P } from 'ts-pattern';

export default function ActiveOrders() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const searchedText = useDebounce(search, 300);
  const [orderId, setOrderId] = useState<number>();
  const [activeStatus, setActiveStatus] = useState('all');

  const {
    data: orderItems,
    isLoading,
    mutate,
    isValidating,
  } = useSWR(`/api/orders?search=${searchedText}&listType=active`, fetcher);

  const tabOptions = [
    { label: t('All'), value: 'all' },
    { label: t('Quote Pending'), value: 'quote_pending' },
    { label: t('Quote Sent'), value: 'quote_sent' },
    { label: t('Awaiting Vendor Quote'), value: 'awaiting_vendor_quote' },
    { label: t('Awaiting Vendor Confirmation'), value: 'awaiting_vendor_confirmation' },
    { label: t('Vendor Confirmed'), value: 'vendor_confirmed' },
    { label: t('Awaiting Client Confirmation'), value: 'awaiting_client_confirmation' },
    { label: t('Client Confirmed'), value: 'client_confirmed' },
  ];

  const renderItem = (status: string) => {
    return (
      <div className="order-card-container">
        {match({ orderItems, isLoading })
          .with({ isLoading: true }, () => (
            <HStack height="200px" justifyContent="center">
              <Spinner size="sm" />
              <Text>{t('Loading...')}</Text>
            </HStack>
          ))
          .with({ orderItems: P.not(P.nullish) }, () => {
            const filteredItems = orderItems.filter((order: any) => order.status === status);

            if (!filteredItems.length)
              return <Text className="text-secondary-500"> {t('No orders available')} </Text>;

            return (
              <div className="order-card-grid">
                {filteredItems.map(
                  (item: any) =>
                    item.status === status && (
                      <OrderCard
                        key={item.id}
                        refresh={mutate}
                        onClick={(id) => {
                          setOrderId(id);
                          setIsOpen(true);
                        }}
                        data={item}
                      />
                    )
                )}
              </div>
            );
          })
          .otherwise(() => (
            <Text className="text-secondary-500"> {t('No orders available')} </Text>
          ))}
      </div>
    );
  };

  return (
    <Layout title={t('Orders')}>
      <div className={`grid ${isOpen ? 'grid-cols-2' : 'grid-cols-1'} @container justify-between`}>
        <div className="h-[calc(100vh-76px)] w-full p-6 overflow-y-scroll">

          {/* Header: Dropdown + Search */}
          <div className="flex flex-col @3xl:flex-row @3xl:items-center justify-between gap-4 mb-4">
            <div className="max-w-full">
              <Select
                value={activeStatus}
                onChange={(e) => setActiveStatus(e.target.value)}
                className="max-w-[300px]"
              >
                {tabOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>

            {!isOpen && (
              <div className="max-w-[300px]">
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <SearchNormal size={18} />
                  </InputLeftElement>
                  <Input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('Search')}
                    className="bg-white"
                  />
                </InputGroup>
              </div>
            )}
          </div>

          {/* Main Content: Accordions or filtered tab */}
          {activeStatus === 'all' ? (
            <Accordion defaultIndex={[0, 1]} allowMultiple>
              <AccordionItem border={0}>
                <AccordionButton className="flex items-center justify-between border-b border-black/10">
                  <p className="font-medium pb-1">{t('Quote Pending')}</p>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel className="px-1">{renderItem('quote_pending')}</AccordionPanel>
              </AccordionItem>

              <AccordionItem border={0}>
                <AccordionButton className="flex items-center justify-between border-b border-black/10">
                  <p className="font-medium pb-1">{t('Others')}</p>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel className="px-1 order-card-container">
                  {match({ orderItems, isLoading })
                    .with({ isLoading: true }, () => (
                      <HStack height="200px" justifyContent="center">
                        <Spinner size="sm" />
                        <Text>{t('Loading...')}</Text>
                      </HStack>
                    ))
                    .with({ orderItems: P.not(P.nullish) }, () => (
                      <div className="order-card-grid">
                        {orderItems.map(
                          (item: any) =>
                            item.status !== 'quote_pending' && (
                              <OrderCard
                                key={item.id}
                                refresh={() => mutate(orderItems)}
                                onClick={(id) => {
                                  setOrderId(id);
                                  setIsOpen(true);
                                }}
                                data={item}
                              />
                            )
                        )}
                      </div>
                    ))
                    .otherwise(() => (
                      <Text className="text-secondary-400"> {t('No quote pending orders')} </Text>
                    ))}
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          ) : (
            renderItem(activeStatus)
          )}
        </div>

        {/* Sidebar */}
        {orderId && (
          <OrderDetailsSidebar
            isValidating={isValidating}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            orderId={orderId}
            refresh={() => mutate(orderItems)}
          />
        )}
      </div>
    </Layout>
  );
}
