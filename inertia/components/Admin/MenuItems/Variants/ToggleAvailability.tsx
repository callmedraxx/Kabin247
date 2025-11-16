import axios from 'axios';
import { toast } from 'sonner';
import { Switch } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

export default function ToggleAvailability({
  isAvailable,
  id,
  refresh,
}: {
  isAvailable: boolean;
  id: number;
  refresh: () => void;
}) {
  const { t } = useTranslation();

  const updateItemAvailability = async (isAvailable: boolean) => {
    try {
      const { data, status } = await axios.patch(`/api/variants/${id}`, {
        isAvailable,
      });

      if (status === 200) {
        toast.success(data.message);
        refresh();
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(t('Something went wrong'));
      }
    }
  };

  return (
    <Switch
      colorScheme="green"
      defaultChecked={Boolean(isAvailable)}
      size="lg"
      onChange={(e) => updateItemAvailability(e.target.checked)}
    />
  );
}
