import React, { ForwardedRef } from 'react';
import { Badge, Box, Button, Text } from '@chakra-ui/react';
import { Add } from 'iconsax-react';
import { useTranslation } from 'react-i18next';
import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import { calculateDiscountedPrice } from '@/utils/calculate_discount';

interface IPOSItemCard {
  name: string;
  description: string;
  image: string;
  price: number;
  discount: number;
  isAvailable: boolean;
  discountType: 'amount' | 'percentage';
  foodType: 'veg' | 'nonVeg';
  onOpen: () => void;
  ref: ForwardedRef<HTMLDivElement>;
}

const POSItemCard = React.forwardRef<HTMLDivElement, IPOSItemCard>((props, ref) => {
  const { t } = useTranslation();

  const { name, description, image, price, discount, discountType, foodType, isAvailable, onOpen } =
    props;

  const discountedPrice = calculateDiscountedPrice(price, discount, discountType);

  if (!isAvailable) return null;

  return (
    <div className="pos-menu-item">
      <Box
        ref={ref}
        as="div"
        className="relative p-3 m-2 bg-white rounded-2xl shadow-item overflow-hidden cursor-pointer"
        onClick={onOpen}
      >
        {discount ? (
          <Badge variant="subtle" colorScheme="green" className="absolute top-4 left-4">
            {discountType === 'amount' ? `${convertToCurrencyFormat(discount)}` : `${discount}%`}{' '}
            {t('off')}
          </Badge>
        ) : null}
        <img
          src={image || '/default_fallback.png'}
          alt={name || t('Menu item')}
          data-cover-image
          className="w-full object-cover rounded-lg mb-2 transition-all duration-300"
          onError={(e) => (e.currentTarget.src = '/default_fallback.png')}
        />

        <div className="flex justify-between items-center gap-3 mb-3">
          <div className="pb-1">
            <Text as="h4" noOfLines={1} className="font-medium">
              {name}
            </Text>
            <Text as="p" noOfLines={1} className="text-gray-400 text-sm">
              {description}
            </Text>
          </div>

          {foodType === 'veg' ? (
            <img src="/mark.svg" alt="Vag" />
          ) : (
            <img src="/non-veg-mark.svg" alt="Non veg" />
          )}
        </div>

        <div className="flex items-center gap-3 mb-3 pb-1">
          {discount ? <del className="text-gray-700">{convertToCurrencyFormat(price)}</del> : null}
          <span className="text-primary-400 font-semibold">
            {convertToCurrencyFormat(discountedPrice)}
          </span>
        </div>

        <Button
          variant="solid"
          size="sm"
          colorScheme="primary"
          width="100%"
          leftIcon={<Add size={16} color="currentColor" />}
          className="uppercase bg-primary-400 hover:bg-primary-500 rounded-full px-8"
          onClick={onOpen}
        >
          {t('Add')}
        </Button>
      </Box>
    </div>
  );
});

POSItemCard.displayName = 'POSItemCard';

export default POSItemCard;
