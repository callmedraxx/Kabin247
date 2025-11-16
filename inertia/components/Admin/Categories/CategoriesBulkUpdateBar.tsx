import BulkDeleteButton from '@/components/common/BulkDeleteButton';
import { HStack, Switch, Text } from '@chakra-ui/react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { mutate } from 'swr';

export default function CategoriesBulkUpdateBar({
  rows,
  reset,
  available,
  setAvailable,
}: {
  rows: Record<string, any>[];
  reset?: () => void;
  available: boolean;
  setAvailable: (data: boolean) => void;
}) {
  const { t } = useTranslation();

  // update bulk availability
  const updateBulkAvailability = (available: boolean) => {
    toast.promise(
      axios.patch('/api/categories/bulk/update', {
        ids: rows.map((row: any) => row.id),
        isAvailable: available,
      }),
      {
        loading: t('Updating availability...'),
        success: () => {
          mutate((key: string) => key.startsWith('/api/categories'));
          return t('Categories availability updated successfully');
        },
        error: () => {
          return t('Failed to update categories availability');
        },
      }
    );
  };

  // delete selected rows
  const deleteSelectedRows = () => {
    toast.promise(
      axios.delete('/api/categories/bulk/delete', {
        data: {
          ids: rows.map((row: any) => row.id),
        },
      }),
      {
        loading: t('Deleting...'),
        success: () => {
          reset?.();
          mutate((key: string) => key.startsWith('/api/categories'));
          return t('Categories deleted successfully');
        },
        error: () => {
          return t('Failed to delete categories');
        },
      }
    );
  };

  return (
    <div className="w-full flex items-center justify-end">
      <div className="flex items-center gap-4">
        <HStack className="ml-auto">
          <Text color="secondary.400"> {t('Availability')} </Text>
          <Switch
            size="lg"
            colorScheme="green"
            isChecked={available}
            onChange={(e) => {
              setAvailable(e.target.checked);
              updateBulkAvailability(e.target.checked);
            }}
          />
        </HStack>

        <BulkDeleteButton onDelete={deleteSelectedRows} />
      </div>
    </div>
  );
}
