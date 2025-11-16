import QuantityController from '@/components/common/QuantityController';
import fetcher from '@/lib/fetcher';
import { convertToCurrencyFormat } from '@/utils/currency_formatter';
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
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
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
import { Add, Edit2, Minus } from 'iconsax-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { match } from 'ts-pattern';
import { calculateDiscountedPrice } from '@/utils/calculate_discount';
import { POSItem, POSItemAddon, POSItemVariant } from '@/types/pos_type';
import usePOS from '@/data/use_pos';
import { validateRequiredVariants } from '@/utils/validate_required_variants';

export default function EditPOSItem({ ...props }: POSItem) {
  const pos = usePOS();
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data, isLoading } = useSWR(`/api/menu-items/${props.id}`, fetcher);

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

  // drawer reference button
  const btnRef = useRef<HTMLButtonElement>(null);

  // menu price
  const menuPrice = calculateDiscountedPrice(props.price, props.discount, props.discountType);

  const updateItemToPOSList = () => {
    const validationErrors = validateRequiredVariants(data?.variants, variantsSelected, t);
    if (validationErrors.length) return;

    const item = {
      ...props,
      quantity: props.quantity,
      variants: variantsSelected,
      addons: addonsSelected,
      subTotal: total / props.quantity,
      total,
    };
    pos.updateItemInPOS(item);
    onClose();
  };

  return (
    <>
      <IconButton
        aria-label="Edit"
        type="button"
        ref={btnRef}
        onClick={() => {
          onOpen();
        }}
        variant="ghost"
        size="sm"
        className="text-secondary-500 hover:bg-secondary-100 hover:text-blue-500"
      >
        <Edit2 size={16} />
      </IconButton>

      {/* POS Item drawer */}
      <Drawer isOpen={isOpen} placement="right" size="md" onClose={onClose} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent>
          {isLoading ? (
            <Flex className="flex-1 items-center justify-center">
              <Spinner />
            </Flex>
          ) : (
            <>
              <DrawerBody className="px-4 py-6 flex flex-col gap-3">
                <div>
                  {/* Menu image */}
                  <div className="aspect-[3/2] bg-secondary-100 w-[15.625rem] rounded-[4px] mb-6">
                    {data?.image.url ? (
                      <img
                        src={data?.image.url}
                        alt={data?.name}
                        className="object-fill rounded-[4px]"
                        onError={(e) => (e.currentTarget.src = '/default_fallback.png')}
                      />
                    ) : null}
                  </div>

                  {/* menu title */}
                  <div className="flex flex-col gap-y-1">
                    <Text
                      as="h3"
                      fontSize={20}
                      lineHeight={7}
                      fontWeight={600}
                      color="secondary.900"
                    >
                      {t(data?.name)}
                    </Text>
                    <Text
                      as="p"
                      fontSize={16}
                      lineHeight={6}
                      fontWeight={400}
                      color="secondary.400"
                    >
                      {t(data?.description)}
                    </Text>

                    {/* Menu Price */}
                    <Flex columnGap="12px" alignItems="end">
                      {props?.discount ? (
                        <Text
                          as="h3"
                          fontSize={20}
                          lineHeight={7}
                          fontWeight={400}
                          color="secondary.600"
                        >
                          <del>{convertToCurrencyFormat(data?.price)}</del>
                        </Text>
                      ) : null}

                      <Text
                        as="h2"
                        fontSize={24}
                        lineHeight={8}
                        fontWeight={700}
                        color="primary.500"
                      >
                        <span> {convertToCurrencyFormat(menuPrice)} </span>
                      </Text>

                      {props?.discount ? (
                        <Text
                          as="span"
                          fontSize={16}
                          lineHeight={6}
                          fontWeight={400}
                          color="green.500"
                        >
                          {t('Discount')}:{' '}
                          {props.discountType === 'amount'
                            ? `${convertToCurrencyFormat(props.discount)}`
                            : `${props.discount}%`}
                        </Text>
                      ) : null}
                    </Flex>
                  </div>
                </div>

                {/* variants */}
                <Flex flexDir="column" rowGap="12px">
                  {data?.variants.map((variant: any) => (
                    <Box
                      key={variant.id}
                      border="1px"
                      borderColor="secondary.200"
                      py="12px"
                      rounded="6px"
                    >
                      <div className="w-full overflow-x-auto">
                        <Table variant="striped" size="sm">
                          <Thead className="[&>tr>th]:px-6 [&>tr>th]:py-1.5">
                            <Tr>
                              <Th textTransform="capitalize" className="flex items-center gap-2">
                                <Text as="h3" fontWeight={500} lineHeight={7} fontSize={20}>
                                  {variant.name}
                                </Text>
                                <span className="text-secondary-600 text-sm leading-5 font-normal">
                                  {t(
                                    variant.requirement === 'required' ? '(Required)' : '(Optional)'
                                  )}
                                </span>
                              </Th>

                              <Th isNumeric textTransform="capitalize" w="150px">
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
                                  pos.selectVariant(
                                    variantOption,
                                    'radio',
                                    variantsSelected,
                                    setVariantsSelected
                                  );
                                }}
                                as={Tbody}
                                className="[&>tr>td]:px-6 [&>tr>td]:py-1.5"
                                name={variant.value}
                                colorScheme="green"
                              >
                                {variant?.variantOptions?.map((opt: any) => (
                                  <Tr key={opt.id}>
                                    <Td className="text-sm">
                                      <Radio
                                        colorScheme="green"
                                        className="border-black/15"
                                        value={opt.id?.toString()}
                                      >
                                        <Text fontSize={14}>{t(opt.name)}</Text>
                                      </Radio>
                                    </Td>
                                    <Td isNumeric className="text-sm">
                                      {convertToCurrencyFormat(opt.price)}
                                    </Td>
                                  </Tr>
                                ))}
                              </RadioGroup>
                            ))

                            // if multiple selection allow render with checkbox
                            .with({ allowMultiple: 1 }, () => (
                              <Tbody className="[&>tr>td]:px-6 [&>tr>td]:py-1.5">
                                {variant?.variantOptions?.map((opt: any) => (
                                  <Tr key={opt.id}>
                                    <Td className="text-sm">
                                      <Checkbox
                                        colorScheme="green"
                                        value={opt.id?.toString()}
                                        className="[&>span]:border-black/15"
                                        defaultChecked={variantsSelected.some(
                                          (v) =>
                                            v.id === variant.id &&
                                            v.option.some((o) => o.id === opt.id)
                                        )}
                                        onChange={() => {
                                          const variantOption = {
                                            id: variant.id,
                                            name: variant.name,
                                            option: [opt],
                                          };
                                          pos.selectVariant(
                                            variantOption,
                                            'checkbox',
                                            variantsSelected,
                                            setVariantsSelected
                                          );
                                        }}
                                      >
                                        <Text fontSize={14}>{t(opt.name)}</Text>
                                      </Checkbox>
                                    </Td>
                                    <Td isNumeric className="text-sm">
                                      {convertToCurrencyFormat(opt.price)}
                                    </Td>
                                  </Tr>
                                ))}
                              </Tbody>
                            ))
                            .otherwise(() => null)}
                        </Table>
                      </div>
                    </Box>
                  ))}
                </Flex>

                {/* Addons */}
                <Box border="1px" borderColor="secondary.200" py="12px" rounded="6px">
                  <div className="w-full overflow-x-auto">
                    <Table variant="striped" size="sm">
                      <Thead className="[&>tr>th]:px-6 [&>tr>th]:py-1.5">
                        <Tr>
                          <Th
                            textTransform="capitalize"
                            className="flex items-center gap-2"
                            w="full"
                          >
                            <Text as="h3" fontWeight={500} lineHeight={7} fontSize={20}>
                              {t('Addons')}
                            </Text>
                          </Th>

                          <Th textTransform="capitalize" w="150px" textAlign="center">
                            {t('QTY')}
                          </Th>

                          <Th isNumeric textTransform="capitalize" w="150px">
                            {t('Price')}
                          </Th>
                        </Tr>
                      </Thead>

                      <Tbody className="[&>tr>td]:px-6 [&>tr>td]:py-[1px]">
                        {data?.addons.map((addon: POSItemAddon & { isAvailable: number }) => (
                          <Tr
                            key={addon.id}
                            data-disabled={!addon.isAvailable}
                            className="data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 select-none"
                          >
                            <Td className="text-sm w-full">
                              <Checkbox
                                colorScheme="green"
                                value={addon.id?.toString()}
                                className="[&>span]:border-black/15"
                                disabled={!addon.isAvailable}
                                defaultChecked={addonsSelected.some((a) => a.id === addon.id)}
                                onChange={() =>
                                  pos.selectAddon(addon, addonsSelected, setAddonsSelected)
                                }
                              >
                                <Text fontSize={14}>{t(addon.name)}</Text>
                              </Checkbox>
                            </Td>

                            <Td className="text-sm" w="150px">
                              <QuantityController
                                value={addonsSelected.find((v) => v.id === addon.id)?.quantity || 1}
                                disabled={!addonsSelected.find((a) => a.id === addon.id)}
                                onValueChange={(qnt) =>
                                  pos.setAddonQty(addon.id, qnt, addonsSelected, setAddonsSelected)
                                }
                              />
                            </Td>

                            <Td isNumeric className="text-sm">
                              {convertToCurrencyFormat(addon.price)}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </div>
                </Box>
              </DrawerBody>

              <DrawerFooter className="p-4 pt-2 flex-col items-stretch border-t border-black/[8%] shadow-[0_1px_2px_rgba(0,0,0,0.1),0_-1px_3px_rgba(0,0,0,0.1)]">
                <FormControl className="px-4">
                  <FormLabel color="secondary.500">{t('Quantity')}</FormLabel>
                  <HStack spacing={0}>
                    <IconButton
                      aria-label="DecrementMenuQuantity"
                      type="button"
                      roundedRight="0"
                      onClick={() => pos.setQuantity(props, props.quantity > 1 ? props.quantity - 1 : 1)}
                    >
                      <Minus />
                    </IconButton>
                    <Input
                      fontSize="1.5rem"
                      fontWeight={700}
                      lineHeight="30px"
                      rounded="0"
                      min={1}
                      type="number"
                      textAlign="center"
                      value={props.quantity}
                      onChange={(e) => pos.setQuantity(props, Math.max(1, +e.target.value))}
                      onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.select()}
                    />
                    <IconButton
                      aria-label="IncrementMenuQuantity"
                      type="button"
                      roundedLeft="0"
                      onClick={() => pos.setQuantity(props, props.quantity + 1)}
                    >
                      <Add />
                    </IconButton>
                  </HStack>
                </FormControl>

                <div className="flex items-center justify-between px-4 py-1 my-4">
                  <h4 className="text-lg font-normal"> {t('Total')}: </h4>
                  <h3 className="text-xl font-bold">{convertToCurrencyFormat(total)}</h3>
                </div>

                <div className="flex items-center px-4">
                  <Button variant="outline" w="full" mr={3} onClick={onClose}>
                    {t('Cancel')}
                  </Button>
                  <Button
                    type="button"
                    variant="solid"
                    colorScheme="blue"
                    w="full"
                    onClick={updateItemToPOSList}
                  >
                    {t('Update')}
                  </Button>
                </div>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
