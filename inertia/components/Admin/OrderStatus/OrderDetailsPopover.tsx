import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Text,
  VStack,
  HStack,
  Divider,
  Badge,
  Box,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { convertToCurrencyFormat } from '@/utils/currency_formatter';

interface OrderDetailsPopoverProps {
  order: any;
  children: React.ReactNode;
}

export default function OrderDetailsPopover({ order, children }: OrderDetailsPopoverProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const rowRef = useRef<HTMLTableRowElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  if (!order) return <>{children}</>;

  const orderItems = order.orderItems || [];
  const airport = order.deliveryAirport;
  const caterer = order.deliveryMan;
  const airportDisplay = airport
    ? `${airport.fboName || airport.name || ''}${
        airport.iataCode || airport.icaoCode
          ? ` (${[airport.iataCode, airport.icaoCode].filter(Boolean).join(' / ')})`
          : ''
      }`
    : '-';

  // Ref callback to attach to the row element - use a more direct approach
  const setRowRef = React.useCallback((node: HTMLTableRowElement | null) => {
    if (node) {
      rowRef.current = node;
    }
  }, []);

  // Calculate popover position based on row position
  const [popoverPosition, setPopoverPosition] = React.useState({ 
    left: 0, 
    top: 0, 
    placement: 'right' as 'left' | 'right',
    arrowTop: 16 
  });
  
  const updatePopoverPosition = React.useCallback(() => {
    if (!rowRef.current) return;
    const rect = rowRef.current.getBoundingClientRect();
    const popoverWidth = 400; // Fixed width from the Box component
    const popoverMaxHeight = 600; // Max height from the Box component
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const offset = 8; // Gap between row and popover
    
    // Check if popover would overflow on the right
    const spaceOnRight = viewportWidth - rect.right;
    const spaceOnLeft = rect.left;
    const wouldOverflowRight = spaceOnRight < popoverWidth + offset;
    const wouldOverflowLeft = spaceOnLeft < popoverWidth + offset;
    
    // Determine placement: prefer right, but use left if right would overflow
    let left: number;
    let placement: 'left' | 'right';
    
    if (wouldOverflowRight && !wouldOverflowLeft) {
      // Position to the left of the row
      placement = 'left';
      left = rect.left - popoverWidth - offset;
    } else {
      // Position to the right of the row (default)
      placement = 'right';
      left = rect.right + offset;
    }
    
    // Ensure popover doesn't go off-screen horizontally
    left = Math.max(8, Math.min(left, viewportWidth - popoverWidth - 8));
    
    // Calculate vertical position - ensure it doesn't overflow bottom
    let top = rect.top;
    const spaceBelow = viewportHeight - rect.top;
    const spaceAbove = rect.top;
    
    // If popover would overflow bottom, position it above or adjust
    if (spaceBelow < popoverMaxHeight && spaceAbove > spaceBelow) {
      // Position above the row if there's more space above
      top = rect.bottom - popoverMaxHeight;
    }
    
    // Ensure popover doesn't go off-screen vertically
    top = Math.max(8, Math.min(top, viewportHeight - popoverMaxHeight - 8));
    
    // Calculate arrow position relative to popover top to align with row center
    const rowCenter = rect.top + rect.height / 2;
    const arrowTop = Math.max(8, Math.min(rowCenter - top, popoverMaxHeight - 16));
    
    setPopoverPosition({ left, top, placement, arrowTop });
  }, []);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const handleMouseEnter = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        updatePopoverPosition();
        setIsOpen(true);
      }, 300);
    };

    const handleMouseLeave = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 100);
    };

    row.addEventListener('mouseenter', handleMouseEnter);
    row.addEventListener('mouseleave', handleMouseLeave);

    // Update position on scroll/resize
    const handleUpdate = () => {
      if (isOpen) {
        updatePopoverPosition();
      }
    };
    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    return () => {
      row.removeEventListener('mouseenter', handleMouseEnter);
      row.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen, updatePopoverPosition]);

  // Clone children and add ref callback to the Tr element
  // Use a ref callback that merges with any existing ref
  const childrenWithRef = React.cloneElement(children as React.ReactElement, {
    ref: (node: HTMLTableRowElement | null) => {
      rowRef.current = node;
      // Call original ref if it exists
      const originalRef = (children as React.ReactElement).ref;
      if (typeof originalRef === 'function') {
        originalRef(node);
      } else if (originalRef && 'current' in originalRef) {
        (originalRef as React.MutableRefObject<HTMLTableRowElement | null>).current = node;
      }
    },
  });

  // Render popover content directly to document.body using createPortal
  const popoverContent = isOpen ? (
    <Box
            position="fixed"
            left={popoverPosition.left}
            top={popoverPosition.top}
            zIndex={1000}
            width="400px"
            maxHeight="600px"
            bg="white"
            borderRadius="md"
            boxShadow="lg"
            border="1px solid"
            borderColor="gray.200"
            overflowY="auto"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            _before={popoverPosition.placement === 'right' ? {
              // Arrow pointing left (towards row on right)
              content: '""',
              position: 'absolute',
              left: '-8px',
              top: `${popoverPosition.arrowTop}px`,
              width: 0,
              height: 0,
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
              borderRight: '8px solid white',
            } : {
              // Arrow pointing right (towards row on left)
              content: '""',
              position: 'absolute',
              right: '-8px',
              top: `${popoverPosition.arrowTop}px`,
              width: 0,
              height: 0,
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
              borderLeft: '8px solid white',
            }}
            _after={popoverPosition.placement === 'right' ? {
              // Arrow border pointing left (towards row on right)
              content: '""',
              position: 'absolute',
              left: '-9px',
              top: `${popoverPosition.arrowTop - 1}px`,
              width: 0,
              height: 0,
              borderTop: '9px solid transparent',
              borderBottom: '9px solid transparent',
              borderRight: '9px solid',
              borderRightColor: 'gray.200',
            } : {
              // Arrow border pointing right (towards row on left)
              content: '""',
              position: 'absolute',
              right: '-9px',
              top: `${popoverPosition.arrowTop - 1}px`,
              width: 0,
              height: 0,
              borderTop: '9px solid transparent',
              borderBottom: '9px solid transparent',
              borderLeft: '9px solid',
              borderLeftColor: 'gray.200',
            }}
          >
            <Box p={4}>
          <VStack align="stretch" spacing={3}>
            {/* Order Basic Info */}
            <Box>
              <Text fontWeight="bold" fontSize="md" mb={2} color="primary.600">
                {t('Order')} #{order.orderNumber}
              </Text>
              <HStack spacing={2} mb={1}>
                <Text fontSize="sm" fontWeight="medium">
                  {t('Client')}:
                </Text>
                <Text fontSize="sm">{order?.user?.fullName || 'Guest'}</Text>
              </HStack>
              <HStack spacing={2} mb={1}>
                <Text fontSize="sm" fontWeight="medium">
                  {t('Type')}:
                </Text>
                <Badge
                  variant="solid"
                  colorScheme={
                    order.type === 'dine_in'
                      ? 'teal'
                      : order.type === 'delivery'
                        ? 'primary'
                        : 'blue'
                  }
                  fontSize="xs"
                >
                  {t(order.type?.replace('_', '-'))}
                </Badge>
              </HStack>
              <HStack spacing={2}>
                <Text fontSize="sm" fontWeight="medium">
                  {t('Status')}:
                </Text>
                <Text fontSize="sm">{t(order.status)}</Text>
              </HStack>
            </Box>

            <Divider />

            {/* Delivery Information */}
            {order.type === 'delivery' && (
              <>
                <Box>
                  <Text fontWeight="semibold" fontSize="sm" mb={2} color="blue.600">
                    {t('Delivery Information')}
                  </Text>
                  {airport && (
                    <VStack align="stretch" spacing={1} mb={2}>
                      <HStack>
                        <Text fontSize="xs" fontWeight="medium">
                          {t('Airport')}:
                        </Text>
                        <Text fontSize="xs">{airportDisplay}</Text>
                      </HStack>
                      {airport.fboEmail && (
                        <HStack>
                          <Text fontSize="xs" fontWeight="medium">
                            {t('FBO Email')}:
                          </Text>
                          <Text fontSize="xs">{airport.fboEmail}</Text>
                        </HStack>
                      )}
                      {airport.fboPhone && (
                        <HStack>
                          <Text fontSize="xs" fontWeight="medium">
                            {t('FBO Phone')}:
                          </Text>
                          <Text fontSize="xs">{airport.fboPhone}</Text>
                        </HStack>
                      )}
                    </VStack>
                  )}
                  {order.deliveryDate && (
                    <VStack align="stretch" spacing={1} mb={2}>
                      <HStack>
                        <Text fontSize="xs" fontWeight="medium">
                          {t('Delivery Date')}:
                        </Text>
                        <Text fontSize="xs">{order.deliveryDate}</Text>
                      </HStack>
                      {order.deliveryTime && (
                        <HStack>
                          <Text fontSize="xs" fontWeight="medium">
                            {t('Delivery Time')}:
                          </Text>
                          <Text fontSize="xs">{order.deliveryTime}</Text>
                        </HStack>
                      )}
                    </VStack>
                  )}
                  {caterer && (
                    <VStack align="stretch" spacing={1}>
                      <HStack>
                        <Text fontSize="xs" fontWeight="medium">
                          {t('Caterer')}:
                        </Text>
                        <Text fontSize="xs">{caterer.fullName || caterer.name || '-'}</Text>
                      </HStack>
                      {caterer.email && (
                        <HStack>
                          <Text fontSize="xs" fontWeight="medium">
                            {t('Email')}:
                          </Text>
                          <Text fontSize="xs">{caterer.email}</Text>
                        </HStack>
                      )}
                      {caterer.phoneNumber && (
                        <HStack>
                          <Text fontSize="xs" fontWeight="medium">
                            {t('Phone')}:
                          </Text>
                          <Text fontSize="xs">{caterer.phoneNumber}</Text>
                        </HStack>
                      )}
                    </VStack>
                  )}
                </Box>
                <Divider />
              </>
            )}

            {/* Order Items */}
            {orderItems.length > 0 && (
              <>
                <Box>
                  <Text fontWeight="semibold" fontSize="sm" mb={2} color="green.600">
                    {t('Order Items')} ({orderItems.length}) - {t('Total Qty')}: {order.totalQuantity || orderItems.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)}
                  </Text>
                  <VStack align="stretch" spacing={2}>
                    {orderItems.map((item: any, idx: number) => (
                      <Box key={idx} p={2} bg="gray.50" borderRadius="md">
                        <HStack justify="space-between" mb={1}>
                          <Text fontSize="xs" fontWeight="medium">
                            {item.quantity}x {item.name}
                          </Text>
                          <Text fontSize="xs" fontWeight="bold">
                            {convertToCurrencyFormat(item.total || item.grandPrice || item.totalPrice || 0)}
                          </Text>
                        </HStack>
                        {item.description && (
                          <Text fontSize="2xs" color="gray.600" mt={1}>
                            {item.description}
                          </Text>
                        )}
                        {item.variants && Array.isArray(item.variants) && item.variants.length > 0 && (
                          <Text fontSize="2xs" color="gray.500" mt={1}>
                            {t('Variants')}:{' '}
                            {item.variants
                              .map((v: any) => {
                                const options = v.option || (Array.isArray(v) ? v : []);
                                return v.name + (options.length > 0 ? ` (${options.map((o: any) => o.name || o).join(', ')})` : '');
                              })
                              .join(', ')}
                          </Text>
                        )}
                        {item.addons && Array.isArray(item.addons) && item.addons.length > 0 && (
                          <Text fontSize="2xs" color="gray.500" mt={1}>
                            {t('Addons')}: {item.addons.map((a: any) => `${a.quantity || 1}x ${a.name || a}`).join(', ')}
                          </Text>
                        )}
                      </Box>
                    ))}
                  </VStack>
                </Box>
                <Divider />
              </>
            )}

            {/* Order Charges */}
            {order.orderCharges && order.orderCharges.length > 0 && (
              <>
                <Box>
                  <Text fontWeight="semibold" fontSize="sm" mb={2} color="blue.600">
                    {t('Additional Charges')}
                  </Text>
                  <VStack align="stretch" spacing={1}>
                    {order.orderCharges.map((charge: any, idx: number) => (
                      <HStack key={idx} justify="space-between">
                        <Text fontSize="xs">{charge.name || t('Charge')}</Text>
                        <Text fontSize="xs" fontWeight="medium">
                          {convertToCurrencyFormat(charge.amount || 0)}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
                <Divider />
              </>
            )}

            {/* Notes and Special Instructions */}
            {(order.customerNote ||
              order.packagingNote ||
              order.dietaryRes ||
              order.note ||
              order.tailNumber ||
              order.priority ||
              order.reheatMethod) && (
              <>
                <Box>
                  <Text fontWeight="semibold" fontSize="sm" mb={2} color="orange.600">
                    {t('Notes & Special Instructions')}
                  </Text>
                  <VStack align="stretch" spacing={2}>
                    {order.customerNote && (
                      <Box>
                        <Text fontSize="xs" fontWeight="medium" mb={0.5}>
                          {t('Customer Note')}:
                        </Text>
                        <Text fontSize="xs" color="gray.700" pl={2}>
                          {order.customerNote}
                        </Text>
                      </Box>
                    )}
                    {order.note && (
                      <Box>
                        <Text fontSize="xs" fontWeight="medium" mb={0.5}>
                          {t('Client Note')}:
                        </Text>
                        <Text fontSize="xs" color="gray.700" pl={2}>
                          {order.note}
                        </Text>
                      </Box>
                    )}
                    {order.packagingNote && (
                      <Box>
                        <Text fontSize="xs" fontWeight="medium" mb={0.5}>
                          {t('Packaging Note')}:
                        </Text>
                        <Text fontSize="xs" color="gray.700" pl={2}>
                          {order.packagingNote}
                        </Text>
                      </Box>
                    )}
                    {order.dietaryRes && (
                      <Box bg="red.50" p={2} borderRadius="md" borderLeft="3px solid" borderColor="red.400">
                        <Text fontSize="xs" fontWeight="bold" color="red.700" mb={0.5}>
                          {t('Dietary Restrictions')}:
                        </Text>
                        <Text fontSize="xs" color="red.600" pl={2}>
                          {order.dietaryRes}
                        </Text>
                      </Box>
                    )}
                    {order.tailNumber && (
                      <Box>
                        <Text fontSize="xs" fontWeight="medium" mb={0.5}>
                          {t('Aircraft Tail Number')}:
                        </Text>
                        <Text fontSize="xs" color="gray.700" pl={2}>
                          {order.tailNumber}
                        </Text>
                      </Box>
                    )}
                    {order.priority && (
                      <Box>
                        <Text fontSize="xs" fontWeight="medium" mb={0.5}>
                          {t('Priority')}:
                        </Text>
                        <Badge variant="subtle" colorScheme="orange" fontSize="xs">
                          {order.priority}
                        </Badge>
                      </Box>
                    )}
                    {order.reheatMethod && (
                      <Box>
                        <Text fontSize="xs" fontWeight="medium" mb={0.5}>
                          {t('Reheat Method')}:
                        </Text>
                        <Text fontSize="xs" color="gray.700" pl={2}>
                          {order.reheatMethod}
                        </Text>
                      </Box>
                    )}
                  </VStack>
                </Box>
                <Divider />
              </>
            )}

            {/* Payment Information */}
            <Box>
              <Text fontWeight="semibold" fontSize="sm" mb={2} color="purple.600">
                {t('Payment Information')}
              </Text>
              <VStack align="stretch" spacing={1}>
                <HStack justify="space-between">
                  <Text fontSize="xs" fontWeight="medium">
                    {t('Payment Method')}:
                  </Text>
                  <Badge
                    variant="subtle"
                    colorScheme={order.paymentType === 'ach' ? 'primary' : 'blue'}
                    fontSize="xs"
                  >
                    {t(order.paymentType)}
                  </Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="xs" fontWeight="medium">
                    {t('Payment Status')}:
                  </Text>
                  <Badge
                    variant="solid"
                    colorScheme={
                      order.paymentStatus === 'paid'
                        ? 'green'
                        : order.paymentStatus === 'payment_requested'
                          ? 'blue'
                          : 'red'
                    }
                    fontSize="xs"
                  >
                    {t(order.paymentStatus)}
                  </Badge>
                </HStack>
                {order.total > 0 && (
                  <HStack justify="space-between">
                    <Text fontSize="xs" fontWeight="medium">
                      {t('Subtotal')}:
                    </Text>
                    <Text fontSize="xs">{convertToCurrencyFormat(order.total || 0)}</Text>
                  </HStack>
                )}
                {order.totalTax > 0 && (
                  <HStack justify="space-between">
                    <Text fontSize="xs" fontWeight="medium">
                      {t('Tax')}:
                    </Text>
                    <Text fontSize="xs">{convertToCurrencyFormat(order.totalTax || 0)}</Text>
                  </HStack>
                )}
                {order.totalCharges > 0 && (
                  <HStack justify="space-between">
                    <Text fontSize="xs" fontWeight="medium">
                      {t('Charges')}:
                    </Text>
                    <Text fontSize="xs">{convertToCurrencyFormat(order.totalCharges || 0)}</Text>
                  </HStack>
                )}
                {order.deliveryCharge > 0 && (
                  <HStack justify="space-between">
                    <Text fontSize="xs" fontWeight="medium">
                      {t('Delivery Charge')}:
                    </Text>
                    <Text fontSize="xs">{convertToCurrencyFormat(order.deliveryCharge || 0)}</Text>
                  </HStack>
                )}
                {(order.discount > 0 || order.manualDiscount > 0) && (
                  <HStack justify="space-between">
                    <Text fontSize="xs" fontWeight="medium">
                      {t('Discount')}:
                    </Text>
                    <Text fontSize="xs" color="red.600">
                      -{convertToCurrencyFormat((order.discount || 0) + (order.manualDiscount || 0))}
                    </Text>
                  </HStack>
                )}
                <HStack justify="space-between" pt={1} borderTop="1px solid" borderColor="gray.200">
                  <Text fontSize="xs" fontWeight="bold">
                    {t('Grand Total')}:
                  </Text>
                  <Text fontSize="sm" fontWeight="bold" color="primary.600">
                    {convertToCurrencyFormat(order.grandTotal || 0)}
                  </Text>
                </HStack>
                {order.vendorCost > 0 && (
                  <HStack justify="space-between" pt={1}>
                    <Text fontSize="xs" fontWeight="medium">
                      {t('Vendor Cost')}:
                    </Text>
                    <Text fontSize="xs">{convertToCurrencyFormat(order.vendorCost || 0)}</Text>
                  </HStack>
                )}
              </VStack>
            </Box>

            {/* Created Date */}
            {order.createdAt && (
              <>
                <Divider />
                <Box>
                  <Text fontSize="xs" color="gray.500">
                    {t('Created')}:{' '}
                    {new Date(order.createdAt).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </Text>
                </Box>
              </>
            )}
          </VStack>
            </Box>
          </Box>
  ) : null;

  return (
    <>
      {childrenWithRef}
      {typeof document !== 'undefined' && createPortal(popoverContent, document.body)}
    </>
  );
}

