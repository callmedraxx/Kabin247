import { toast } from 'sonner';
import axios from 'axios';
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
import { Trash } from 'iconsax-react';
import { useTranslation } from 'react-i18next';

export default function DeleteVariant({
  isIconButton = false,
  id,
  refresh,
  onCloseCallback,
  trigger,
}: {
  isIconButton?: boolean;
  id: number;
  refresh: () => void;
  onCloseCallback?: () => void;
  trigger?: React.ReactNode;
}) {
  const { t } = useTranslation();

  // Handle delete variant action
  const handleDeleteVariant = async () => {
    try {
      const response = await axios.delete<{ message: string }>(`/api/variants/${id}`);
      if (response.status === 200) {
        toast.success(response.data.message);
        refresh();
        onCloseCallback?.();
      }
    } catch (error) {
      // Extract and display error message if the request fails
      const errorMessage =
        axios.isAxiosError(error) && error.response
          ? error.response.data.message || t('Something went wrong')
          : t('Something went wrong');

      toast.error(errorMessage);
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
                variant="outline"
                _hover={{ bg: 'red.100' }}
              />
            ) : (
              (trigger ?? (
                <Button variant="outline" w="full" colorScheme="red" mr={3}>
                  {t('Delete this variant')}
                </Button>
              ))
            )}
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverHeader pt={4} fontWeight="bold" w="full" border="0">
              {t('Delete variant')}
            </PopoverHeader>
            <PopoverBody whiteSpace="normal">{t('Are you sure you want to delete this variant?')}</PopoverBody>
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
                  type="button"
                  colorScheme="red"
                  className="bg-red-400 hover:bg-red-500"
                  onClick={handleDeleteVariant}
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
