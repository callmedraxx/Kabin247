import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Spinner,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  useBoolean,
} from '@chakra-ui/react';
import { Add, ArrowDown2 } from 'iconsax-react';
import { useEffect, useState } from 'react';
import VariantCreationForm from './VariantCreationForm';
import useSWR, { mutate } from 'swr';
import fetcher from '@/lib/fetcher';
import { useTranslation } from 'react-i18next';

type Option = {
  value: string;
  label: string;
  uniqueName?: string;
};

export const MenuItemVariantSelection = ({
  defaultValues = [],
  onSelect,
}: {
  defaultValues?: number[];
  onSelect: (values: Option[]) => void;
}) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Option[]>([]);
  const [isOpen, setIsOpen] = useBoolean();
  const [isShowVariantEntryForm, setIsShowVariantEntryForm] = useState(false);
  const { data, isLoading } = useSWR('/api/variants', fetcher);

  // initialize default selected variants base on provided defaultValues
  useEffect(() => {
    if (!isLoading && !selected.length && data?.length && defaultValues) {
      const filterData = data.filter((option: any) => defaultValues.includes(option.id));
      setSelected(
        filterData.map((p: any) => ({ label: p.name, uniqueName: p.value, value: p.id }))
      );
    }
  }, [isLoading, defaultValues, data]);

  // remove an item form selected variants
  const removeItem = (item: Option) => {
    const newSelection = selected.filter((o: Option) => o.value !== item.value);
    setSelected(newSelection);
    onSelect(newSelection);
  };

  // After creating a new variant,
  // this function marks the newly created variant as selected.
  const handleNewVariantCallbackFn = (data: any) => {
    if (data?.content) {
      const newItems = [...selected, { label: data.content.name, value: data.content.id }];

      setSelected(newItems);
      onSelect(newItems);
      setIsShowVariantEntryForm(false);
      mutate((path: string) => path.startsWith('/api/variants'));
    }
  };

  return (
    <Flex direction="column" gap={4}>
      {isShowVariantEntryForm && (
        <Box className="p-[8px] border-[1px] border-teal-500 border-dashed rounded-md">
          <VariantCreationForm
            removeVariantCallback={() => setIsShowVariantEntryForm(false)}
            afterFormSubmitCallback={handleNewVariantCallbackFn}
          />
        </Box>
      )}

      <Popover isOpen={isOpen} onOpen={setIsOpen.on} onClose={setIsOpen.off} matchWidth>
        <Flex className="p-[8px] border-[1px] border-teal-500 border-dashed rounded-md">
          <PopoverTrigger>
            <Button
              variant="outline"
              roundedRight={0}
              className="justify-start text-black font-normal w-full border-secondary-200 h-auto"
            >
              <Flex wrap="wrap" maxH="200px" overflowY="auto">
                {selected.length ? (
                  selected.map((s) => (
                    <Tag key={s.value} colorScheme="blue" m={1}>
                      <TagLabel className="line-clamp-1">{`${s.label} > ${s?.uniqueName}`}</TagLabel>
                      <TagCloseButton as="div" onClick={() => removeItem(s)} />
                    </Tag>
                  ))
                ) : (
                  <Text color="secondary.500">{t('Add variation')}</Text>
                )}
              </Flex>
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

        <PopoverContent className="w-full">
          <PopoverHeader className="border-secondary-200 p-1">
            <Button
              variant="ghost"
              className="w-full justify-start font-normal"
              onClick={() => {
                setIsOpen.off();
                setIsShowVariantEntryForm(true);
              }}
            >
              <Add />
              {t('Create new')}
            </Button>
          </PopoverHeader>
          <PopoverBody className="p-1 max-h-[400px] overflow-y-auto">
            {isLoading && (
              <HStack justifyContent="center" p="2.5">
                <Spinner size="sm" />
                <span>{t('Loading...')}</span>
              </HStack>
            )}
            {data?.length ? (
              data?.map((option: any) => (
                <Button
                  key={option.id}
                  variant="ghost"
                  className="w-full justify-start font-normal"
                  onClick={() => {
                    const newSelectedData = [
                      ...selected,
                      { label: option.name, uniqueName: option.value, value: option.id },
                    ];
                    onSelect(newSelectedData);
                    setSelected(newSelectedData);
                    setIsOpen.off();
                  }}
                >
                  {option.name} {' > '} {option.value}
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
