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
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import QuantityController from '@/components/common/QuantityController';
import { Add, Minus } from 'iconsax-react';
import POSItemCard from './POSItemCard';
import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import { calculateDiscountedPrice } from '@/utils/calculate_discount';
import usePOS from '@/data/use_pos';
import { POSItemVariant, POSItemAddon } from '@/types/pos_type';
import { validateRequiredVariants } from '@/utils/validate_required_variants';

interface IPOSItemProps extends Record<string, any> {
  id: number;
  name: string;
  description: string;
  price: number;
  image: Record<string, any> & {
    url?: string;
  };
  variants: Record<string, any>;
}

export default function POSItem({
  id,
  name,
  description,
  price,
  image,
  variants,
  isCompactMode = false,
  ...props
}: IPOSItemProps & { isCompactMode?: boolean }) {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [qty, setQty] = useState(1);
  const [variantsSelected, setVariantsSelected] = useState<POSItemVariant[]>([]);
  const [addonsSelected, setAddonsSelected] = useState<POSItemAddon[]>([]);
  const [total, setTotal] = useState(0);
  const pos = usePOS();

  // drawer reference button
  const btnRef = useRef<HTMLDivElement>(null);

  // menu price
  const menuPrice = calculateDiscountedPrice(price, props.discount, props.discountType);

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

  // Add the current item to the POS item list.
  const addItemToPOSList = () => {
    const validationErrors = validateRequiredVariants(variants, variantsSelected, t);

    if (validationErrors.length) return;

    // Add the current item to the POS item list.
    pos.addItemToPOS({
      id,
      name,
      description,
      price,
      charges: props.charges,
      image,
      discount: props.discount,
      discountType: props.discountType,
      variants: variantsSelected,
      addons: addonsSelected,
      subTotal: total / qty,
      quantity: qty,
      total,
    });

    resetState();
    onClose();
  };
  
  // If in compact mode (table), just return a button with the drawer
  if (isCompactMode) {
    return (
      <>
        <Button
          size="sm"
          colorScheme="blue"
          leftIcon={<Add size={16} color="currentColor" />}
          onClick={onOpen}
        >
          {t('Add')}
        </Button>

        {/* POS Item drawer for compact mode */}
        <Drawer
          isOpen={isOpen}
          placement="right"
          size="md"
          onClose={() => {
            onClose();
            resetState();
          }}
          finalFocusRef={btnRef}
        >
          <DrawerOverlay />
          <DrawerContent>
            {/* drawer body */}
            <DrawerBody className="px-4 py-6 flex flex-col gap-3 flex-1">
              <div>
                {/* Menu image */}
                <div className="aspect-[3/2] bg-secondary-100 w-[15.625rem] rounded-[4px] mb-6">
                  <img
                    src={image?.url || '/default_fallback.png'}
                    alt={name || t('Menu item')}
                    className="object-fill rounded-[4px]"
                    onError={(e) => (e.currentTarget.src = '/default_fallback.png')}
                  />
                </div>

                {/* menu title */}
                <div className="flex flex-col gap-y-1">
                  <Text as="h3" fontSize={20} lineHeight={7} fontWeight={600} color="secondary.900">
                    {name}
                  </Text>
                  <Text as="p" fontSize={16} lineHeight={6} fontWeight={400} color="secondary.400">
                    {description}
                  </Text>

                  {/* Menu Price */}
                  <Flex columnGap="12px" alignItems="end">
                    {props.discount ? (
                      <Text
                        as="h3"
                        fontSize={20}
                        lineHeight={7}
                        fontWeight={400}
                        color="secondary.600"
                      >
                        <del>{convertToCurrencyFormat(price)}</del>
                      </Text>
                    ) : null}

                    <Text as="h2" fontSize={24} lineHeight={8} fontWeight={700} color="primary.500">
                      <span> {convertToCurrencyFormat(menuPrice)} </span>
                    </Text>

                    {props.discount ? (
                      <Text as="span" fontSize={16} lineHeight={6} fontWeight={400} color="green.500">
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
              {variants?.length > 0 && (
                <Flex flexDir="column" rowGap="12px">
                  {variants?.map((variant: any) => (
                    <Box
                      key={variant.id}
                      border="1px"
                      borderColor="secondary.200"
                      py="8px"
                      rounded="6px"
                      className="w-full overflow-x-auto"
                    >
                      <Table variant="striped" size="sm">
                        <Thead className="[&>tr>th]:px-6 [&>tr>th]:py-1.5">
                          <Tr>
                            <Th textTransform="capitalize" className="flex items-center gap-1">
                              <Text as="h3" fontWeight={500} fontSize={16}>
                                {variant.name}
                              </Text>
                              <span className="text-secondary-600 text-sm leading-5 font-normal">
                                {variant.requirement === 'required'
                                  ? `(${t('Required')})`
                                  : `(${t('Optional')})`}
                              </span>
                            </Th>

                            <Th isNumeric textTransform="uppercase" w="150px">
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
                                      <Text fontSize={14}>{opt.name}</Text>
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
                          .otherwise(() => (
                            <Text className="text-secondary-500"> {t('Empty data')} </Text>
                          ))}
                      </Table>
                    </Box>
                  ))}
                </Flex>
              )}

              {/* Addons */}
              {props.addons?.length > 0 && (
                <Box
                  border="1px"
                  borderColor="secondary.200"
                  py="8px"
                  rounded="6px"
                  className="w-full"
                >
                  <div className="w-full overflow-x-auto">
                    <Table variant="striped" size="sm">
                      <Thead className="[&>tr>th]:px-6 [&>tr>th]:py-1.5">
                        <Tr>
                          <Th textTransform="capitalize" className="flex items-center gap-2" w="full">
                            <Text as="h3" fontWeight={500} fontSize={16}>
                              {t('Addons')}
                            </Text>
                          </Th>

                          <Th textTransform="uppercase" w="150px" textAlign="center">
                            {t('QTY')}
                          </Th>

                          <Th isNumeric textTransform="uppercase" w="150px">
                            {t('Price')}
                          </Th>
                        </Tr>
                      </Thead>

                      <Tbody className="[&>tr>td]:px-6 [&>tr>td]:py-[1px]">
                        {props?.addons.map((addon: POSItemAddon & { isAvailable: number }) => (
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
                                onChange={() =>
                                  pos.selectAddon(addon, addonsSelected, setAddonsSelected)
                                }
                              >
                                <Text fontSize={14}>{addon.name}</Text>
                              </Checkbox>
                            </Td>

                            <Td className="text-sm" w="150px">
                              <QuantityController
                                value={addonsSelected.find((v) => v.id === addon.id)?.quantity || 1}
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
              )}
            </DrawerBody>

            <DrawerFooter className="p-4 pt-2 flex-col items-stretch border-t border-black/[8%] shadow-[0_1px_2px_rgba(0,0,0,0.1),0_-1px_3px_rgba(0,0,0,0.1)]">
              <FormControl className="px-4">
                <FormLabel color="secondary.500">{t('Quantity')}</FormLabel>
                <HStack spacing={0}>
                  <IconButton
                    aria-label="DecrementMenuQuantity"
                    type="button"
                    roundedRight="0"
                    onClick={() => setQty(qty > 1 ? qty - 1 : 1)}
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
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, +e.target.value))}
                    onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.select()}
                  />
                  <IconButton
                    aria-label="IncrementMenuQuantity"
                    type="button"
                    roundedLeft="0"
                    onClick={() => setQty(qty + 1)}
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
                <Button
                  variant="outline"
                  w="full"
                  mr={3}
                  onClick={() => {
                    onClose();
                    resetState();
                  }}
                >
                  {t('Cancel')}
                </Button>
                <Button
                  type="button"
                  variant="solid"
                  colorScheme="blue"
                  w="full"
                  onClick={addItemToPOSList}
                >
                  {t('Add')}
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </>
    );
  }
  
  return (
    <>
      <POSItemCard
        ref={btnRef}
        onOpen={onOpen}
        name={name}
        description={description}
        price={price}
        image={image?.url || '/default_fallback.png'}
        discount={Number(props?.discount ?? 0)}
        discountType={props?.discountType ?? ''}
        foodType={props?.foodType}
        isAvailable={Boolean(props?.isAvailable)}
      />

      {/* POS Item drawer */}
      <Drawer
        isOpen={isOpen}
        placement="right"
        size="md"
        onClose={() => {
          onClose();
          resetState();
        }}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          {/* drawer body */}
          <DrawerBody className="px-4 py-6 flex flex-col gap-3 flex-1">
            <div>
              {/* Menu image */}
              <div className="aspect-[3/2] bg-secondary-100 w-[15.625rem] rounded-[4px] mb-6">
                <img
                  src={image?.url || '/default_fallback.png'}
                  alt={name || t('Menu item')}
                  className="object-fill rounded-[4px]"
                  onError={(e) => (e.currentTarget.src = '/default_fallback.png')}
                />
              </div>

              {/* menu title */}
              <div className="flex flex-col gap-y-1">
                <Text as="h3" fontSize={20} lineHeight={7} fontWeight={600} color="secondary.900">
                  {name}
                </Text>
                <Text as="p" fontSize={16} lineHeight={6} fontWeight={400} color="secondary.400">
                  {description}
                </Text>

                {/* Menu Price */}
                <Flex columnGap="12px" alignItems="end">
                  {props.discount ? (
                    <Text
                      as="h3"
                      fontSize={20}
                      lineHeight={7}
                      fontWeight={400}
                      color="secondary.600"
                    >
                      <del>{convertToCurrencyFormat(price)}</del>
                    </Text>
                  ) : null}

                  <Text as="h2" fontSize={24} lineHeight={8} fontWeight={700} color="primary.500">
                    <span> {convertToCurrencyFormat(menuPrice)} </span>
                  </Text>

                  {props.discount ? (
                    <Text as="span" fontSize={16} lineHeight={6} fontWeight={400} color="green.500">
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
            {variants?.length > 0 && (
              <Flex flexDir="column" rowGap="12px">
                {variants?.map((variant: any) => (
                  <Box
                    key={variant.id}
                    border="1px"
                    borderColor="secondary.200"
                    py="8px"
                    rounded="6px"
                    className="w-full overflow-x-auto"
                  >
                    <Table variant="striped" size="sm">
                      <Thead className="[&>tr>th]:px-6 [&>tr>th]:py-1.5">
                        <Tr>
                          <Th textTransform="capitalize" className="flex items-center gap-1">
                            <Text as="h3" fontWeight={500} fontSize={16}>
                              {variant.name}
                            </Text>
                            <span className="text-secondary-600 text-sm leading-5 font-normal">
                              {variant.requirement === 'required'
                                ? `(${t('Required')})`
                                : `(${t('Optional')})`}
                            </span>
                          </Th>

                          <Th isNumeric textTransform="uppercase" w="150px">
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
                                    <Text fontSize={14}>{opt.name}</Text>
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
                        .otherwise(() => (
                          <Text className="text-secondary-500"> {t('Empty data')} </Text>
                        ))}
                    </Table>
                  </Box>
                ))}
              </Flex>
            )}

            {/* Addons */}
            {props.addons?.length > 0 && (
              <Box
                border="1px"
                borderColor="secondary.200"
                py="8px"
                rounded="6px"
                className="w-full"
              >
                <div className="w-full overflow-x-auto">
                  <Table variant="striped" size="sm">
                    <Thead className="[&>tr>th]:px-6 [&>tr>th]:py-1.5">
                      <Tr>
                        <Th textTransform="capitalize" className="flex items-center gap-2" w="full">
                          <Text as="h3" fontWeight={500} fontSize={16}>
                            {t('Addons')}
                          </Text>
                        </Th>

                        <Th textTransform="uppercase" w="150px" textAlign="center">
                          {t('QTY')}
                        </Th>

                        <Th isNumeric textTransform="uppercase" w="150px">
                          {t('Price')}
                        </Th>
                      </Tr>
                    </Thead>

                    <Tbody className="[&>tr>td]:px-6 [&>tr>td]:py-[1px]">
                      {props?.addons.map((addon: POSItemAddon & { isAvailable: number }) => (
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
                              onChange={() =>
                                pos.selectAddon(addon, addonsSelected, setAddonsSelected)
                              }
                            >
                              <Text fontSize={14}>{addon.name}</Text>
                            </Checkbox>
                          </Td>

                          <Td className="text-sm" w="150px">
                            <QuantityController
                              value={addonsSelected.find((v) => v.id === addon.id)?.quantity || 1}
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
            )}
          </DrawerBody>

          <DrawerFooter className="p-4 pt-2 flex-col items-stretch border-t border-black/[8%] shadow-[0_1px_2px_rgba(0,0,0,0.1),0_-1px_3px_rgba(0,0,0,0.1)]">
            <FormControl className="px-4">
              <FormLabel color="secondary.500">{t('Quantity')}</FormLabel>
              <HStack spacing={0}>
                <IconButton
                  aria-label="DecrementMenuQuantity"
                  type="button"
                  roundedRight="0"
                  onClick={() => setQty(qty > 1 ? qty - 1 : 1)}
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
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, +e.target.value))}
                  onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.select()}
                />
                <IconButton
                  aria-label="IncrementMenuQuantity"
                  type="button"
                  roundedLeft="0"
                  onClick={() => setQty(qty + 1)}
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
              <Button
                variant="outline"
                w="full"
                mr={3}
                onClick={() => {
                  onClose();
                  resetState();
                }}
              >
                {t('Cancel')}
              </Button>
              <Button
                type="button"
                variant="solid"
                colorScheme="blue"
                w="full"
                onClick={addItemToPOSList}
              >
                {t('Add')}
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
