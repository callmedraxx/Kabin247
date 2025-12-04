import { HStack, Select, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

type FilterStockInventoryProps = {
  filter: Partial<{
    category: string;
    isActive: string;
  }>;
  setFilter: (filter: Partial<{ category: string; isActive: string }>) => void;
};

export default function FilterStockInventory({ filter, setFilter }: FilterStockInventoryProps) {
  const { t } = useTranslation();

  return (
    <HStack spacing={4}>
      <HStack>
        <Text fontSize="sm" color="secondary.400">
          {t('Category')}:
        </Text>
        <Select
          size="sm"
          width="150px"
          value={filter.category || ''}
          onChange={(e) => setFilter({ ...filter, category: e.target.value || undefined })}
          placeholder={t('All Categories')}
        >
          <option value="ingredients">{t('Ingredients')}</option>
          <option value="beverages">{t('Beverages')}</option>
          <option value="supplies">{t('Supplies')}</option>
          <option value="equipment">{t('Equipment')}</option>
        </Select>
      </HStack>

      <HStack>
        <Text fontSize="sm" color="secondary.400">
          {t('Status')}:
        </Text>
        <Select
          size="sm"
          width="120px"
          value={filter.isActive || ''}
          onChange={(e) => setFilter({ ...filter, isActive: e.target.value || undefined })}
          placeholder={t('All Status')}
        >
          <option value="true">{t('Active')}</option>
          <option value="false">{t('Inactive')}</option>
        </Select>
      </HStack>
    </HStack>
  );
}

