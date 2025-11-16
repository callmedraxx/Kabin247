import useSWR from 'swr';
import fetcher from '@/lib/fetcher';

export default function useUserSingle(id: number) {
  const { data, error, isLoading } = useSWR(`/api/users/${id}`, fetcher);

  return {
    data,
    isLoading,
    error,
  };
}
