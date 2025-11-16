import QuantityController from '@/components/common/QuantityController';
import { PageProps } from '@/types';
import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import {
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  HStack,
  IconButton,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from '@chakra-ui/react';
import { Link, usePage } from '@inertiajs/react';
import { Bag2, Trash } from 'iconsax-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import OrderTypeRadioGroup from './OrderTypeSelect';
import Empty from '@/components/common/Empty';
import EditCartItem from './EditCartItem';
import usePOS from '@/data/use_pos';
import { POSItemAddon, POSItemVariant } from '@/types/pos_type';

export default function Cart() {
  const cart = usePOS();
  const { t } = useTranslation();
  const {
    props: { auth, branding },
  } = usePage() as { props: PageProps };

  const [errors, setErrors] = useState<Map<string, string>>(new Map());

  const { isOpen, onOpen, onClose } = useDisclosure();

  const drawerRef = useRef<HTMLDivElement>(null);

  // reset errors
  const resetError = (key: string) => {
    errors.delete(key);
    setErrors(errors);
  };

  // join variants name
  const joinedVariantNames = (variants: POSItemVariant[]) => {
    const variantSize = variants.length;
    return variants
      .map(
        (variant, index) =>
          variant.option.map((opt) => opt.name).join(', ') +
          (index + 1 === variantSize ? '' : ' | ')
      )
      .join('');
  };
  // join addons name
  const joinedAddonNames = (addons: POSItemAddon[]) =>
    addons.map((addon) => addon.name + ' x ' + addon.quantity).join(', ');

  return (
    <>
      <div className="relative">
        <IconButton
          aria-label="Cart"
          onClick={onOpen}
          icon={<Bag2 size={20} color="currentColor" />}
          className="size-12 bg-transparent border border-secondary-200 rounded-full hover:bg-transparent hover:border-primary-400 hover:text-primary-400 text-secondary-700"
        />
        {cart.POSItems.length > 0 && (
          <Badge
            colorScheme="primary"
            variant="solid"
            rounded="full"
            className="absolute bottom-0 right-0 aspect-square flex items-center justify-center min-w-4 text-[9px] p-0 leading-3"
          >
            {cart.POSItems.length}
          </Badge>
        )}
      </div>
      <Drawer
        isOpen={isOpen}
        placement="right"
        size="lg"
        onClose={onClose}
        finalFocusRef={drawerRef}
      >
        <DrawerOverlay />
        <DrawerContent className="flex flex-col justify-between font-poppins overflow-y-auto">
          <div className="px-4 py-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">{t('Select order type')}</h4>

            <div className="flex items-center gap-2 mb-6">
              {/* Select order type */}
              <OrderTypeRadioGroup
                onChange={(value) => {
                  resetError('orderType');
                  cart.changeType(value as 'delivery', branding?.business?.deliveryCharge);
                }}
              />

              {/* show error message if order type not select */}
              {errors.get('orderType') ? (
                <Text className="text-sm text-red-500">
                  {t(errors.get('orderType') as 'string')}
                </Text>
              ) : null}
            </div>

            {/* Cart item list table */}
            <Box
              border="1px"
              borderColor="secondary.200"
              className="rounded-md flex-1 shadow-[0_1px_2px_rgba(0,0,0,6%),0_1px_3px_rgba(0,0,0,10%)] w-full overflow-x-auto"
            >
              <Table variant="simple">
                <Thead className="[&>tr>th]:border-none">
                  <Tr>
                    <Th className="w-full">{t('ITEMS')}</Th>
                    <Th className="text-center w-[120px]">{t('QTY')}</Th>
                    <Th className="w-[120px]">{t('PRICE')}</Th>
                    <Th className="w-[120px]">{t('TOTAL')}</Th>
                  </Tr>
                </Thead>

                <Tbody className="[&>tr>td]:border-none">
                  {cart.POSItems.length ? (
                    cart.POSItems.map((item) => (
                      <Tr
                        key={item?.id}
                        fontSize={14}
                        lineHeight={5}
                        fontWeight={400}
                        className="odd:bg-secondary-50"
                      >
                        <Td className="w-full pl-6 pr-1.5">
                          <HStack className="flex-1">
                            <Box className="flex-1 flex items-center gap-6">
                              <div className="w-[60px] h-[40px] rounded aspect-[3/2] relative">
                                <img
                                  src={item?.image?.url}
                                  width={60}
                                  height={40}
                                  className="w-[60px] h-[40px] rounded aspect-[3/2] object-cover"
                                  alt={item?.name}
                                  onError={(e) => (e.currentTarget.src = '/default_fallback.png')}
                                />
                              </div>
                              <div className="flex-1">
                                <Text noOfLines={1} fontWeight={500}>
                                  {t(item.name)}
                                </Text>

                                <Popover trigger="hover">
                                  <PopoverTrigger>
                                    <Text noOfLines={1}>
                                      {joinedVariantNames(item.variants)}
                                      {item.addons.length > 0 && ' | '}
                                      {joinedAddonNames(item.addons)}
                                    </Text>
                                  </PopoverTrigger>
                                  <PopoverContent className="p-4">
                                    <Text as="h3" fontWeight={600} color="secondary.500">
                                      {t('Variants')}
                                    </Text>
                                    {item.variants.map((variant) => (
                                      <ul key={variant.id} className="list-disc list-inside mb-2">
                                        <li>{variant.name}</li>
                                        <ul className="list-inside list-[circle] ml-4">
                                          {variant.option.map((opt) => (
                                            <li key={opt.id}> {t(opt.name)} </li>
                                          ))}
                                        </ul>
                                      </ul>
                                    ))}

                                    <Divider className="border-black/5" />

                                    {!!item.addons.length && (
                                      <>
                                        <Text as="h3" fontWeight={600} color="secondary.500" mt="4">
                                          {t('Addons')}
                                        </Text>
                                        {item.addons.map((addon) => (
                                          <ul key={addon.id} className="list-disc list-inside mb-2">
                                            <li>
                                              {t(addon.name)} ( {t('QTY: ')} {addon.quantity} )
                                            </li>
                                          </ul>
                                        ))}
                                      </>
                                    )}
                                  </PopoverContent>
                                </Popover>
                              </div>
                              <IconButton
                                size="sm"
                                aria-label="delete"
                                onClick={() => cart.removeItemFromPOS(item)}
                                variant="ghost"
                                className="text-secondary-500 hover:text-red-500 rounded-full"
                              >
                                <Trash size="16" />
                              </IconButton>
                            </Box>

                            <EditCartItem {...item} />
                          </HStack>
                        </Td>
                        <Td className="p-0">
                          <QuantityController
                            value={item.quantity}
                            onValueChange={(quantity) => {
                              cart.setQuantity(item, quantity);
                            }}
                            decrementButtonClassName="text-black bg-white border border-black/15 rounded-full w-8 h-8 hover:text-white"
                            incrementButtonClassName="text-black bg-white border border-black/15 rounded-full w-8 h-8 hover:text-white"
                            className="font-medium"
                          />
                        </Td>
                        <Td isNumeric className="px-2">
                          {convertToCurrencyFormat(item.subTotal)}
                        </Td>
                        <Td isNumeric className="pl-2 pr-6">
                          {convertToCurrencyFormat(item?.total || 0)}
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={4} className="border-none">
                        <Empty type="bagEmpty" message={t('Empty cart')} />
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>

            <div className="mt-3">
              <div className="flex items-center justify-between px-4 py-1 border-b border-black/5">
                <h4 className="text-lg">{t('Subtotal')}:</h4>
                <p className="text-lg">{convertToCurrencyFormat(cart.subTotal)}</p>
              </div>

              {/* Charges */}
              {cart.POSCharges.map((charge) => (
                <Box
                  as="div"
                  key={charge?.id}
                  className="grid grid-cols-[1fr,100px] border-b py-1.5 border-black/5 px-4 text-lg"
                >
                  <Text>{t(charge.name)}:</Text>
                  <Text fontWeight={500} textAlign="right">
                    {convertToCurrencyFormat(charge.amount)}
                  </Text>
                </Box>
              ))}
            </div>

            <div className="p-4 border border-secondary-200 rounded-2xl mt-2.5">
              <Text className="text-xs text-secondary-500 leading-5"> {t('Order note')} </Text>
              <Textarea
                rows={3}
                placeholder={t('Write a note for the order...')}
                value={cart.note}
                onChange={(e) => cart.setNote(e.target.value)}
                className="focus:border-primary-500 focus:outline-none focus:shadow-none placeholder:text-secondary-700 p-0 border-none"
              />
            </div>
          </div>

          <div className="py-2 px-4 shadow-primary border-t border-t-black/10">
            <div className="flex justify-between items-center py-2 border-b border-black/5 px-4">
              <p className="text-lg">{t('Total')}</p>
              <p className="text-xl font-bold">{convertToCurrencyFormat(cart.total)}</p>
            </div>
            <div className="flex gap-4 items-center justify-center pt-3">
              <Button
                variant="outline"
                colorScheme="secondary"
                className="button-outline"
                onClick={onClose}
              >
                {t('CLOSE')}
              </Button>
              <Button
                as={Link}
                href={auth?.id ? '/user/checkout' : '/login'}
                variant="solid"
                colorScheme="primary"
                disabled={cart.POSItems.length === 0}
                className="button-primary disabled:pointer-events-none"
              >
                {t('CHECKOUT')}
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
