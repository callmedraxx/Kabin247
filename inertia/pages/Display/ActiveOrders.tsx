import OrderCardReadOnly from '@/components/Display/OrderCardReadOnly';
import Layout from '@/components/common/Layout';
import fetcher from '@/lib/fetcher';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  HStack,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { match, P } from 'ts-pattern';

export default function ActiveOrders() {
  const { t } = useTranslation();
  const { data: orderItems, isLoading, mutate } = useSWR('/api/orders', fetcher);

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

  const renderItem = (items: any) => {
    return (
      <div className="order-card-container">
        {match({ items, isLoading })
          .with({ isLoading: true }, () => (
            <HStack height="200px" justifyContent="center">
              <Spinner size="sm" />
              <Text>{t('Loading...')}</Text>
            </HStack>
          ))

          .with({ items: P.not(P.nullish) }, ({ items }) => {
            if (!items.length)
              return <Text className="text-secondary-500"> {t('No orders available')} </Text>;

            return (
              <div className="order-card-grid">
                {items.map((item: any) => (
                  <OrderCardReadOnly key={item.id} data={item} />
                ))}
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
      <div className="h-screen w-full p-6">
        <Accordion defaultIndex={[0, 1]} allowMultiple>
          <AccordionItem border={0}>
            <AccordionButton className="flex items-center justify-between border-b border-black/10">
              <p className="font-medium pb-1">{t('Quote Pending')}</p>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel className="px-1">
              {renderItem(
                orderItems?.filter(
                  (item: any) => item.status === 'quote_pending' && item.type !== 'delivery'
                )
              )}
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem border={0}>
            <AccordionButton className="flex items-center justify-between border-b border-black/10">
              <p className="font-medium pb-1">{t('Others')}</p>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel className="px-1 order-card-container">
              {renderItem(
                orderItems?.filter(
                  (item: any) => item.status !== 'quote_pending' && item.type !== 'delivery'
                )
              )}
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </div>
    </Layout>
  );
}
