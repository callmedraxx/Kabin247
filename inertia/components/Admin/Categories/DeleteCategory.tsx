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
import { toast } from 'sonner';

export default function DeleteCategory({
  isIconButton = false,
  id,
  refresh,
}: {
  isIconButton?: boolean;
  id: number;
  refresh: () => void;
}) {
  const { t } = useTranslation();

  // delete category
  const handleDeleteCategory = async () => {
    try {
      const { data, status } = await axios.delete(`/api/categories/${id}`);
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
              {t('Delete Category')}
            </PopoverHeader>
            <PopoverArrow />
            <PopoverBody whiteSpace="normal">
              {t('Are you sure you want to delete this category?')}
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
                  onClick={handleDeleteCategory}
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
