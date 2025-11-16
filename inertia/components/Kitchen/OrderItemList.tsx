import { Box, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

type Item = Record<string, any> & {
  id: number;
  name: string;
  price: number;
};

export default function OrderItemList({ items }: { items: Item[] }) {
  const { t } = useTranslation();

  // render variants
  const renderVariant = (variantString: string) => {
    if (!variantString) return null;
    const variants = JSON.parse(variantString);
    return variants?.map((variant: any) => (
      <span key={variant.id}>
        {variant.name} ={' '}
        <span className="font-bold">
          {variant?.variantOptions?.map((option: any) => option.name).join(', ')}
        </span>
        {', '}
      </span>
    ));
  };

  // render addons
  const renderAddons = (addonString: string) => {
    if (!addonString) return null;
    const addons = JSON.parse(addonString);
    return addons?.map((addon: any) => (
      <span key={addon.id}>
        {addon.name} <span className="font-bold">(QTY: {addon.quantity}) </span>
        {', '}
      </span>
    ));
  };

  return (
    <Box className="border border-secondary-200 rounded-md shadow-[0_1px_2px_0_rgba(0,0,0,0.06),0_1px_3px_0_rgba(0,0,0,0.1)]">
      <Table variant="striped">
        <Thead>
          <Tr>
            <Th>Items</Th>
            <Th className="w-[100px]">QTY</Th>
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
                      />
                    ) : null}
                  </div>
                  <div className="flex-1 text-secondary-700 text-sm">
                    <h6 className="font-medium">{t(item.name)}</h6>
                    <p>
                      {renderVariant(item?.variants)}
                      {renderAddons(item?.addons)}
                    </p>
                  </div>
                </div>
              </Td>

              <Td>{item?.quantity}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
