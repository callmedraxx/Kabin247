import {
  Button,
  ButtonGroup,
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

export default function BulkDeleteButton({
  onDelete,
  disabled = false,
}: {
  onDelete: (row?: any) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <Popover>
      {({ onClose }) => (
        <>
          <PopoverTrigger>
            <Button variant="outline" colorScheme="red" isDisabled={disabled} leftIcon={<Trash size="18" />}>
              {t('Delete')}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverHeader pt={4} fontWeight="bold" border="0">
              {t('Confirm delete')}
            </PopoverHeader>
            <PopoverBody whiteSpace="normal">
              {t('Are you sure you want to delete the selected items?')}
            </PopoverBody>
            <PopoverFooter border="0" display="flex" alignItems="center" justifyContent="flex-end" pb={4}>
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
                  onClick={() => {
                    onDelete();
                    onClose();
                  }}
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
