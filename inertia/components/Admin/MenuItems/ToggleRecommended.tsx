import { Switch } from '@chakra-ui/react';
import axios from 'axios';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export default function ToggleRecommended({
  isRecommended,
  id,
  refresh,
}: {
  isRecommended: boolean;
  id: number;
  refresh: () => void;
}) {
  const { t } = useTranslation();

  const updateItemAvailability = async (isRecommended: boolean) => {
    try {
      const { data, status } = await axios.patch(`/api/menu-items/${id}`, {
        isRecommended,
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
      defaultChecked={Boolean(isRecommended)}
      size="lg"
      onChange={(e) => updateItemAvailability(e.target.checked)}
    />
  );
}
