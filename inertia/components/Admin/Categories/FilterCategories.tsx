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
}>;

type FilterProps = {
  filter: FilterOptions;
  setFilter: (data: Record<string, any>) => void;
};

export default function FilterCategories({ filter, setFilter }: FilterProps) {
  const { t } = useTranslation();

  return (
    <Popover matchWidth>
      <PopoverTrigger>
        <Button variant="outline" leftIcon={<FilterSearch />}>
          {t('Filter')}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverBody className="w-full p-2.5">
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
                {filter.available
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
          <Button size="md" className="w-full" onClick={() => setFilter({})}>
            {t('Clear')}
          </Button>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
}
