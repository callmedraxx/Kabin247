import { useEffect, useState } from 'react';
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
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react';
import { SearchNormal } from 'iconsax-react';
import Layout from '@/components/common/Layout';
import OrderCard from '@/components/Admin/ActiveOrders/OrderCard';
import { useTranslation } from 'react-i18next';
import useDebounce from '@/hooks/useDebounce';
import useSWR from 'swr';
import fetcher from '@/lib/fetcher';
import { match, P } from 'ts-pattern';
import OrderDetailsSidebar from '@/components/Kitchen/OrderDetailsSidebar';

export default function ActiveOrders() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const searchedText = useDebounce(search, 300);
  const [orderId, setOrderId] = useState<number>();

  const {
    data: orderItems,
    isLoading,
    mutate,
    isValidating,
  } = useSWR(`/api/orders?search=${searchedText}`, fetcher);

  useEffect(() => {
    const subscribeToOrders = async () => {
      const subscription = transmit.subscription('orders');
      await subscription.create();

      subscription.onMessage((data: any) => {
        if (data?.success) {
          mutate();
        }
      });
    };

    subscribeToOrders();

    return () => {
      transmit.close();
    };
  }, [mutate]);

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
    <Layout title={t('Active orders')}>
      <div className={`grid ${isOpen ? 'grid-cols-2' : 'grid-cols-1'} justify-between`}>
        <div className="h-[calc(100vh-76px)] w-full p-6 overflow-y-scroll @container">
          <Tabs>
            <div className="flex flex-col @3xl:flex-row @3xl:items-center justify-between gap-4">
              <div className="flex-1 flex flex-wrap gap-3 justify-between items-center">
                <TabList className="flex flex-wrap @lg:flex-nowrap whitespace-nowrap border-b-0 @lg:border-b-2 [&>button[aria-selected=true]]:bg-primary-500 [&>button[aria-selected=true]]:text-white [&>button[aria-selected=true]]:rounded-md @lg:[&>button[aria-selected=true]]:bg-transparent @lg:[&>button[aria-selected=true]]:text-primary-500 @lg:[&>button[aria-selected=true]]:rounded-none">
                  <Tab>{t('All')}</Tab>
                  <Tab>{t('Quote Pending')}</Tab>
                  <Tab>{t('Quote Sent')}</Tab>
                  <Tab>{t('Awaiting Vendor Q.')}</Tab>
                  <Tab>{t('Awaiting Vendor C.')}</Tab>
                  <Tab>{t('Vendor Confirmed')}</Tab>
                  <Tab>{t('Awaiting Client C.')}</Tab>
                  <Tab>{t('Client Confirmed')}</Tab>
                </TabList>
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
            </div>

            <TabPanels>
              <TabPanel>
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
              </TabPanel>
              <TabPanel>{renderItem('quote_pending')}</TabPanel>
              <TabPanel>{renderItem('quote_sent')}</TabPanel>
              <TabPanel>{renderItem('awaiting_vendor_quote')}</TabPanel>
              <TabPanel>{renderItem('awaiting_vendor_confirmation')}</TabPanel>
              <TabPanel>{renderItem('vendor_confirmed')}</TabPanel>
              <TabPanel>{renderItem('awaiting_client_confirmation')}</TabPanel>
              <TabPanel>{renderItem('client_confirmed')}</TabPanel>
            </TabPanels>
          </Tabs>
        </div>

        {orderId && (
          <OrderDetailsSidebar
            isValidating={isValidating}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            orderId={orderId}
          />
        )}
      </div>
    </Layout>
  );
}
