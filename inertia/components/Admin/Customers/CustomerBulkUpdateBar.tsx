import axios from 'axios';
import { HStack, Switch, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { mutate } from 'swr';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import BulkDeleteButton from '@/components/common/BulkDeleteButton';

export default function CustomerBulkUpdateBar({
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

  const {
    props: { auth },
  } = usePage() as { props: PageProps };

  // handle bulk update
  const updateBulkData = (formData: Record<string, string | number | boolean>) => {
    toast.promise(
      axios.patch('/api/users/bulk/update', {
        ids: rows.map((row: any) => row.id),
        ...formData,
      }),
      {
        loading: t('Updating...'),
        success: () => {
          mutate((key: string) => key.startsWith('/api/users'));
          return t('Clients data updated successfully');
        },
        error: () => {
          return t('Failed to update customers data');
        },
      }
    );
  };

  // handle delete customers
  const deleteSelectedCustomer = () => {
    toast.promise(
      axios.delete('/api/users/bulk/delete', {
        data: {
          ids: rows.map((row: any) => row.id),
        },
      }),
      {
        loading: t('Deleting...'),
        success: () => {
          mutate((key: string) => key.startsWith('/api/users'));
          reset?.();
          return t('Clients deleted successfully');
        },
        error: () => {
          return t('Failed to delete customers');
        },
      }
    );
  };

  const isSelf = rows.findIndex((row) => row.id === auth?.id) > -1;

  return (
    <div className="w-full flex items-center justify-end">
      <div className="flex items-center gap-4">
        {/* Bulk status */}
        <HStack>
          <Text color="secondary.400">{t('Bulk status')}</Text>
          <Switch
            colorScheme="green"
            size="lg"
            isChecked={available}
            onChange={(e) => {
              setAvailable(e.target.checked);
              updateBulkData({
                isSuspended: e.target.checked,
              });
            }}
          />
        </HStack>

        {/* delete selected customers */}
        <div className="relative">
          <BulkDeleteButton onDelete={deleteSelectedCustomer} />

          {isSelf && (
            <Text className="text-xs absolute top-full whitespace-nowrap right-0 text-secondary-400 translate-y-1">
              {t('You can not delete yourself')}
            </Text>
          )}
        </div>
      </div>
    </div>
  );
}
