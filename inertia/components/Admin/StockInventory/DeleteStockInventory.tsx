import { useState } from 'react';
import axios from 'axios';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  IconButton,
  useDisclosure,
} from '@chakra-ui/react';
import { Trash } from 'iconsax-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useRef } from 'react';

type DeleteStockInventoryProps = {
  stockInventory: any;
  refresh: () => void;
};

export default function DeleteStockInventory({ stockInventory, refresh }: DeleteStockInventoryProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { t } = useTranslation();

  const { id, name } = stockInventory || {};

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const { data } = await axios.delete(`/api/stock-inventories/${id}`);
      if (data?.success) {
        onClose();
        refresh();
        toast.success(t(data?.message) || t('Stock inventory deleted successfully'));
      }
    } catch (e: any) {
      toast.error(t(e.response?.data?.message) || t('Something went wrong'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <IconButton
        aria-label="Delete"
        icon={<Trash size="18" color="currentColor" />}
        colorScheme="red"
        className="hover:bg-red-100 text-red-600"
        variant="outline"
        size="sm"
        onClick={onOpen}
      />
      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {t('Delete Stock Inventory')}
            </AlertDialogHeader>

            <AlertDialogBody>
              {t('Are you sure you want to delete')} <strong>{name}</strong>? {t('This action cannot be undone.')}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                {t('Cancel')}
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDelete}
                ml={3}
                isLoading={isDeleting}
                className="bg-red-500 hover:bg-red-600"
              >
                {t('Delete')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}

