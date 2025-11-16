import {
  Button,
  ButtonGroup,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
} from '@chakra-ui/react';
import axios from 'axios';
import { Trash } from 'iconsax-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export default function DeleteTranslation({
  isIconButton = false,
  id,
  refresh,
}: {
  isIconButton?: boolean;
  id: number;
  refresh: () => void;
}) {
  const { t } = useTranslation();

  const handleDeleteTranslation = async () => {
    try {
      const { data } = await axios.delete(`/admin/languages/translations/${id}`);
      if (data?.message) {
        toast.success(t('Translation deleted successfully'));
        refresh();
      }
    } catch (e) {
      toast.error(e.response.data.message || t('Something went wrong'));
    }
  };

  return (
    <Popover>
      {({ onClose }) => (
        <>
          <PopoverTrigger>
            {isIconButton ? (
              <IconButton
                aria-label={t('Delete')}
                icon={<Trash size="18" color="currentColor" />}
                colorScheme="red"
                className="hover:bg-red-100 text-red-600"
                variant="outline"
              />
            ) : (
              <Button variant="outline" w="full" colorScheme="red" mr={3}>
                {t('Delete')}
              </Button>
            )}
          </PopoverTrigger>
          <PopoverContent>
            <PopoverHeader pt={4} fontWeight="bold" border="0">
              {t('Delete translation')}
            </PopoverHeader>
            <PopoverArrow />
            <PopoverBody className="whitespace-normal">
              {t('Are you sure you want to delete this translation?')}
            </PopoverBody>
            <PopoverFooter
              border="0"
              display="flex"
              alignItems="center"
              justifyContent="flex-end"
              pb={4}
            >
              <ButtonGroup size="sm">
                <Button
                  colorScheme="secondary"
                  className="bg-secondary-200 text-secondary-800 hover:bg-secondary-300"
                  onClick={onClose}
                >
                  {t('Cancel')}
                </Button>
                <Button
                  colorScheme="red"
                  className="bg-red-400 hover:bg-red-500"
                  onClick={handleDeleteTranslation}
                >
                  {t('Delete')}
                </Button>
              </ButtonGroup>
            </PopoverFooter>
          </PopoverContent>
        </>
      )}
    </Popover>
  );
}
