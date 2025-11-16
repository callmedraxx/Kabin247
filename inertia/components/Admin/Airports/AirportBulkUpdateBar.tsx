import axios from 'axios';
import { Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { mutate } from 'swr';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import BulkDeleteButton from '@/components/common/BulkDeleteButton';

export default function AirportBulkUpdateBar({
  rows,
  reset,
}: {
  rows: Record<string, any>[];
  reset?: () => void;
}) {
  const { t } = useTranslation();

  const {
    props: { auth },
  } = usePage() as { props: PageProps };

  const deleteSelectedAirport = () => {
    toast.promise(
      axios.delete('/api/airports/bulk/delete', {
        data: {
          ids: rows.map((row: any) => row.id),
        },
      }),
      {
        loading: t('Deleting...'),
        success: () => {
          mutate((key: string) => key.startsWith('/api/airports'));
          reset?.();
          return t('Airports deleted successfully');
        },
        error: () => {
          return t('Failed to delete airports');
        },
      }
    );
  };

  const isSelf = rows.findIndex((row) => row.id === auth?.id) > -1;

  return (
    <div className="w-full flex items-center justify-end">
      <div className="flex items-center gap-4">

        {/* delete selected airports */}
        <div className="relative">
          <BulkDeleteButton onDelete={deleteSelectedAirport} />

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
