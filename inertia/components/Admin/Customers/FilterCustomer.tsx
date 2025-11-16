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
} from '@chakra-ui/react';
import { FilterSearch, ArrowDown2 } from 'iconsax-react';
import { useTranslation } from 'react-i18next';

// filter options types
type FilterOptions = Partial<{
  emailVerified: string;
  suspended: string;
}>;

type FilterProps = {
  filter: FilterOptions;
  setFilter: (data: Record<string, any>) => void;
};

export default function FilterCustomer({ filter, setFilter }: FilterProps) {
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
          <Menu matchWidth>
            <div className="flex flex-col gap-1.5">
              <Text className="text-secondary-500">{t('Email status')}</Text>
              <MenuButton
                as={Button}
                className="w-full text-left justify-start bg-secondary-50 font-normal"
                rightIcon={<ArrowDown2 />}
                color={filter?.emailVerified ? 'inherit' : 'secondary.500'}
              >
                {t(startCase(filter?.emailVerified === 'true' ? 'Verified' : 'Unverified')) ||
                  t('Type')}
              </MenuButton>
            </div>
            <MenuList className="w-full p-1">
              <MenuOptionGroup
                value={filter?.emailVerified?.toString()}
                onChange={(value) => {
                  setFilter((f: any) => ({ ...f, emailVerified: value as string }));
                }}
                type="radio"
              >
                {['true', 'false']?.map((type: string) => (
                  <MenuItemOption key={type} value={type} icon={null}>
                    {t(startCase(type === 'true' ? 'Verified' : 'Unverified'))}
                  </MenuItemOption>
                ))}
              </MenuOptionGroup>
            </MenuList>
          </Menu>
          <Menu matchWidth>
            <div className="flex flex-col gap-1.5">
              <Text className="text-secondary-500">{t('Suspended')}</Text>
              <MenuButton
                as={Button}
                className="w-full text-left justify-start bg-secondary-50 font-normal"
                rightIcon={<ArrowDown2 />}
                color={filter?.suspended ? 'inherit' : 'secondary.500'}
              >
                {t(startCase(filter?.suspended === 'true' ? 'Suspended' : 'Active')) || t('Type')}
              </MenuButton>
            </div>
            <MenuList className="w-full p-1">
              <MenuOptionGroup
                value={filter?.suspended?.toString()}
                onChange={(value) => {
                  setFilter((f: any) => ({ ...f, suspended: value as string }));
                }}
                type="radio"
              >
                {['true', 'false']?.map((type: string) => (
                  <MenuItemOption key={type} value={type} icon={null}>
                    {t(startCase(type === 'true' ? 'Suspended' : 'Active'))}
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
