import fetcher from '@/lib/fetcher';
import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  useBoolean,
} from '@chakra-ui/react';
import { ArrowDown2 } from 'iconsax-react';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { useTranslation } from 'react-i18next';

interface Option extends Record<string, any> {
  name: string;
  id: string;
}

export const AddonCharges = ({
  defaultValue = [],
  onSelect,
}: {
  defaultValue?: Option[];
  onSelect: (values: Option[]) => void;
}) => {
  const { t } = useTranslation();
  const { data, isLoading } = useSWR('/api/charges', fetcher);
  const [selected, setSelected] = useState<Option[]>([]);
  const [isOpen, setIsOpen] = useBoolean();

  // initialize default selected options
  useEffect(() => {
    if (!isLoading && !selected.length && data?.length && defaultValue) {
      const filterData = data.filter((option: any) => defaultValue.includes(option.id));
      setSelected(filterData);
    }
  }, [isLoading, defaultValue, data]);

  // remove a selected option from selected state
  const removeItem = (item: Option) => {
    const newSelection = selected.filter((o: Option) => o.id !== item.id);
    setSelected(newSelection);
    onSelect(newSelection);
  };

  // handle on select functionality
  const handleOnSelect = (option: Option) => {
    const index = selected.indexOf(option);
    let selectedData: Option[];

    if (index === -1) {
      selectedData = [...selected, option];
    } else {
      selectedData = selected.filter((_, i) => i !== index);
    }

    setSelected(selectedData);
    onSelect(selectedData);
    setIsOpen.off();
  };

  return (
    <Flex direction="column" gap={4}>
      <Popover isOpen={isOpen} onOpen={setIsOpen.on} onClose={setIsOpen.off} matchWidth>
        <PopoverTrigger>
          <Flex>
            <PopoverTrigger>
              <Button
                variant="outline"
                roundedRight={0}
                className="justify-start text-black font-normal w-full border-secondary-200"
              >
                <HStack>
                  {selected.length ? (
                    selected.map((s) => (
                      <Tag key={s.id} colorScheme="blue">
                        <TagLabel className="line-clamp-1">{s.name}</TagLabel>
                        <TagCloseButton as="div" onClick={() => removeItem(s)} />
                      </Tag>
                    ))
                  ) : (
                    <Text color="secondary.500">{t('Search or add')}</Text>
                  )}
                </HStack>
              </Button>
            </PopoverTrigger>
            <IconButton
              type="button"
              onClick={setIsOpen.toggle}
              aria-label={t('toggleSelectionMenu')}
              border="1px"
              roundedLeft={0}
              borderLeft={0}
              borderColor="secondary.200"
              icon={<ArrowDown2 />}
            />
          </Flex>
        </PopoverTrigger>

        <PopoverContent className="w-full">
          <PopoverBody className="p-1 text-secondary-900 max-h-[400px] overflow-y-auto">
            {isLoading && (
              <HStack justifyContent="center" p="2.5">
                <Spinner size="sm" />
                <span>{t('Loading...')}</span>
              </HStack>
            )}
            {!isLoading && data?.length ? (
              data?.map((option: Option) => (
                <Button
                  type="button"
                  key={option.id}
                  variant="ghost"
                  className="w-full justify-start font-normal text-secondary-900"
                  onClick={() => handleOnSelect(option)}
                >
                  {option.name}
                </Button>
              ))
            ) : (
              <Box color="secondary.500" p="2.5">
                <span>{t('No data available.')}</span>
              </Box>
            )}
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Flex>
  );
};
