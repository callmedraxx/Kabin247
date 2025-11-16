import useCategories from '@/data/use_categories';
import { startCase } from '@/utils/string_formatter';
import {
  Popover,
  PopoverTrigger,
  Button,
  PopoverContent,
  PopoverBody,
  MenuButton,
  MenuList,
  MenuOptionGroup,
  MenuItemOption,
  PopoverFooter,
  Text,
  Menu,
  Spinner,
  HStack,
} from '@chakra-ui/react';
import { FilterSearch, ArrowDown2 } from 'iconsax-react';
import { useTranslation } from 'react-i18next';

// filter options types
type FilterOptions = Partial<{
  category: string;
  foodType: string;
  available?: string;
}>;

type FilterProps = {
  filter: FilterOptions;
  setFilter: (data: Record<string, any>) => void;
};

export default function FilterMenuItem({ filter, setFilter }: FilterProps) {
  const { categories, isLoading: isCategoriesLoading } = useCategories('/api/categories');

  const categoryName = startCase(
    categories?.find((c: any) => c.id?.toString() === filter?.category)?.name
  );

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
          {/* Menu item categories */}
          <Menu matchWidth>
            <div className="flex flex-col gap-1.5">
              <Text className="text-secondary-500">{t('Category')}</Text>
              <MenuButton
                as={Button}
                className="w-full text-left justify-start bg-secondary-50 font-normal"
                rightIcon={<ArrowDown2 />}
                color={'category' in filter ? 'inherit' : 'secondary.500'}
              >
                {categoryName || t('Category')}
              </MenuButton>
            </div>
            <MenuList className="w-full p-1">
              {isCategoriesLoading ? (
                <HStack color="secondary.500" className="py-2 px-4">
                  <Spinner size="sm" />
                  <Text> {t('Loading...')} </Text>
                </HStack>
              ) : (
                <MenuOptionGroup
                  value={filter?.category?.toString()}
                  onChange={(value) => {
                    setFilter((f: any) => ({
                      ...f,
                      category: value.toString() as string,
                      categoryName: categories?.find((c: any) => c.id?.toString() === value)?.name,
                    }));
                  }}
                  type="radio"
                >
                  {categories?.map((category: any) => (
                    <MenuItemOption key={category.id} value={category.id.toString()} icon={null}>
                      {t(startCase(category.name))}
                    </MenuItemOption>
                  ))}
                </MenuOptionGroup>
              )}
            </MenuList>
          </Menu>

          {/* Food type */}
          <Menu matchWidth>
            <div className="flex flex-col gap-1.5">
              <Text className="text-secondary-500">{t('Food type')}</Text>
              <MenuButton
                as={Button}
                className="w-full text-left justify-start bg-secondary-50 font-normal"
                rightIcon={<ArrowDown2 />}
                color={'foodType' in filter ? 'inherit' : 'secondary.500'}
              >
                {filter?.foodType
                  ? filter?.foodType === 'veg'
                    ? 'Veg'
                    : 'Non-veg'
                  : t('Food type')}
              </MenuButton>
            </div>
            <MenuList className="w-full p-1">
              {isCategoriesLoading ? (
                <HStack color="secondary.500" className="py-2 px-4">
                  <Spinner size="sm" />
                  <Text> {t('Loading...')} </Text>
                </HStack>
              ) : (
                <MenuOptionGroup
                  value={filter?.category?.toString()}
                  onChange={(value) => {
                    setFilter((f: any) => ({
                      ...f,
                      foodType: value as string,
                    }));
                  }}
                  type="radio"
                >
                  {['veg', 'nonVeg'].map((food: any) => (
                    <MenuItemOption key={food} value={food} icon={null}>
                      {food === 'veg' ? 'Veg' : 'Non-veg'}
                    </MenuItemOption>
                  ))}
                </MenuOptionGroup>
              )}
            </MenuList>
          </Menu>

          {/* Availability */}
          <Menu matchWidth>
            <div className="flex flex-col gap-1.5">
              <Text className="text-secondary-500">{t('Availability')}</Text>
              <MenuButton
                as={Button}
                className="w-full text-left justify-start bg-secondary-50 font-normal"
                rightIcon={<ArrowDown2 />}
                color={'available' in filter ? 'inherit' : 'secondary.500'}
              >
                {'available' in filter
                  ? filter?.available === 'true'
                    ? 'Available'
                    : 'Unavailable'
                  : t('Availability')}
              </MenuButton>
            </div>
            <MenuList className="w-full p-1">
              <MenuOptionGroup
                value={filter?.category?.toString()}
                onChange={(value) => {
                  setFilter((f: any) => ({
                    ...f,
                    available: value as string,
                  }));
                }}
                type="radio"
              >
                {['true', 'false'].map((state: any) => (
                  <MenuItemOption key={state} value={state} icon={null}>
                    {state === 'true' ? 'Available' : 'Unavailable'}
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
