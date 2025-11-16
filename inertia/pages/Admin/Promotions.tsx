import FileUpload from '@/components/Admin/FileUpload';
import Slider from '@/components/Admin/Promotions/Slider';
import Layout from '@/components/common/Layout';
import fetcher from '@/lib/fetcher';
import {
  Box,
  Button,
  Flex,
  HStack,
  Spinner,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import useSWR from 'swr';

export default function Promotions() {
  const { t } = useTranslation();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [welcomeImage, setWelcomeImage] = useState<File>();
  const { data, isLoading } = useSWR('/api/promotions/welcome', fetcher);

  useEffect(() => {
    if (!isLoading && data) {
      setIsActive(!!data?.content?.welcomeStatus);
    }
  }, [data]);

  // Update promotional image
  const updatePromotionalImage = async () => {
    setIsUpdating(true);
    try {
      const fd = new FormData();
      fd.append('type', 'welcome');
      fd.append('welcomeImage', welcomeImage || '');
      fd.append('welcomeStatus', isActive.toString());

      // update
      const { data } = await axios.put('/api/promotions', fd, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (data.success) {
        toast.success(t(data.message));
      }
    } catch (error) {
      toast.error(t(error.response.data.message || 'Failed to update'));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Layout title={t('Promotions')}>
      <div className="p-6 relative">
        <Tabs>
          <Flex className="justify-between">
            <TabList>
              <Tab>{t('Slider')}</Tab>
              <Tab>{t('Welcome pop-up')}</Tab>
            </TabList>
          </Flex>

          <TabPanels>
            <TabPanel>
              <Slider />
            </TabPanel>
            <TabPanel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isLoading ? (
                  <div>
                    <Spinner />
                  </div>
                ) : (
                  <Flex className="col-span-1 flex flex-col space-y-2 p-6 bg-white rounded-md shadow-[0px_1px_2px_0px_rgba(0,0,0,0.06),0px_1px_3px_0px_rgba(0,0,0,0.1)]">
                    <HStack justify="space-between">
                      <label>{t('Image ')}</label>
                      <HStack as="label">
                        <span>Show Popup</span>
                        <Switch
                          isChecked={isActive}
                          onChange={(e) => setIsActive(e.target.checked)}
                          colorScheme="green"
                        />
                      </HStack>
                    </HStack>
                    <div className="[&>div]:h-[182px]">
                      <FileUpload
                        defaultValue={data?.content?.welcomeImage?.url || ''}
                        onChange={(file) => setWelcomeImage(file)}
                      />
                    </div>
                  </Flex>
                )}

                <Box className="sm:absolute top-0 right-4">
                  <HStack className="gap-4">
                    <Button
                      onClick={updatePromotionalImage}
                      colorScheme="primary"
                      className="bg-primary-400 hover:bg-primary-500"
                      isLoading={isUpdating}
                    >
                      {t('Update')}
                    </Button>
                  </HStack>
                </Box>
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </Layout>
  );
}
