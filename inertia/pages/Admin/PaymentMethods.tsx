
import PaymentMethod from '@/components/Admin/PaymentMethod';
import Layout from '@/components/common/Layout';
import { Flex, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

type PaymentMethod = {
  config: string;
  countries: string;
  currencies: string;
  createdAt: string;
  id: number;
  extraParams: string;
  mode: string;
  key: string;
  logo: string;
  name: string;
  status: boolean;
  public: string;
  secret: string;
  updatedAt: string;
  webhook: string;
};
const PaymentMethods = ({ data }: {data: PaymentMethod[]}) => {
  const { t } = useTranslation();

  return (
    <Layout title={t('Payment Methods')}>
      <div className="p-4 sm:p-6 relative">
        <Tabs>
          <Flex className="justify-between w-full overflow-x-auto">
            <TabList className="whitespace-nowrap">
              {data?.map((item: PaymentMethod) => (
                <Tab key={item.id}>{item.name}</Tab>
              ))}
            </TabList>
          </Flex>

          <TabPanels>
              {data?.map((item: PaymentMethod) => (
                <TabPanel>
                  <PaymentMethod paymentMethod={item} />
                </TabPanel>
              ))}
          </TabPanels>
        </Tabs>
      </div>
    </Layout>
  )
}

export default PaymentMethods