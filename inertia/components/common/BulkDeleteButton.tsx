import {
  Button,
  ButtonGroup,
  Popover,
  Portal
} from '@chakra-ui/react';
import { Trash } from 'iconsax-react';
import { useTranslation } from 'react-i18next';

export default function BulkDeleteButton({
  onDelete,
}: {
  onDelete: (row?: any) => void;
}) {
  const { t } = useTranslation();

  return (
    <Popover.Root onOpenChange={({ open }) => !open}>
      <Popover.Trigger asChild>
        <Button variant="outline" colorScheme="red">
          <Trash />
          {t('Delete')}
        </Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Header pt={4} fontWeight="bold" border="0">
              {t('Confirm delete')}
            </Popover.Header>
            <Popover.Arrow />
            <Popover.Body whiteSpace="normal">
              {t('Are you sure you want to delete?')}
            </Popover.Body>
            <Popover.Footer border="0" display="flex" alignItems="center" justifyContent="flex-end" pb={4}>
              <ButtonGroup size="sm">
                <Popover.CloseTrigger asChild>
                  <Button
                    colorScheme="secondary"
                    className="bg-secondary-200 text-secondary-800 hover:bg-secondary-300"
                  >
                    {t('Cancel')}
                  </Button>
                </Popover.CloseTrigger>
                <Button
                  colorScheme="red"
                  className="bg-red-400 hover:bg-red-500"
                  onClick={onDelete}
                >
                  {t('Delete')}
                </Button>
              </ButtonGroup>
            </Popover.Footer>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
