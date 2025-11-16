import DatePicker from '@/components/common/DatePicker';
import { startCase } from '@/utils/string_formatter';
import {
  Box,
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

type FilterOptions = Partial<{
  status: string;
  reservationDate: Date;
}>;

type FilterProps = {
  filter: FilterOptions;
  setFilter: (data: Record<string, any>) => void;
};

export default function FilterReservations({ filter, setFilter }: FilterProps) {
  const { t } = useTranslation();
  return (
    <Popover preventOverflow={true} placement="bottom-start">
      <PopoverTrigger>
        <Button variant="outline" leftIcon={<FilterSearch />}>
          {t('Filter')}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverBody className="w-full p-2.5">
          <Menu matchWidth>
            <div className="flex flex-col gap-1.5">
              <Text className="text-secondary-500">{t('Order status')}</Text>
              <MenuButton
                as={Button}
                className="w-full text-left justify-start bg-secondary-50 font-normal"
                rightIcon={<ArrowDown2 />}
                color={filter.status ? 'inherit' : 'secondary.500'}
              >
                {t(startCase(filter.status)) || t('Status')}
              </MenuButton>
            </div>
            <MenuList className="w-full p-1">
              <MenuOptionGroup
                value={filter.status}
                onChange={(value) => setFilter((f: any) => ({ ...f, status: value as string }))}
                type="radio"
              >
                {['booked', 'completed', 'cancelled'].map((status, index) => (
                  <MenuItemOption key={index} value={status} icon={null}>
                    {t(startCase(status))}
                  </MenuItemOption>
                ))}
              </MenuOptionGroup>
            </MenuList>
          </Menu>

          {/* Reservation Date */}
          <Box className="relative mt-3 flex flex-col space-y-1.5">
            <Text className="text-secondary-500">{t('Reservation date')}</Text>
            <DatePicker
              selected={filter.reservationDate}
              onSelect={(date) => {
                setFilter((f: any) => ({ ...f, reservationDate: date }));
              }}
              minDate={new Date(1900, 10, 1)}
            />
          </Box>
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
