import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import { Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

// Most ordered product card
export default function ProductCard({
  product,
  timePeriod,
}: {
  product?: Record<string, any> | null;
  timePeriod?: string;
}) {
  const { t } = useTranslation();

  // calculate discounted price
  const discountedPrice = (
    price: number,
    discount: number,
    discountType: 'amount' | 'percentage'
  ) => {
    if (discountType === 'amount') {
      return price - discount;
    }
    return price - price * discount * 0.01;
  };

  if (!product || product.menuItem === null) return null;

  return (
    <div className="p-4 rounded-lg bg-white border-none border-t border-gray-200 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.06),0px_1px_3px_0px_rgba(0,0,0,0.1)]">
      <div className="relative flex flex-col gap-1">
        <h4 className="text-lg font-semibold text-secondary-900">{t('Most ordered product')}</h4>
        {timePeriod && <p className="text-base text-secondary-500 mb-3.5"> {timePeriod} </p>}

        <div className="mb-3.5">
          <div className="relative rounded w-full aspect-[3/2] overflow-hidden">
            <img
              src={product?.menuItem?.image?.url}
              alt={product?.menuItem?.name}
              width={300}
              height={300}
              className="rounded absolute top-0 left-0 inset-0 w-full h-full object-cover"
              onError={(e) => (e.currentTarget.src = '/default_fallback.png')}
            />
          </div>
        </div>

        <h3 className="text-secondary-900 text-xl font-semibold">{t(product?.menuItem?.name)}</h3>

        <Text as="p" className="text-secondary-400 text-sm">
          {t(product?.menuItem?.description)}
        </Text>

        <div className="flex gap-3">
          <Text as="del" className="text-xl font-normal text-secondary-600">
            {convertToCurrencyFormat(product?.menuItem?.price)}
          </Text>
          <Text as="h2" className="text-2xl font-bold text-primary-500">
            {convertToCurrencyFormat(
              discountedPrice(
                product?.menuItem?.price,
                product?.menuItem?.discount,
                product?.menuItem?.discountType
              )
            )}
          </Text>
        </div>
      </div>
    </div>
  );
}
