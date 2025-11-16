import fetcher from '@/lib/fetcher';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';

export default function useNotifications() {
  const PAGE_DATA_LIMIT = 10;

  // get notification data
  const { data, isLoading, size, setSize, mutate } = useSWRInfinite(
    (idx) => `/notifications?page=${idx + 1}&limit=${PAGE_DATA_LIMIT}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  // get unread notifications count
  const {
    data: unreadCount,
    isLoading: countLoading,
    mutate: unreadCountMutate,
  } = useSWR('/notifications/count/unread-all', fetcher);

  return {
    data,
    isLoading: isLoading || countLoading,
    size,
    setSize,
    refresh: () => {
      mutate();
      unreadCountMutate();
    },
    unreadCount: unreadCount?.total,
  };
}
