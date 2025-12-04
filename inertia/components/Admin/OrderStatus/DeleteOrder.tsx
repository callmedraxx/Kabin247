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
  useDisclosure,
} from '@chakra-ui/react';
import { Trash } from 'iconsax-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useImperativeHandle, forwardRef } from 'react';

export interface DeleteOrderRef {
  open: () => void;
}

const DeleteOrder = forwardRef<DeleteOrderRef, {
  isIconButton: boolean;
  id: number;
  refresh: () => void;
  onClose?: () => void;
}>(({ isIconButton = false, id, refresh, onClose }, ref) => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose: closePopover } = useDisclosure();

  useImperativeHandle(ref, () => ({
    open: onOpen,
  }));

  const onDelete = async () => {
    try {
      const { data, status } = await axios.delete(`/api/orders/${id}`);
      if (status === 200) {
        toast.success(data.message);
        refresh();
        closePopover();
        if (onClose) onClose();
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(t('Something went wrong'));
      }
    }
  };

  return (
    <Popover isOpen={isOpen} onOpen={onOpen} onClose={closePopover}>
      <PopoverTrigger>
        {isIconButton ? (
          <IconButton
            aria-label={t('Delete')}
            icon={<Trash size="18" color="currentColor" />}
            colorScheme="red"
            className="hover:bg-red-100 text-red-600"
            variant="outline"
            style={{ display: 'none' }}
          />
        ) : (
          <Button variant="outline" w="full" colorScheme="red" mr={3}>
            {t('Delete')}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverHeader pt={4} fontWeight="bold" border="0">
          {t('Delete order')}
        </PopoverHeader>
        <PopoverBody whiteSpace="normal">
          {t('Are you sure you want to delete this order?')}
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
              onClick={closePopover}
            >
              {t('Cancel')}
            </Button>
            <Button
              type="button"
              colorScheme="red"
              className="bg-red-400 hover:bg-red-500"
              onClick={onDelete}
            >
              {t('Delete')}
            </Button>
          </ButtonGroup>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
});

DeleteOrder.displayName = 'DeleteOrder';

export default DeleteOrder;
