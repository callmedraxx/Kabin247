import FilterMenuItem from '@/components/Admin/MenuItems/FilterMenuItem';
import MenuItemTable from '@/components/Admin/MenuItems/MenuItemTable';
import MenuItemVariantsTable from '@/components/Admin/MenuItems/MenuItemVariantsTable';
import NewMenuItem from '@/components/Admin/MenuItems/NewMenuItem';
import FilterVariants from '@/components/Admin/MenuItems/Variants/FilterVariants';
import BulkDeleteButton from '@/components/common/BulkDeleteButton';
import Layout from '@/components/common/Layout';
import useTableData from '@/data/use_table_data';
import useDebounce from '@/hooks/useDebounce';
import {
  Button,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react';
import { SortingState } from '@tanstack/react-table';
import axios from 'axios';
import { Export, SearchNormal } from 'iconsax-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

// filter options types
type FilterOptions = Partial<{
  status: string;
  category: string;
  categoryName: string;
  foodType: string;
  available: string;
}>;

export default function MenuItems() {
  const { t } = useTranslation();
  const [tabIndex, setTabIndex] = useState(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filter, setFilter] = useState<FilterOptions>({});
  const [selectedRows, setSelectedRows] = useState<Record<string, any>[]>([]);
  const [bulkAvailability, setBulkAvailability] = useState<boolean>(false);
  const [bulkRecommended, setBulkRecommended] = useState<boolean>(false);

  const searchedText = useDebounce(searchQuery, 300);

  const { items, meta, isLoading, refresh, isValidating } = useTableData('/api/menu-items', {
    page,
    limit,
    search: searchedText,
    ...filter,
  });

  const variants = useTableData('/api/variants', {
    page,
    limit,
    search: searchedText,
    ...filter,
  });

  // if there is no selected rows, unselect all
  useEffect(() => {
    if (!isValidating && items.length === 0) {
      setSelectedRows([]);
      setBulkAvailability(false);
    }
  }, [isValidating]);

  useEffect(() => {
    setBulkAvailability(false);
  }, [setSelectedRows]);

  // update bulk Action
  const updateBulkAction = (available: boolean, type: string) => {
    if (type === 'availability') {
      setBulkAvailability(available);
      toast.promise(
        axios.patch('/api/menu-items/bulk/update', {
          ids: selectedRows.map((row: any) => row.id),
          isAvailable: available,
        }),
        {
          loading: t('Updating...'),
          success: () => {
            refresh();
            return t('Menu items updated successfully.');
          },
          error: () => {
            setBulkAvailability(false);
            return t('Failed to update menu items.');
          },
        }
      );
    } else {
      setBulkRecommended(available);
      toast.promise(
        axios.patch('/api/menu-items/bulk/update', {
          ids: selectedRows.map((row: any) => row.id),
          isRecommended: available,
        }),
        {
          loading: t('Updating...'),
          success: () => {
            refresh();
            return t('Menu items updated successfully.');
          },
          error: () => {
            setBulkAvailability(false);
            return t('Failed to update menu items.');
          },
        }
      );
    }
  };

  // delete selected rows
  const deleteSelectedRows = () => {
    toast.promise(
      axios.delete('/api/menu-items/bulk/delete', {
        data: {
          ids: selectedRows.map((row: any) => row.id),
        },
      }),
      {
        loading: t('Deleting...'),
        success: () => {
          refresh();
          setSelectedRows([]);
          return t('Menu items deleted successfully.');
        },
        error: () => {
          setBulkAvailability(false);
          return t('Failed to delete menu item.');
        },
      }
    );
  };

  const handleTabChange = (index: number) => {
    setTabIndex(index);
  };

  return (
    <Layout title={t('Menu items')}>
      <Tabs
        className="p-6"
        index={tabIndex}
        onChange={() => {
          setPage(1);
          setSearchQuery('');
          setFilter({});
          handleTabChange(tabIndex === 0 ? 1 : 0);
        }}
      >
        <div className="mb-5 lg:h-12">
          {selectedRows.length ? (
            <div className="flex justify-end items-center gap-4">
              <HStack>
                <Text color="secondary.400"> {t('Recommended')} </Text>
                <Switch
                  size="lg"
                  colorScheme="green"
                  isChecked={bulkRecommended}
                  onChange={(e) => updateBulkAction(e.target.checked, 'recommended')}
                />
              </HStack>
              <HStack>
                <Text color="secondary.400"> {t('Availability')} </Text>
                <Switch
                  size="lg"
                  colorScheme="green"
                  isChecked={bulkAvailability}
                  onChange={(e) => updateBulkAction(e.target.checked, 'availability')}
                />
              </HStack>

              <BulkDeleteButton onDelete={deleteSelectedRows} />
            </div>
          ) : (
            <div className="flex justify-between">
              <HStack flexGrow={1} className="flex-wrap gap-y-1.5 gap-x-3">
                <TabList>
                  <Tab>{t('Items')}</Tab>
                  <Tab>{t('Variants')}</Tab>
                </TabList>

                {tabIndex === 0 ? (
                  <FilterMenuItem filter={filter} setFilter={setFilter} />
                ) : (
                  <FilterVariants filter={filter} setFilter={setFilter} />
                )}

                <div className="flex-1">
                  <InputGroup className="min-w-[200px] max-w-80">
                    <InputLeftElement pointerEvents="none">
                      <SearchNormal size={18} />
                    </InputLeftElement>
                    <Input
                      type="search"
                      placeholder={t('Search')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-white"
                    />
                  </InputGroup>
                </div>

                <div className="flex items-center gap-3">
                  {tabIndex === 0 && (
                    <>
                      <NewMenuItem refresh={refresh} />
                      <Button
                        variant="outline"
                        colorScheme="primary"
                        className="border-primary-500 text-primary-500"
                        rightIcon={<Export size={16} color="currentColor" />}
                        onClick={() => window.open('/api/menu-items/export/all', '_blank')}
                      >
                        {t('Export')}
                      </Button>
                    </>
                  )}
                </div>
              </HStack>
            </div>
          )}
        </div>
        <TabPanels>
          {/* Menu table */}
          <TabPanel py={0}>
            <MenuItemTable
              {...{
                items,
                meta,
                isLoading,
                refresh,
                sorting,
                setSorting,
                page,
                setPage,
                limit,
                setLimit,
                setSelectedRows,
              }}
            />
          </TabPanel>

          {/* Variants table */}
          <TabPanel py={0}>
            <MenuItemVariantsTable variants={variants} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Layout>
  );
}
