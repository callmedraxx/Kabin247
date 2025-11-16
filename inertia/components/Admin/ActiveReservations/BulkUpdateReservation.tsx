import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import axios from 'axios';
import { Button, HStack, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import { ArrowDown2 } from 'iconsax-react';
import BulkDeleteButton from '@/components/common/BulkDeleteButton';
import { reservationStatus, ReservationStatusType } from '@/utils/reservation_status';

export default function BulkUpdateReservation({ rows }: any) {
  const [bulkStatus, setBulkStatus] = useState<ReservationStatusType>();
  const { t } = useTranslation();
  const { mutate } = useSWRConfig();

  // update bulk status
  const updateBulkStatus = async (status: ReservationStatusType) => {
    setBulkStatus(status);

    // update bulk status
    toast.promise(
      axios.patch('/api/reservations/bulk/update', {
        ids: rows.map((row: any) => row.id),
        status: status.value,
      }),
      {
        loading: t('Status updating...'),
        success: () => {
          mutate((key: string) => key.startsWith('/api/reservations'));
          return t('Reservation updated successfully');
        },
        error: () => {
          return t('Reservation update failed');
        },
      }
    );
  };

  // delete selected Rows
  const deleteSelectedRows = (rows: any) => {
    toast.promise(
      axios.delete('/api/reservations/bulk/delete', {
        data: {
          ids: rows.map((row: any) => row.id),
        },
      }),

      {
        loading: t('Deleting...'),
        // on success
        success: () => {
          mutate((key: string) => key.startsWith('/api/reservations'));
          return t('Reservation deleted successfully');
        },
        // on error
        error: () => {
          return t('Reservation deletion failed');
        },
      }
    );
  };

  return (
    <div className="w-full flex items-center justify-end">
      <div className="flex items-center gap-4">
        <HStack className="ml-auto">
          <Menu>
            <MenuButton
              as={Button}
              variant="outline"
              colorScheme={bulkStatus?.scheme}
              color={bulkStatus?.fgColor}
              borderColor={bulkStatus?.fgColor}
              rightIcon={<ArrowDown2 />}
            >
              {bulkStatus?.label || t('Bulk status')}
            </MenuButton>
            <MenuList className="p-1">
              {reservationStatus.map((option) => (
                <MenuItem
                  key={option.value}
                  color={option.fgColor}
                  bgColor={option.bgColor}
                  onClick={() => updateBulkStatus(option)}
                >
                  {t(option.label)}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </HStack>

        <BulkDeleteButton onDelete={deleteSelectedRows} />
      </div>
    </div>
  );
}
