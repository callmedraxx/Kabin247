import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  useDisclosure,
} from '@chakra-ui/react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function CurrencyItem({
  currency,
  onSelect,
}: {
  currency: { cc: string };
  onSelect: (currency: { cc: string }) => void;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslation();
  const ref = useRef(null);

  return (
    <>
      <Button
        aria-label={currency.cc}
        variant="ghost"
        size="sm"
        className="font-normal text-center justify-start w-full"
        onClick={onOpen}
      >
        {t(currency.cc)}
      </Button>

      <AlertDialog isCentered leastDestructiveRef={ref} isOpen={isOpen} onClose={onClose}>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader> ⚠️ Warning</AlertDialogHeader>

          <AlertDialogBody>
            {t(
              'Changing the currency will only update the currency symbol (e.g., $, €, £) but will not convert the actual currency values. Please ensure this is your intended action before proceeding.'
            )}
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={ref} onClick={onClose}>
              Discard Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={() => {
                onClose();
                onSelect(currency);
              }}
              ml={3}
            >
              Apply Change
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
