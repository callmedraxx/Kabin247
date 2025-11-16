import { Button, Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { Export, SearchNormal } from 'iconsax-react';
import { useTranslation } from 'react-i18next';

type ToolBarProps = {
  bulkAction?: {
    isBulkAction: boolean;
    BulkUpdateBar: React.FC;
  };
  filter: any;
  AddNew?: React.FC;
  exportUrl?: string;
  setSearchQuery: (value: string) => void;
};

export default function ToolBar({
  bulkAction = {
    isBulkAction: false,
    BulkUpdateBar: () => null,
  },
  filter,
  AddNew,
  exportUrl,
  setSearchQuery,
}: ToolBarProps) {
  const { t } = useTranslation();

  const exportCustomersData = () => {
    window.open(exportUrl, '_blank');
  };

  return (
    <div className="mb-5 lg:h-12">
      {bulkAction.isBulkAction ? (
        <bulkAction.BulkUpdateBar />
      ) : (
        <div className="flex items-center flex-wrap gap-4 justify-between">
          <div className="flex flex-1 items-center gap-2">
            {filter && filter}

            <InputGroup className="min-w-[200px] max-w-[300px]">
              <InputLeftElement pointerEvents="none" className="text-secondary-500">
                <SearchNormal size={18} color="currentColor" />
              </InputLeftElement>
              <Input
                type="search"
                placeholder={t('Search')}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white"
              />
            </InputGroup>
          </div>

          <div className="flex items-center gap-2">
            {AddNew && <AddNew />}
            {exportUrl && (
              <Button
                variant="outline"
                colorScheme="primary"
                className="border-primary-500 text-primary-500"
                rightIcon={<Export color="currentColor" />}
                onClick={exportCustomersData}
              >
                {t('Export')}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
