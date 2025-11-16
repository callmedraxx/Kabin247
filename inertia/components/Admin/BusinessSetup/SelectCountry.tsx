import {
  Popover,
  PopoverTrigger,
  Button,
  HStack,
  PopoverContent,
  PopoverBody,
  Text,
  Input,
} from '@chakra-ui/react';
import { ArrowDown2 } from 'iconsax-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import countries from '@/utils/country_codes';
import { Flag } from '../Flag';

export default function CountrySelect({
  value,
  onChange,
}: {
  value: string;
  onChange?: (code: string) => void;
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  return (
    <Popover
      matchWidth
      isOpen={isOpen}
      onOpen={() => setIsOpen(true)}
      onClose={() => {
        setIsOpen(false);
        setSearch('');
      }}
    >
      <PopoverTrigger>
        <Button size="lg" variant="outline" className="w-full font-normal text-left justify-start px-4">
          {value ? (
            <HStack className="flex-1">
              <Flag countryCode={value} className="mr-2" />
              <Text>{countries.find((c) => c.code === value)?.name}</Text>
            </HStack>
          ) : (
            <span className="flex-1 text-secondary-500">{t('Country')}</span>
          )}

          <ArrowDown2 size={18} />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-1 w-full">
        <div className="p-2 border-b border-black/5 mb-1">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="search"
            placeholder={t('Search country')}
            className="text-sm"
            autoFocus
          />
        </div>
        <PopoverBody className="w-full p-1 max-h-[300px] overflow-x-hidden overflow-y-scroll flex flex-col items-stretch">
          {countries
            .filter((country) => country.name.toLowerCase().includes(search.toLowerCase()))
            .map((country) => (
              <Button
                size="sm"
                variant="ghost"
                key={country.code}
                onClick={() => {
                  onChange?.(country.code);
                  setIsOpen(false);
                  setSearch('');
                }}
                className="text-left justify-start py-2 font-normal space-x-2"
              >
                <Flag countryCode={country.code} className="mr-2" />
                <Text noOfLines={1}>{country.name}</Text>
              </Button>
            ))}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
