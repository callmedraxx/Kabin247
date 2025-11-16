import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import {
  Box,
  Divider,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

type Item = Record<string, any> & {
  id: number;
  name: string;
  price: number;
};

export default function OrderItemList({ items }: { items: Item[] }) {
  const { t } = useTranslation();

  const tableHeaders = [
    { id: '042efb51', title: 'ITEMS', width: '100%', pl: '24px' },
    { id: '7917964d', title: 'QTY', px: '4px', className: 'text-center' },
    { id: '79179643', title: 'PRICE', isNumeric: true },
    { id: '73119643', title: 'TOTAL', isNumeric: true, pr: '24px' },
  ];

  const joinedVariantNames = (variantData: any) => {
    if (!variantData) return;
    const variants = Array.isArray(variantData) ? variantData : [variantData];
    return variants
      ?.map((variant: any) => variant?.variantOptions?.map((option: any) => option.name).join(', '))
      .join(' | ');
  };

  const joinedAddonNames = (addonData: any) => {
    if (!addonData) return;
    const addons = Array.isArray(addonData) ? addonData : [addonData];
    return addons.map((addon: any) => addon.name + ' x ' + addon.quantity).join(', ');
  };

  const addonsSize = (addonData: any) => {
    if (!addonData) return 0;
    const addons = Array.isArray(addonData) ? addonData : [addonData];
    return addons.length;
  };

  return (
    <Box className="border border-secondary-200 w-full overflow-x-auto rounded-md shadow-[0_1px_2px_0_rgba(0,0,0,0.06),0_1px_3px_0_rgba(0,0,0,0.1)]">
      <Table variant="striped">
        <Thead>
          <Tr>
            {tableHeaders.map(({ id, title, ...item }) => (
              <Th key={id} width="fit-content" px="3" {...item}>
                {t(title)}
              </Th>
            ))}
          </Tr>
        </Thead>

        <Tbody>
          {items.map((item) => (
            <Tr key={item.id}>
              <Td pl="6" pr="3">
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-12 rounded bg-secondary-50">
                    {item?.menuItem?.image?.url ? (
                      <img
                        src={item?.menuItem?.image?.url}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="rounded w-full h-full"
                        onError={(e) => (e.currentTarget.src = '/default_fallback.png')}
                      />
                    ) : null}
                  </div>
                  <div className="flex-1 text-secondary-700 text-sm">
                    <h6 className="font-medium">{item.name}</h6>
                    <Popover trigger="hover">
                      <PopoverTrigger>
                        <Text as="p" noOfLines={1}>
                          {joinedVariantNames(item?.variants)}
                          {addonsSize(item?.addons) > 0 && ' | '}
                          {joinedAddonNames(item?.addons)}
                        </Text>
                      </PopoverTrigger>
                      <PopoverContent className="p-4">
                        <Text as="h3" fontWeight={600} color="secondary.500">
                          {t('Variants')}
                        </Text>
                        {Array.isArray(item?.variants) && item?.variants?.map((variant: any) => (
                          <ul key={variant.id} className="list-disc list-inside mb-2">
                            <li>{variant.name}</li>
                            <ul className="list-inside list-[circle] ml-4">
                              {variant.variantOptions.map((opt: any) => (
                                <li key={opt.id}> {t(opt.name)} </li>
                              ))}
                            </ul>
                          </ul>
                        ))}

                        <Divider className="border-black/5" />

                        {!!addonsSize(item?.addons) && (
                          <>
                            <Text as="h3" fontWeight={600} color="secondary.500" mt="4">
                              {t('Addons')}
                            </Text>
                            {Array.isArray(item?.addons) && item?.addons?.map((addon: any) => (
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
                </div>
              </Td>

              <Td px="3">{item?.quantity}</Td>

              <Td isNumeric px="3">
                {convertToCurrencyFormat(item?.price + item?.variantsAmount + item?.addonsAmount)}
              </Td>
              <Td isNumeric px="3" pr="6">
                {convertToCurrencyFormat(
                  item.quantity * (item?.price + item?.variantsAmount + item?.addonsAmount)
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
