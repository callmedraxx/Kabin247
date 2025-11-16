import fetcher from '@/lib/fetcher';
import { BaseMenuItem } from '@/types/customer_type';
import { HStack, IconButton, Link, Spinner } from '@chakra-ui/react';
import { ArrowLeft } from 'iconsax-react';
import useSWR from 'swr';
import ProductItem from './ProductItem';
import Empty from '@/components/common/Empty';
import { useTranslation } from 'react-i18next';

export default function MenuItemByCategory({ categoryId }: { categoryId: string | number }) {
  const { t } = useTranslation();
  const { data, isLoading } = useSWR(`/api/user/categories/global/${categoryId}`, fetcher);

  // loading
  if (isLoading) {
    return (
      <div className="py-10 container">
        <HStack className="justify-center">
          <Spinner />
        </HStack>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="container">
        <div className="flex items-center gap-4 py-9">
          <IconButton
            as={Link}
            href="/user/my-orders"
            aria-label="left arrow"
            className="rounded-full min-w-12 min-h-12 bg-transparent border border-secondary-200"
          >
            <ArrowLeft />
          </IconButton>
          <h2 className="text-2xl">{t(data?.name)}</h2>
        </div>

        {data?.menuItems?.length ? (
          <div className="@container w-full">
            <div className="grid grid-cols-1 @sm:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-4 @7xl:grid-cols-5 gap-5">
              {data?.menuItems?.map((item: BaseMenuItem) => (
                <ProductItem key={item.id} {...item} />
              ))}
            </div>
          </div>
        ) : (
          <Empty />
        )}
      </div>
    </div>
  );
}
