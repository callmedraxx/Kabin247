import useCategories from '@/data/use_categories';
import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  ListItem,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Spinner,
  Text,
  UnorderedList,
  useBoolean,
} from '@chakra-ui/react';
import { ArrowDown2, SearchNormal1 } from 'iconsax-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function MenuItemCategorySelection({
  defaultValue,
  onChange,
  placeholder = 'Search or select',
}: {
  defaultValue?: string; // defaultValue contain category id
  onChange: (category: Record<string, any>) => void;
  placeholder?: string;
}) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState('');
  const [search, setSearch] = useState('');
  const { categories, isLoading } = useCategories('/api/categories');
  const [isOpen, setIsOpen] = useBoolean();

  // initialize
  useEffect(() => {
    if (!isLoading && !selected?.length && categories?.length && defaultValue) {
      const category = categories.find((c: any) => c.id === defaultValue);
      setSelected(category?.name ?? '');
    }
  }, [isLoading, categories, defaultValue]);

  // filter categories
  const filteredCategories = (categories: Record<string, any>[], search: string) =>
    categories?.filter((c: Record<string, any>) =>
      c.name?.toLowerCase().includes(search?.toLowerCase() || '')
    );

  return (
    <Popover placement="bottom-start" isOpen={isOpen} onOpen={setIsOpen.on} onClose={setIsOpen.off}>
      <Flex className="max-w-[305px]">
        <PopoverTrigger>
          <Button
            variant="outline"
            roundedRight={0}
            className="justify-start text-black font-normal w-full border-secondary-200"
          >
            {selected || <Text color="secondary.500">{t(placeholder)}</Text>}
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

      <PopoverContent className="p-0">
        <PopoverHeader as="div" borderColor="secondary.200">
          <Box>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchNormal1 size="18" className="text-neInk-50" />
              </InputLeftElement>
              <Input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('Search category')}
              />
            </InputGroup>
          </Box>
        </PopoverHeader>
        <PopoverBody className="p-0">
          <UnorderedList listStyleType="none" p={1} m={0}>
            {isLoading ? (
              <ListItem className="px-4 py-1.5">
                <HStack justifyContent="center" p="2.5">
                  <Spinner size="sm" />
                  <Text>{t('Loading ...')}</Text>
                </HStack>
              </ListItem>
            ) : filteredCategories(categories, search)?.length ? (
              filteredCategories(categories, search)?.map((category: Record<string, any>) => (
                <ListItem
                  key={category.id}
                  onClick={() => {
                    setSelected(category.name);
                    onChange(category);
                    setIsOpen.off();
                  }}
                  className="hover:bg-secondary-50 py-1.5 px-4 cursor-pointer"
                >
                  {category.name}
                </ListItem>
              ))
            ) : (
              <ListItem className="text-secondary-400 px-4 py-1.5">
                {t('No category is listed')}
              </ListItem>
            )}
          </UnorderedList>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
