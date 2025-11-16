import QuantityController from '@/components/common/QuantityController';
import usePOS from '@/data/use_pos';
import { BaseMenuItem } from '@/types/customer_type';
import { POSItem, POSItemAddon, POSItemVariant } from '@/types/pos_type';
import { calculateDiscountedPrice } from '@/utils/calculate_discount';
import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import { validateRequiredVariants } from '@/utils/validate_required_variants';
import {
  Box,
  Button,
  Checkbox,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  Flex,
  Radio,
  RadioGroup,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';

type ProductDetailsProps = {
  isOpen: boolean;
  onClose: () => void;
  drawerRef: any;
  menuItem: BaseMenuItem;
};

export default function ProductDetails({
  isOpen,
  onClose,
  drawerRef,
  menuItem,
}: ProductDetailsProps) {
  const { t } = useTranslation();

  const [qty, setQty] = useState(1);
  const [variantsSelected, setVariantsSelected] = useState<POSItemVariant[]>([]);
  const [addonsSelected, setAddonsSelected] = useState<POSItemAddon[]>([]);
  const [total, setTotal] = useState(0);
  const cart = usePOS();

  // menu price
  const menuPrice = calculateDiscountedPrice(
    menuItem.price,
    menuItem.discount,
    menuItem.discountType
  );

  useEffect(() => {
    // calculate total price
    let totalPrice = menuPrice;
    variantsSelected.forEach((variant) => {
      totalPrice += variant.option.reduce((acc: number, opt: any) => acc + opt.price, 0);
    });
    addonsSelected.forEach((addon) => {
      totalPrice += addon.price * addon.quantity;
    });
    totalPrice *= qty;
    setTotal(totalPrice);
  }, [variantsSelected, addonsSelected, qty]);

  const resetState = () => {
    setQty(1);
    setVariantsSelected([]);
    setAddonsSelected([]);
  };

  const itemAddToCart = () => {
    const validationErrors = validateRequiredVariants(menuItem?.variants, variantsSelected, t);
    if (validationErrors.length) return;

    const item: POSItem = {
      id: menuItem.id,
      name: menuItem.name,
      description: menuItem.description,
      image: menuItem.image,
      charges: menuItem.charges,
      price: menuPrice,
      discount: menuItem.discount,
      discountType: menuItem.discountType,
      variants: variantsSelected,
      addons: addonsSelected,
      quantity: qty,
      subTotal: total / qty,
      total: total,
    };

    if (cart.POSItems.find((i) => i.id === item.id)) {
      cart.updateItemInPOS(item);
    } else {
      cart.addItemToPOS(item);
    }

    resetState();
    onClose();
  };

  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      size="md"
      onClose={() => {
        onClose();
        resetState();
      }}
      finalFocusRef={drawerRef}
    >
      <DrawerOverlay />
      <DrawerContent className="flex flex-col justify-between">
        <DrawerBody className="p-0">
          <div className="py-6 px-4">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              {/* Menu image */}
              {menuItem.image?.url && (
                <img
                  src={menuItem.image.url}
                  alt={menuItem.name}
                  className="w-[250px] h-[165px] object-cover rounded-lg mb-3 transition-all duration-300"
                  onError={(e) => (e.currentTarget.src = '/default_fallback.png')}
                />
              )}
              <div>
                <h4 className="font-bold text-xl mb-1">{t(menuItem.name)}</h4>
                <Text as="p" className="text-gray-400">
                  {t(menuItem.description)}
                </Text>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-3">
              {menuItem.discount > 0 && (
                <del className="text-xl text-gray-700">
                  {convertToCurrencyFormat(menuItem.price)}
                </del>
              )}

              <span className="text-2xl text-primary-400 font-bold">
                {convertToCurrencyFormat(menuPrice)}
              </span>
              <div className="px-4 py-1 bg-green-50 text-green-600 text-sm rounded-full">
                <span>
                  {menuItem.discountType === 'amount'
                    ? `$${menuItem.discount} `
                    : `${menuItem.discount}% `}
                  {t('off')}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {/* Variants */}
              <Flex flexDir="column" rowGap="12px">
                {menuItem?.variants?.map((variant: any) => (
                  <Box
                    key={variant.id}
                    border="1px"
                    borderColor="secondary.200"
                    py="12px"
                    rounded="2xl"
                    fontFamily="inter"
                  >
                    <Table variant="simple" size="sm">
                      <Thead className=" [&>tr>th]:px-6 [&>tr>th]:py-1.5 [&>tr>th]:border-none">
                        <Tr>
                          <Th
                            textTransform="capitalize"
                            className="flex items-center gap-2 font-inter"
                          >
                            <Text
                              as="h3"
                              fontWeight={500}
                              lineHeight={7}
                              fontSize={20}
                              className="text-secondary-900"
                            >
                              {t(variant.name)}
                            </Text>
                            <span className="text-secondary-600 text-sm leading-5 font-normal">
                              {t(variant.requirement === 'required' ? '(Required)' : '(Optional)')}
                            </span>
                          </Th>

                          <Th isNumeric w="150px" className="text-secondary-900 font-inter">
                            {t('Price')}
                          </Th>
                        </Tr>
                      </Thead>

                      {match(variant)
                        // if multiple selection not allow render with radio group
                        .with({ allowMultiple: 0 }, () => (
                          <RadioGroup
                            onChange={(id) => {
                              const variantOption = {
                                id: variant.id,
                                name: variant.name,
                                option: variant.variantOptions.find(
                                  (option: any) => option.id?.toString() === id
                                ),
                              };

                              cart.selectVariant(
                                variantOption,
                                'radio',
                                variantsSelected,
                                setVariantsSelected
                              );
                            }}
                            as={Tbody}
                            className="[&>tr>td]:border-none [&>tr>td]:px-6 [&>tr>td]:py-1.5"
                            name={variant.value}
                            colorScheme="blue"
                          >
                            {variant?.variantOptions?.map((opt: any) => (
                              <Tr key={opt.id} className="odd:bg-secondary-50">
                                <Td className="text-sm">
                                  <Radio
                                    colorScheme="blue"
                                    className="border-black/15"
                                    value={opt.id?.toString()}
                                  >
                                    <Text fontSize={14} className="text-black">
                                      {t(opt.name)}
                                    </Text>
                                  </Radio>
                                </Td>
                                <Td isNumeric className="text-sm text-secondary-700">
                                  {convertToCurrencyFormat(opt.price)}
                                </Td>
                              </Tr>
                            ))}
                          </RadioGroup>
                        ))

                        // if multiple selection allow render with checkbox
                        .with({ allowMultiple: 1 }, () => (
                          <Tbody className="[&>tr>td]:px-6 [&>tr>td]:py-1.5 [&>tr>td]:border-none">
                            {variant?.variantOptions?.map((opt: any) => (
                              <Tr key={opt.id} className="odd:bg-secondary-50">
                                <Td className="text-sm">
                                  <Checkbox
                                    colorScheme="blue"
                                    value={opt.id?.toString()}
                                    className="[&>span]:border-black/15"
                                    onChange={() => {
                                      const variantOption = {
                                        id: variant.id,
                                        name: variant.name,
                                        option: [opt],
                                      };

                                      cart.selectVariant(
                                        variantOption,
                                        'checkbox',
                                        variantsSelected,
                                        setVariantsSelected
                                      );
                                    }}
                                  >
                                    <Text fontSize={14} className="text-black">
                                      {t(opt.name)}
                                    </Text>
                                  </Checkbox>
                                </Td>
                                <Td isNumeric className="text-sm text-secondary-700">
                                  {convertToCurrencyFormat(opt.price)}
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        ))
                        .otherwise(() => (
                          <Text className="text-secondary-500"> {t('Empty data')} </Text>
                        ))}
                    </Table>
                  </Box>
                ))}
              </Flex>

              {/* Addons */}
              {menuItem.addons?.length > 0 && (
                <Box
                  border="1px"
                  borderColor="secondary.200"
                  py="12px"
                  rounded="2xl"
                  className="w-full overflow-x-auto"
                >
                  <Table variant="simple" size="sm">
                    <Thead className="[&>tr>th]:px-6 [&>tr>th]:py-1.5 [&>tr>th]:border-none">
                      <Tr>
                        <Th
                          textTransform="capitalize"
                          className="flex items-center gap-2 text-secondary-900"
                          w="full"
                        >
                          <Text as="h3" fontWeight={500} lineHeight={7} fontSize={20}>
                            {t('Addons')}
                          </Text>
                        </Th>

                        <Th
                          textTransform="uppercase"
                          w="150px"
                          textAlign="center"
                          className="text-secondary-900"
                        >
                          {t('QTY')}
                        </Th>

                        <Th
                          isNumeric
                          textTransform="uppercase"
                          w="150px"
                          className="font-inter text-secondary-900"
                        >
                          {t('Price')}
                        </Th>
                      </Tr>
                    </Thead>

                    <Tbody className="[&>tr>td]:px-6 [&>tr>td]:py-1.5 [&>tr>td]:border-none">
                      {menuItem?.addons.map((addon: POSItemAddon & { isAvailable: number }) => (
                        <Tr
                          key={addon.id}
                          data-disabled={!addon.isAvailable}
                          className="data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 select-none odd:bg-secondary-50"
                        >
                          <Td className="text-sm w-full">
                            <Checkbox
                              colorScheme="blue"
                              value={addon.id?.toString()}
                              className="[&>span]:border-black/15"
                              disabled={!addon.isAvailable}
                              onChange={() => {
                                cart.selectAddon(addon, addonsSelected, setAddonsSelected);
                              }}
                            >
                              <Text fontSize={14}>{t(addon.name)}</Text>
                            </Checkbox>
                          </Td>

                          <Td className="text-sm" w="150px">
                            <QuantityController
                              disabled={!addon.isAvailable}
                              value={addonsSelected.find((v) => v.id === addon.id)?.quantity || 1}
                              onValueChange={(qnt) =>
                                cart.setAddonQty(addon.id, qnt, addonsSelected, setAddonsSelected)
                              }
                              decrementButtonClassName="text-black bg-white border border-black/15 rounded-full w-8 h-8 hover:text-white"
                              incrementButtonClassName="text-black bg-white border border-black/15 rounded-full w-8 h-8 hover:text-white"
                              className="font-medium"
                            />
                          </Td>

                          <Td isNumeric className="text-sm">
                            {convertToCurrencyFormat(addon.price)}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </div>
          </div>
        </DrawerBody>

        <DrawerFooter className="p-0 block">
          <div className="py-2 px-4 shadow-primary border-t border-t-black/10">
            <p className="mb-2 text-center text-secondary-500 text-sm">{t('Quantity')}</p>
            <div className="flex justify-center items-center gap-4">
              <QuantityController
                value={qty}
                onValueChange={(qnt) => setQty(qnt)}
                decrementButtonClassName="text-black bg-white border border-black/15 rounded-full min-w-14 min-h-14 aspect-square hover:text-white [&>svg]:size-6"
                incrementButtonClassName="text-black bg-white border border-black/15 rounded-full min-w-14 min-h-14 aspect-square hover:text-white [&>svg]:size-6"
                containerClassName="h-14"
                className="font-medium h-14 text-lg"
              />
            </div>
            <div className="flex justify-between items-center py-2 border-b border-black/5 px-4">
              <p className="text-lg">{t('Total')}</p>
              <p className="text-xl font-bold">{convertToCurrencyFormat(total)}</p>
            </div>
            <div className="flex gap-4 items-center justify-center pt-3">
              <Button
                variant="outline"
                colorScheme="secondary"
                className="button-outline"
                onClick={() => {
                  onClose();
                  resetState();
                }}
              >
                {t('Close')}
              </Button>
              <Button
                variant="solid"
                colorScheme="primary"
                className="button-primary"
                onClick={itemAddToCart}
              >
                {t('Add to bag')}
              </Button>
            </div>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
