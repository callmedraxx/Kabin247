import useSWR from 'swr';
import fetcher from '@/lib/fetcher';

export default function useSchedules() {
  const { data, error, isLoading, mutate } = useSWR('/api/schedules', fetcher);

  return {
    data,
    refresh: mutate,
    isLoading,
    error,
  };
}
