import useSWR from 'swr';
import fetcher from '@/lib/fetcher';

export default function useAuth() {
  const { data, error, isLoading, ...rest } = useSWR(`/api/auth/check`, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    shouldRetryOnError: false,
  });

  return {
    data,
    isLoading,
    error,
    ...rest,
  };
}
