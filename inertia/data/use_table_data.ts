import useSWR from 'swr';
import fetcher from '@/lib/fetcher';

const validQueryObj = <T extends Record<string, any>>(query: T): Record<string, string> => {
  return Object.fromEntries(
    Object.entries(query)
      .filter(([, value]) => Boolean(value))
      .map(([key, value]) => [key, String(value)])
  ) as Record<string, string>;
};

export default function useTableData(url: string, query?: Record<string, any>) {
  const sp = new URLSearchParams(validQueryObj(query || {}));
  const { data, error, isLoading, mutate, ...rest } = useSWR(
    () => (url ? `${url}?${sp.toString()}`.toString() : null),
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    refresh: mutate,
    items: data?.data || data?.results || [],
    meta: data?.meta || { perPage: 10, total: 0 },
    isLoading,
    isError: error,
    ...rest,
  };
}
