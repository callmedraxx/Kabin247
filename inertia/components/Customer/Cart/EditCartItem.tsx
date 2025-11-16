import QuantityController from '@/components/common/QuantityController';
import usePOS from '@/data/use_pos';
import fetcher from '@/lib/fetcher';
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
  IconButton,
  Radio,
  RadioGroup,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from '@chakra-ui/react';
import { Edit2 } from 'iconsax-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { match } from 'ts-pattern';

export default function EditCartItem({ ...props }: POSItem) {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data, isLoading } = useSWR(`/api/user/menu-items/global/${props.id}`, fetcher);

  const drawerRef = useRef(null);
  const cart = usePOS();

  const [variantsSelected, setVariantsSelected] = useState<POSItemVariant[]>(props.variants || []);
  const [addonsSelected, setAddonsSelected] = useState<POSItemAddon[]>(props.addons || []);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // calculate total price
    let totalPrice = menuPrice;
    variantsSelected.forEach((variant) => {
      totalPrice += variant.option.reduce((acc: number, opt: any) => acc + opt.price, 0);
    });
    addonsSelected.forEach((addon) => {
      totalPrice += addon.price * addon.quantity;
    });
    totalPrice *= props.quantity;
    setTotal(totalPrice);
  }, [variantsSelected, addonsSelected, props.quantity]);

  const menuPrice = calculateDiscountedPrice(props.price, props.discount, props.discountType);

  const updateItemToCartList = () => {
    const validationErrors = validateRequiredVariants(data?.variants, variantsSelected, t);
    if (validationErrors.length) return;

    const item = {
      ...props,
      quantity: props.quantity,
      variants: variantsSelected,
      addons: addonsSelected,
      total,
    };

    cart.updateItemInPOS(item);
    onClose();
  };

  return (
    <>
      <IconButton
        aria-label="Edit"
        type="button"
        ref={drawerRef}
        onClick={() => {
          onOpen();
        }}
        variant="ghost"
        size="sm"
        className="text-secondary-500 hover:bg-secondary-100 hover:text-blue-500"
      >
        <Edit2 size={16} />
      </IconButton>
      <Drawer
        isOpen={isOpen}
        placement="right"
        size="md"
        onClose={onClose}
        finalFocusRef={drawerRef}
      >
        <DrawerOverlay />
        <DrawerContent className="flex flex-col justify-between">
          {isLoading ? (
            <Flex className="flex-1 items-center justify-center">
              <Spinner />
            </Flex>
          ) : (
            <>
              <DrawerBody className="p-0">
                <div className="py-6 px-4">
                  <div className="flex flex-col lg:flex-row gap-4 mb-4">
                    {/* Menu image */}
                    {data.image?.url && (
                      <img
                        src={data.image.url}
                        alt={data.name}
                        className="w-[250px] h-[165px] object-cover rounded-lg mb-3 transition-all duration-300"
                        onError={(e) => (e.currentTarget.src = '/default_fallback.png')}
                      />
                    )}
                    <div>
                      <h4 className="font-bold text-xl mb-1">{t(data.name)}</h4>
                      <Text as="p" className="text-gray-400">
                        {t(data.description)}
                      </Text>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    {props.discount > 0 && (
                      <del className="text-xl text-gray-700">
                        {convertToCurrencyFormat(data.price)}
                      </del>
                    )}

                    <span className="text-2xl text-primary-400 font-bold">
                      {convertToCurrencyFormat(menuPrice)}
                    </span>
                    <div className="px-4 py-1 bg-green-50 text-green-600 text-sm rounded-full">
                      <span>
                        {props.discountType === 'amount'
                          ? `$${props.discount} `
                          : `${props.discount}% `}
                        {t('off')}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* Variants */}
                    <Flex flexDir="column" rowGap="12px">
                      {data?.variants?.map((variant: any) => (
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
                                    {t(
                                      variant.requirement === 'required'
                                        ? '(Required)'
                                        : '(Optional)'
                                    )}
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
                                  defaultValue={variant.variantOptions[0].id?.toString()}
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
                                          defaultChecked={variantsSelected.some(
                                            (v) =>
                                              v.id === variant.id &&
                                              v.option.some((o) => o.id === opt.id)
                                          )}
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
                                <Text className="text-secondary-500">{t('Empty data')}</Text>
                              ))}
                          </Table>
                        </Box>
                      ))}
                    </Flex>

                    {/* Addons */}
                    {data.addons?.length > 0 && (
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
                            {data?.addons.map((addon: POSItemAddon & { isAvailable: number }) => (
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
                                    defaultChecked={addonsSelected.some((a) => a.id === addon.id)}
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
                                    value={
                                      addonsSelected.find((v) => v.id === addon.id)?.quantity || 1
                                    }
                                    onValueChange={(qnt) =>
                                      cart.setAddonQty(
                                        addon.id,
                                        qnt,
                                        addonsSelected,
                                        setAddonsSelected
                                      )
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
                      value={props?.quantity}
                      onValueChange={(qnt) => cart.setQuantity(props, qnt)}
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
                      onClick={() => onClose()}
                    >
                      {t('Close')}
                    </Button>
                    <Button
                      variant="solid"
                      colorScheme="primary"
                      className="button-primary"
                      onClick={updateItemToCartList}
                    >
                      {t('Update cart')}
                    </Button>
                  </div>
                </div>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
