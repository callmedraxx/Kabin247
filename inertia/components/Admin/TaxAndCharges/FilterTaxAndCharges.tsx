import { startCase } from '@/utils/string_formatter';
import {
  Button,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverFooter,
  PopoverTrigger,
  Text,
} from '@chakra-ui/react';
import { ArrowDown2, FilterSearch } from 'iconsax-react';
import { useTranslation } from 'react-i18next';

// filter options types
type FilterOptions = Partial<{
  available: string;
  type: string;
  amountType: string;
}>;

type FilterProps = {
  filter: FilterOptions;
  setFilter: (data: Record<string, any>) => void;
};

export default function FilterTaxAndCharges({ filter, setFilter }: FilterProps) {
  const { t } = useTranslation();

  return (
    <Popover matchWidth>
      <PopoverTrigger>
        <Button variant="outline" leftIcon={<FilterSearch />}>
          {t('Filter')}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverBody className="w-full p-2.5 flex flex-col gap-y-3">
          {/* Type */}
          <Menu matchWidth>
            <div className="flex flex-col gap-1.5">
              <Text className="text-secondary-500">{t('Type')}</Text>
              <MenuButton
                as={Button}
                className="w-full text-left justify-start bg-secondary-50 font-normal"
                rightIcon={<ArrowDown2 />}
                color={filter.type ? 'inherit' : 'secondary.500'}
              >
                {t(startCase(filter.type || 'Type'))}
              </MenuButton>
            </div>
            <MenuList className="w-full p-1">
              <MenuOptionGroup
                value={filter.type?.toString()}
                onChange={(value) => {
                  setFilter((f: any) => ({ ...f, type: value as string }));
                }}
                type="radio"
              >
                {['tax', 'charge']?.map((type: string) => (
                  <MenuItemOption key={type} value={type} icon={null}>
                    {t(startCase(type))}
                  </MenuItemOption>
                ))}
              </MenuOptionGroup>
            </MenuList>
          </Menu>
          {/* Type */}
          <Menu matchWidth>
            <div className="flex flex-col gap-1.5">
              <Text className="text-secondary-500">{t('Type')}</Text>
              <MenuButton
                as={Button}
                className="w-full text-left justify-start bg-secondary-50 font-normal"
                rightIcon={<ArrowDown2 />}
                color={filter.amountType ? 'inherit' : 'secondary.500'}
              >
                {t(startCase(filter.amountType || 'Amount Type'))}
              </MenuButton>
            </div>
            <MenuList className="w-full p-1">
              <MenuOptionGroup
                value={filter.amountType?.toString()}
                onChange={(value) => {
                  setFilter((f: any) => ({ ...f, amountType: value as string }));
                }}
                type="radio"
              >
                {['percentage', 'amount']?.map((amountType: string) => (
                  <MenuItemOption key={amountType} value={amountType} icon={null}>
                    {t(startCase(amountType))}
                  </MenuItemOption>
                ))}
              </MenuOptionGroup>
            </MenuList>
          </Menu>

          {/* Menu item categories */}
          <Menu matchWidth>
            <div className="flex flex-col gap-1.5">
              <Text className="text-secondary-500">{t('Availability')}</Text>
              <MenuButton
                as={Button}
                className="w-full text-left justify-start bg-secondary-50 font-normal"
                rightIcon={<ArrowDown2 />}
                color={filter.available ? 'inherit' : 'secondary.500'}
              >
                {filter.available !== undefined
                  ? t(startCase(filter.available === 'true' ? 'Available' : 'Unavailable'))
                  : t('Availability')}
              </MenuButton>
            </div>
            <MenuList className="w-full p-1">
              <MenuOptionGroup
                value={filter.available?.toString()}
                onChange={(value) => {
                  setFilter((f: any) => ({ ...f, available: value as string }));
                }}
                type="radio"
              >
                {['true', 'false']?.map((available: string) => (
                  <MenuItemOption key={available} value={available} icon={null}>
                    {t(startCase(available === 'true' ? 'Available' : 'Unavailable'))}
                  </MenuItemOption>
                ))}
              </MenuOptionGroup>
            </MenuList>
          </Menu>
        </PopoverBody>
        <PopoverFooter className="border-black/5">
          <Button
            size="md"
            className="w-full"
            onClick={() => {
              setFilter({});
            }}
          >
            {t('Clear')}
          </Button>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
}
