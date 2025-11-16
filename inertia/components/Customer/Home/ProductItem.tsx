import { BaseMenuItem } from '@/types/customer_type';
import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import { Box, Button, Text, useDisclosure } from '@chakra-ui/react';
import { Add } from 'iconsax-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ProductDetails from './ProductDetails';

interface IProps extends BaseMenuItem {}

export default function ProductItem(props: IProps) {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const drawerRef = useRef();

  const { id, name, image, price, discount, discountType, foodType, description } = props;

  const discountedPrice = (price: number, discount: number, type: 'percentage' | 'amount') => {
    return type === 'percentage' ? price - price * discount * 0.01 : price - discount;
  };

  // if product id not exist return null
  if (!id) return null;

  return (
    <div className="h-full w-full @container p-1 max-w-72">
      <Box
        className="relative group w-full sm:max-h-72 p-3 rounded-2xl shadow-item overflow-hidden cursor-pointer bg-white"
        onClick={onOpen}
      >
        <img
          src={image?.url}
          alt={name}
          className="w-full h-[115px] sm:group-hover:h-[115px] sm:h-[165px] object-cover rounded-lg mb-3 transition-all duration-100"
          onError={(e) => (e.currentTarget.src = '/default_fallback.png')}
        />

        <div className="flex justify-between items-center gap-3 mb-2.5 sm:mb-3">
          <div>
            <h4 className="font-medium mb-1 text-sm sm:text-base line-clamp-1">{t(name)}</h4>
            <Text as="p" noOfLines={1} className="text-gray-400 text-sm">
              {t(description)}
            </Text>
          </div>
          {foodType === 'veg' ? (
            <img src="/mark.svg" alt="mark" />
          ) : (
            <img src="/non-veg-mark.svg" alt="mark" />
          )}
        </div>

        <div className="flex items-center gap-3 mb-2.5 sm:mb-4">
          {discount > 0 ? (
            <del className="text-gray-700"> {convertToCurrencyFormat(price)} </del>
          ) : null}
          <span className="text-primary-400 font-semibold">
            {convertToCurrencyFormat(discountedPrice(price, discount, discountType))}
          </span>
          <div className="absolute top-3.5 left-3.5 font-semibold px-2 py-0.5 bg-green-50 text-green-600 text-xs rounded-md">
            <span>
              {t(
                discountType === 'amount'
                  ? `${convertToCurrencyFormat(discount)} off`
                  : `${discount}% off`
              )}
            </span>
          </div>
        </div>
        <Button
          variant="solid"
          colorScheme="primary"
          width="100%"
          leftIcon={<Add size={20} color="currentColor" />}
          className="h-9 sm:h-10 uppercase bg-primary-400 hover:bg-primary-500 rounded-full px-8 text-sm sm:text-base mt-auto"
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
        >
          {t('ADD TO BAG')}
        </Button>
      </Box>
      <ProductDetails isOpen={isOpen} onClose={onClose} drawerRef={drawerRef} menuItem={props} />
    </div>
  );
}
