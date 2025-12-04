import axios from 'axios';
import {
  Box,
  HStack,
  Icon,
  Input,
  Spinner,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  Text,
  Portal,
} from '@chakra-ui/react';
import { Location, SearchNormal } from 'iconsax-react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef } from 'react';
import useDebounce from '@/hooks/useDebounce';
import { toast } from 'sonner';

export default function UpdateDeliveryAirport({
  status,
  orderId,
  airport,
  refresh,
}: {
  status: string;
  orderId: number;
  airport?: any;
  refresh?: () => void;
}) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(false);
  const [options, setOptions] = useState<any[]>([]);
  const [selectedAirport, setSelectedAirport] = useState<any>(airport || null);
  const [isLoading, setIsLoading] = useState(false);

  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (!editing || debouncedSearch.length < 2) {
      setOptions([]);
      return;
    }
    setIsLoading(true);
    axios
      .get(`/api/airports?q=${encodeURIComponent(debouncedSearch)}`)
      .then((res) => setOptions(res.data?.results || []))
      .catch(() => toast.error(t('Failed to load airports')))
      .finally(() => setIsLoading(false));
  }, [debouncedSearch, editing, t]);

  const updateAirport = async (airport: any) => {
    try {
      const res = await axios.patch(`/api/orders/${orderId}`, {
        deliveryAirportId: airport.id,
      });

      if (res.data?.content?.id) {
        toast.success(t('Delivery airport updated'));
        setSelectedAirport(airport);
        setSearch('');
        setEditing(false);
        setOptions([]);
        refresh?.();
      }
    } catch (err: any) {
      toast.error(t(err.response?.data?.message || 'Update failed'));
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOptions([]);
      setEditing(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setSelectedAirport(airport || null);
  }, [airport]);

  const getRect = () => {
    if (!triggerRef.current) return null;
    const rect = triggerRef.current.getBoundingClientRect();
    const scrollX = typeof window !== 'undefined' ? window.scrollX : 0;
    const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    return {
      left: rect.left + scrollX,
      top: rect.top + scrollY,
      bottom: rect.bottom + scrollY,
      width: rect.width,
    };
  };
  const rect = getRect();

  if (status !== 'quote_pending' && status !== 'quote_sent') {
    return (
      <Popover trigger="hover" placement="top-end" openDelay={100} closeDelay={100}>
        <PopoverTrigger>
          <div className="flex-1 font-normal text-left border py-2 px-3 rounded-[6px] border-secondary-200 bg-secondary-50 hover:bg-primary-50">
            <HStack>
              <Icon as={Location} boxSize="16px" />
              <span>{airport?.fboName}</span>
            </HStack>
          </div>
        </PopoverTrigger>

        {airport?.name && (
          <Portal>
            <PopoverContent w="sm" p={2}>
              <PopoverArrow />
              <PopoverBody fontSize="sm">
                <Text><strong>{t('Name')}:</strong> {airport?.name}</Text>
                <Text><strong>{t('Email')}:</strong> {airport?.fboEmail}</Text>
                <Text><strong>{t('Phone')}:</strong> {airport?.fboPhone}</Text>
                <Text><strong>{t('IATA Code')}:</strong> {airport?.iataCode}</Text>
                <Text><strong>{t('ICAO Code')}:</strong> {airport?.icaoCode}</Text>
              </PopoverBody>
            </PopoverContent>
          </Portal>
        )}
      </Popover>
    );
  }

  return (
    <Box
      ref={triggerRef}
      onClick={(e) => e.stopPropagation()}
      className="relative border rounded-[6px] px-4 py-1.5 border-purple-300 focus-within:border-purple-200 border-primary-200 text-purple-800 w-full cursor-pointer hover:bg-primary-50"
    >
      {!editing ? (
        <Popover placement="top-end" trigger="hover" openDelay={100} closeDelay={100}>
          <PopoverTrigger>
            <Box
              onClick={() => setEditing(true)}
              className="text-md font-normal flex items-center h-[28px]"
            >
              <Icon as={Location} boxSize="16px" className="mr-2" />
              {selectedAirport?.fboName || airport?.fboName || t('Click to select delivery airport')}
            </Box>
          </PopoverTrigger>
          {(selectedAirport || airport) && (
            <Portal>
              <PopoverContent w="sm" p={2}>
                <PopoverArrow />
                <PopoverBody fontSize="sm">
                  <Text><strong>{t('Name')}:</strong> {selectedAirport?.name || airport?.name}</Text>
                  <Text><strong>{t('FBO Name')}:</strong> {selectedAirport?.fboName || airport?.fboName}</Text>
                  <Text><strong>{t('Email')}:</strong> {selectedAirport?.fboEmail || airport?.fboEmail}</Text>
                  <Text><strong>{t('Phone')}:</strong> {selectedAirport?.fboPhone || airport?.fboPhone}</Text>
                  <Text><strong>{t('IATA Code')}:</strong> {selectedAirport?.iataCode || airport?.iataCode}</Text>
                  <Text><strong>{t('ICAO Code')}:</strong> {selectedAirport?.icaoCode || airport?.icaoCode}</Text>
                </PopoverBody>
              </PopoverContent>
            </Portal>
          )}
        </Popover>
      ) : (
        <>
          <div className="flex items-center h-[28px] relative">
            <Icon as={SearchNormal} className="text-purple-800 h-[18px] mr-2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('Search airport')}
              className="flex-1 bg-white border-none text-md placeholder-purple-700 p-0 font-normal focus:outline-none focus:ring-0"
              autoFocus
            />
            {isLoading && (
              <HStack mt={2} justifyContent="center">
                <Spinner size="sm" />
              </HStack>
            )}
          </div>

          {/* Floating dropdown: fixed-positioned under the trigger */}
          {editing && options.length > 0 && rect && (
            <Box
              ref={menuRef}
              position="fixed"
              left={`${rect.left}px`}
              top={`${rect.bottom + 8}px`}
              width={`${rect.width}px`}
              bg="white"
              zIndex={9999}
              boxShadow="md"
              borderRadius="md"
              maxH="240px"
              overflowY="auto"
            >
              {options.map((airport) => (
                <Box
                  key={airport.id}
                  px={4}
                  py={2}
                  cursor="pointer"
                  _hover={{ bg: 'gray.100' }}
                  onClick={() => updateAirport(airport)}
                >
                  {airport?.fboName || ''}{' '}
                  <Text fontSize="xs" color="green.600" as="span">
                    [{airport?.iataCode || ''} / {airport?.icaoCode || ''}]
                  </Text>
                </Box>
              ))}
            </Box>
          )}

          {/* Empty state, also fixed so it never gets clipped */}
          {!isLoading && debouncedSearch.length >= 2 && options.length === 0 && rect && (
            <Box
              ref={menuRef}
              position="fixed"
              left={`${rect.left}px`}
              top={`${rect.bottom + 8}px`}
              width={`${rect.width}px`}
              bg="white"
              zIndex={9999}
              boxShadow="md"
              borderRadius="md"
              p={2}
              textAlign="center"
              fontSize="sm"
              color="gray.600"
            >
              {t('No matching airports found')}
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
