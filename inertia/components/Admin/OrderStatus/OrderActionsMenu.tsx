import { useRef } from 'react';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  HStack,
  Text,
  Box,
} from '@chakra-ui/react';
import { More, Eye, Trash, People, SmsTracking, DocumentText, TickCircle, DocumentCopy } from 'iconsax-react';
import { useTranslation } from 'react-i18next';
import DeleteOrder, { DeleteOrderRef } from './DeleteOrder';
import OrderPreviewButton from './ViewPreviewButton';
import axios from 'axios';
import { toast } from 'sonner';
import { useState } from 'react';

interface OrderActionsMenuProps {
  orderId: number;
  refresh: () => void;
  onEmailClient?: () => void;
  onEmailCaterer?: () => void;
  sendingClient?: boolean;
  sendingCaterer?: boolean;
  showEmailClient?: boolean;
  showEmailCaterer?: boolean;
  trigger?: 'icon' | 'row';
  onOpen?: () => void;
  onClose?: () => void;
  isOpen?: boolean;
}

export default function OrderActionsMenu({
  orderId,
  refresh,
  onEmailClient,
  onEmailCaterer,
  sendingClient = false,
  sendingCaterer = false,
  showEmailClient = true,
  showEmailCaterer = true,
  trigger = 'icon',
  onOpen,
  onClose,
  isOpen = false,
}: OrderActionsMenuProps) {
  const { t } = useTranslation();
  const previewButtonRef = useRef<HTMLButtonElement>(null);
  const deleteOrderRef = useRef<DeleteOrderRef>(null);
  const [sendingEstimate, setSendingEstimate] = useState(false);
  const [sendingConfirmation, setSendingConfirmation] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Find and click the preview button
    const previewButton = previewButtonRef.current?.querySelector('button');
    if (previewButton) {
      previewButton.click();
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Open the delete popover
    if (deleteOrderRef.current) {
      deleteOrderRef.current.open();
    }
  };

  const handleEmailEstimate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (sendingEstimate) return;
    setSendingEstimate(true);
    try {
      await axios.post(`/api/orders/${orderId}/email-estimate`);
      toast.success(t('Estimate emailed to client'));
      refresh();
    } catch (error: any) {
      toast.error(t(error.response?.data?.message || 'Failed to send estimate email'));
    } finally {
      setSendingEstimate(false);
    }
  };

  const handleEmailConfirmation = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (sendingConfirmation) return;
    setSendingConfirmation(true);
    try {
      await axios.post(`/api/orders/${orderId}/email-confirmation`);
      toast.success(t('Confirmation emailed to client'));
      refresh();
    } catch (error: any) {
      toast.error(t(error.response?.data?.message || 'Failed to send confirmation email'));
    } finally {
      setSendingConfirmation(false);
    }
  };

  const handleDuplicateOrder = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (duplicating) return;
    setDuplicating(true);
    try {
      await axios.post(`/api/orders/${orderId}/duplicate`);
      toast.success(t('Order duplicated successfully'));
      refresh();
    } catch (error: any) {
      toast.error(t(error.response?.data?.message || 'Failed to duplicate order'));
    } finally {
      setDuplicating(false);
    }
  };

  return (
    <>
      <Menu isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
        <MenuButton
          as={IconButton}
          aria-label={t('Order actions')}
          icon={<More size="20" color="currentColor" />}
          variant="ghost"
          size="sm"
          colorScheme="gray"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            if (onOpen) onOpen();
          }}
        />
        <MenuList>
          <MenuItem
            icon={<Eye size="18" />}
            onClick={handlePreviewClick}
          >
            {t('View Order')}
          </MenuItem>
          <MenuItem
            icon={<DocumentCopy size="18" />}
            onClick={handleDuplicateOrder}
            isDisabled={duplicating}
            closeOnSelect={false}
          >
            <HStack>
              <Text>{t('Duplicate Order')}</Text>
              {duplicating && <Text fontSize="xs" color="gray.500">...</Text>}
            </HStack>
          </MenuItem>
          <MenuItem
            icon={<DocumentText size="18" />}
            onClick={handleEmailEstimate}
            isDisabled={sendingEstimate}
            closeOnSelect={false}
          >
            <HStack>
              <Text>{t('Email Estimate')}</Text>
              {sendingEstimate && <Text fontSize="xs" color="gray.500">...</Text>}
            </HStack>
          </MenuItem>
          <MenuItem
            icon={<TickCircle size="18" />}
            onClick={handleEmailConfirmation}
            isDisabled={sendingConfirmation}
            closeOnSelect={false}
          >
            <HStack>
              <Text>{t('Email Confirmation')}</Text>
              {sendingConfirmation && <Text fontSize="xs" color="gray.500">...</Text>}
            </HStack>
          </MenuItem>
          {showEmailCaterer && onEmailCaterer && (
            <MenuItem
              icon={<People size="18" />}
              onClick={(e) => {
                e.stopPropagation();
                onEmailCaterer();
              }}
              isDisabled={sendingCaterer}
              closeOnSelect={false}
            >
              <HStack>
                <Text>{t('Send email to caterer')}</Text>
                {sendingCaterer && <Text fontSize="xs" color="gray.500">...</Text>}
              </HStack>
            </MenuItem>
          )}
          {showEmailClient && onEmailClient && (
            <MenuItem
              icon={<SmsTracking size="18" />}
              onClick={(e) => {
                e.stopPropagation();
                onEmailClient();
              }}
              isDisabled={sendingClient}
              closeOnSelect={false}
            >
              <HStack>
                <Text>{t('Send invoice to client')}</Text>
                {sendingClient && <Text fontSize="xs" color="gray.500">...</Text>}
              </HStack>
            </MenuItem>
          )}
          <MenuItem
            icon={<Trash size="18" />}
            onClick={handleDeleteClick}
            color="red.500"
          >
            {t('Delete Order')}
          </MenuItem>
        </MenuList>
      </Menu>

      {/* Hidden trigger buttons for existing components */}
      <Box position="absolute" left="-9999px" opacity={0} pointerEvents="none" width="1px" height="1px" overflow="hidden">
        <div ref={previewButtonRef}>
          <OrderPreviewButton orderId={orderId} refresh={refresh} />
        </div>
      </Box>
      {/* DeleteOrder needs to be outside hidden box for Popover to render */}
      <Box position="absolute" left="-9999px" width="1px" height="1px" overflow="hidden">
        <DeleteOrder
          ref={deleteOrderRef}
          isIconButton={true}
          id={orderId}
          refresh={refresh}
          onClose={onClose}
        />
      </Box>
    </>
  );
}

