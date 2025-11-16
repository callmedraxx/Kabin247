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
} from '@chakra-ui/react';
import { FilterSearch, ArrowDown2 } from 'iconsax-react';
import { useTranslation } from 'react-i18next';

// filter options types
type FilterOptions = Partial<{
  allowMultiple: string;
  requirement: string;
  available: string;
}>;

type FilterProps = {
  filter: FilterOptions;
  setFilter: (data: Record<string, any>) => void;
};

export default function FilterVariants({ filter, setFilter }: FilterProps) {
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
          {/* Availability */}
          <Menu matchWidth>
            <div className="flex flex-col gap-1.5">
              <Text className="text-secondary-500">{t('Multi-Selection')}</Text>
              <MenuButton
                as={Button}
                className="w-full text-left justify-start bg-secondary-50 font-normal"
                rightIcon={<ArrowDown2 />}
                color={'allowMultiple' in filter ? 'inherit' : 'secondary.500'}
              >
                {'allowMultiple' in filter
                  ? filter?.allowMultiple === 'true'
                    ? 'Yes'
                    : 'No'
                  : t('Multi-Selection')}
              </MenuButton>
            </div>
            <MenuList className="w-full p-1">
              <MenuOptionGroup
                value={filter?.allowMultiple?.toString()}
                onChange={(value) => {
                  setFilter((f: any) => ({
                    ...f,
                    allowMultiple: value as string,
                  }));
                }}
                type="radio"
              >
                {['true', 'false'].map((state: any) => (
                  <MenuItemOption key={state} value={state} icon={null}>
                    {state === 'true' ? 'Yes' : 'No'}
                  </MenuItemOption>
                ))}
              </MenuOptionGroup>
            </MenuList>
          </Menu>

          {/* Requirement */}
          <Menu matchWidth>
            <div className="flex flex-col gap-1.5">
              <Text className="text-secondary-500">{t('Required')}</Text>
              <MenuButton
                as={Button}
                className="w-full text-left justify-start bg-secondary-50 font-normal"
                rightIcon={<ArrowDown2 />}
                color={'requirement' in filter ? 'inherit' : 'secondary.500'}
              >
                {'requirement' in filter
                  ? filter?.requirement === 'required'
                    ? 'Yes'
                    : 'No'
                  : t('Required')}
              </MenuButton>
            </div>
            <MenuList className="w-full p-1">
              <MenuOptionGroup
                value={filter?.requirement?.toString()}
                onChange={(value) => {
                  setFilter((f: any) => ({
                    ...f,
                    requirement: value as string,
                  }));
                }}
                type="radio"
              >
                {['required', 'optional'].map((state: any) => (
                  <MenuItemOption key={state} value={state} icon={null}>
                    {state === 'required' ? 'Yes' : 'No'}
                  </MenuItemOption>
                ))}
              </MenuOptionGroup>
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
                value={filter?.available?.toString()}
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
