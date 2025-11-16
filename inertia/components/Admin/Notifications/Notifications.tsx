import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import {
  Badge,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  IconButton,
  Spinner,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { Notification as NotificationIcon } from 'iconsax-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { router } from '@inertiajs/react';
import useNotifications from '@/data/use_notifications';

export default function Notifications() {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data, isLoading, size, setSize, refresh, unreadCount } = useNotifications();

  const getDataLength = (d: any) =>
    d?.reduce((a: number, c: any) => a + Number(c.data?.length || 0), 0);

  const flatArray = (d: any) => d?.reduce((a: [], c: any) => [...a, ...(c?.data || [])], []);

  const handleMarkAsRead = async (notification: any) => {
    try {
      await axios.post(`/notifications/${notification.id}/mark-as-read`);
    } catch (error) {
      toast.error(t('Something went wrong to mark notification as read'));
    }

    if (notification.navigate) {
      router.visit(notification.navigate);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.post('/notifications/mark-all-as-read');
      refresh();
    } catch (error) {
      toast.error(t('Something went wrong to mark notification as read'));
    }
  };

  return (
    <>
      <div className="relative">
        <IconButton
          aria-label={t('Notification')}
          className="size-12 rounded-lg bg-white border border-gray-200 text-secondary-700"
          icon={<NotificationIcon size="20" color="currentColor" />}
          onClick={onOpen}
        />
        {unreadCount > 0 && (
          <Badge
            colorScheme="primary"
            variant="solid"
            rounded="full"
            className="absolute bottom-0 right-0 aspect-square flex items-center justify-center min-w-4 text-[9px] p-0 leading-3"
          >
            {unreadCount}
          </Badge>
        )}
      </div>

      <Drawer isOpen={isOpen} placement="right" size="md" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader className="border-b border-black/[6%]">
            <HStack className="justify-between">
              <Text as="h3">{t('Notifications')}</Text>
              <Button type="button" onClick={handleMarkAllAsRead}>
                {t('Mark all as read')}
              </Button>
            </HStack>
          </DrawerHeader>
          <DrawerBody id="scrollbarTrigger" className="flex flex-col pb-6 relative">
            {isLoading ? (
              <Flex className="flex-1 items-center justify-center">
                <Spinner />
              </Flex>
            ) : (
              <InfiniteScroll
                dataLength={getDataLength(data)}
                next={() => setSize(size + 1)}
                hasMore={!!data?.[data.length - 1]?.meta?.nextPageUrl}
                loader={
                  <div className="flex items-center justify-center w-full absolute bottom-0 left-1/2 -translate-x-1/2 z-10">
                    <Spinner size="sm" className="flex justify-center text-secondary-400" />
                  </div>
                }
                scrollableTarget="scrollbarTrigger"
              >
                {flatArray(data)?.length === 0 && (
                  <div className="flex flex-col items-center justify-center gap-4 mt-12">
                    <img src="/DataEmpty.svg" alt="Data Empty" className="w-24" />
                    <Text className="text-center">{t('No notifications found')}</Text>
                  </div>
                )}
                {flatArray(data)?.map((item: any) => (
                  // render notifications
                  <Box
                    key={item.id}
                    data-read={Boolean(item.isRead)}
                    className="p-3 border-b border-secondary-200 data-[read=false]:bg-secondary-50 data-[read=false]:border-l-2 data-[read=false]:border-l-primary-500 cursor-pointer hover:bg-primary-50 active:bg-primary-100 data-[read=false]:hover:bg-primary-50 data-[read=false]:active:bg-primary-100 select-none"
                    onClick={() => handleMarkAsRead(item)}
                  >
                    <Text className="font-semibold text-secondary-800 text-sm">
                      {t(item.title)}
                    </Text>
                    <Text as="p" className="text-secondary-700 text-sm">
                      {t(item.body)}
                    </Text>
                  </Box>
                ))}
              </InfiniteScroll>
            )}
          </DrawerBody>

          <DrawerFooter className="border-t border-black/[6%] justify-start">
            <Button type="button" variant="outline" onClick={onClose} width="full">
              {t('Close')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
