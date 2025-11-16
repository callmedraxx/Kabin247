import useSWR from 'swr';
import fetcher from '@/lib/fetcher';

const validQueryObj = <T extends Record<string, any>>(query: T): Record<string, string> => {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => Boolean(value) && typeof value === 'string')
  ) as Record<string, string>;
};

function useCategories(url: string, query?: Record<string, string>) {
  const sp = new URLSearchParams(validQueryObj(query || {}));
  const { data, error, isLoading, mutate } = useSWR(`${url}?${sp.toString()}`, fetcher);

  return {
    refresh: mutate,
    categories: data,
    isLoading,
    isError: error,
  };
}

export default useCategories;
