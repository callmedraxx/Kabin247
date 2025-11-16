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
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { timeZonesList } from '@/utils/timezone';

export default function SelectTimeZone({ onChange }: { onChange?: (zone: string) => void }) {
  const [timezones, setTimezones] = useState<{ name: string; offset: string }[]>([]);
  const { t } = useTranslation();
  const [selected, setSelected] = useState<{ name: string; offset: string }>();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!timezones?.length) {
      const zones = timeZonesList;
      setTimezones(zones);
    }
  }, []);

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
          {selected ? (
            <HStack className="flex-1">
              <Text>{`${selected.name} (UTC${selected.offset})`}</Text>
            </HStack>
          ) : (
            <span className="flex-1 text-secondary-500"> {t('Select timezone')} </span>
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
            placeholder={t('Search timezone')}
            className="text-sm"
            autoFocus
          />
        </div>
        <PopoverBody className="w-full p-1 max-h-[300px] overflow-x-hidden overflow-y-scroll flex flex-col items-stretch">
          {timezones
            .filter((zone) =>
              `${zone.name}(UTC${zone.offset})`.toLowerCase().includes(search.toLowerCase())
            )
            .map((zone, index) => (
              <Button
                size="sm"
                variant="ghost"
                key={index}
                onClick={() => {
                  onChange?.(`UTC${zone.offset}`);
                  setSelected(zone);
                  setIsOpen(false);
                  setSearch('');
                }}
                className="text-left justify-start py-2 font-normal space-x-2"
              >
                <Text noOfLines={1}>{`${zone.name}(UTC${zone.offset})`}</Text>
              </Button>
            ))}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
