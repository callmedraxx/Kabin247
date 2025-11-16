import axios from 'axios';
import {
  Box,
  HStack,
  Icon,
  Input,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  Text,
  Portal
} from '@chakra-ui/react';
import { toast } from 'sonner';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchNormal, Truck, User } from 'iconsax-react';
import useDebounce from '@/hooks/useDebounce';

export default function UpdateDeliveryPerson({
  status,
  deliveryPerson,
  orderId,
  refresh,
}: {
  status: string;
  orderId: number;
  deliveryPerson?: {
    id: number;
    fullName: string;
    email: string;
    phoneNumber: string;
    airport?: {
      id: number;
      name: string;
      fboName: string;
      fboEmail: string;
      iataCode: string;
      icaoCode: string;
    }
  };
  refresh?: () => void;
}) {
  const { t } = useTranslation();
  const [selectedPerson, setSelectedPerson] = useState(deliveryPerson || null);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(searchText, 300);

  useEffect(() => {
    if (!editing || !debouncedSearch || debouncedSearch.length < 2) {
      setOptions([]);
      return;
    }

    setIsLoading(true);
    axios
      .get(`/api/users?type=delivery&search=${debouncedSearch}`)
      .then((res) => {
        setOptions(res.data || []);
      })
      .catch(() => {
        toast.error(t('Failed to load delivery persons'));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [debouncedSearch, editing]);

  const updatePerson = async (user: any) => {
    try {
      const res = await axios.patch(`/api/orders/${orderId}`, {
        deliveryManId: user?.id,
      });

      if (res.data?.content?.id) {
        setSelectedPerson(user);
        toast.success(t('Delivery person updated successfully'));
        refresh?.();
        setEditing(false);
      }
    } catch (e) {
      toast.error(t(e?.response?.data?.message || 'Something went wrong'));
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOptions([]);
        setEditing(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setSelectedPerson(deliveryPerson || null);
  }, [deliveryPerson]);

  if (status !== 'quote_pending' && status !== "quote_sent") {
    return (
      <Popover trigger='hover' placement='top-end' openDelay={100} closeDelay={100}>
        <PopoverTrigger>
          <div className="flex-1 font-normal text-left border py-2 px-3 rounded-[6px] border-secondary-200 bg-secondary-50 hover:bg-primary-50">
            <HStack>
              <Icon as={status === 'client_confirmed' ? Truck : User} size="sm" />
              <span>{deliveryPerson?.fullName}</span>
            </HStack>
          </div>
        </PopoverTrigger>

        {deliveryPerson?.fullName && (
          <Portal>
            <PopoverContent w="sm" p={2}>
              <PopoverArrow />
              <PopoverBody fontSize="sm">
                <Text><strong>{t('Name')}:</strong> {selectedPerson?.fullName || '-'}</Text>
                <Text><strong>{t('Email')}:</strong> {selectedPerson?.email || '-'}</Text>
                <Text><strong>{t('Phone')}:</strong> {selectedPerson?.phoneNumber || '-'}</Text>
                <Text><strong>{t('Airport Name')}:</strong> {selectedPerson?.airport?.name || '-'}</Text>
                <Text><strong>{t('Airport FBO Name')}:</strong> {selectedPerson?.airport?.fboName || '-'}</Text>
                <Text><strong>{t('Airport IATA Code')}:</strong> {selectedPerson?.airport?.iataCode || '-'}</Text>
                <Text><strong>{t('Airport ICAO Code')}:</strong> {selectedPerson?.airport?.icaoCode || '-'}</Text>
              </PopoverBody>
            </PopoverContent>
          </Portal>
        )}
      </Popover>
    );
  }

  return (
    <Box
      ref={dropdownRef}
      className="relative border rounded-[6px] px-4 py-1.5 border-pink-300 focus-within:border-pink-200 border-pink-200 text-pink-800 w-full cursor-pointer hover:bg-primary-50"
    >

      {!editing ? (
        <Popover trigger="hover" placement="top-end" openDelay={100} closeDelay={100}>
          <PopoverTrigger>
            <Box
              onClick={() => setEditing(true)}
              className="text-md font-normal flex items-center h-[28px]"
            >
              <Icon as={User} size="sm" className='mr-2' />
              {selectedPerson?.fullName || t('Click to select caterer')}
            </Box>
          </PopoverTrigger>

          {selectedPerson?.fullName && (
            <Portal>
              <PopoverContent w="sm" p={2}>
                <PopoverArrow />
                <PopoverBody fontSize="sm">
                  <Text><strong>{t('Name')}:</strong> {selectedPerson?.fullName || '-'}</Text>
                  <Text><strong>{t('Email')}:</strong> {selectedPerson?.email || '-'}</Text>
                  <Text><strong>{t('Phone')}:</strong> {selectedPerson?.phoneNumber || '-'}</Text>
                  <Text><strong>{t('Airport Name')}:</strong> {selectedPerson?.airport?.name || '-'}</Text>
                  <Text><strong>{t('Airport FBO Name')}:</strong> {selectedPerson?.airport?.fboName || '-'}</Text>
                  <Text><strong>{t('Airport IATA Code')}:</strong> {selectedPerson?.airport?.iataCode || '-'}</Text>
                  <Text><strong>{t('Airport ICAO Code')}:</strong> {selectedPerson?.airport?.icaoCode || '-'}</Text>
                </PopoverBody>
              </PopoverContent>
            </Portal>
          )}
        </Popover>
      ) : (
        <>
          <div className="flex items-center h-[28px]">
            <Icon as={SearchNormal} className="text-pink-800 h-[18px] mr-2" />
            <Input
              ref={inputRef}
              value={searchText}
              placeholder={t('Search caterer')}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.preventDefault();
              }}
              className="flex-1 bg-white border-none text-md placeholder-pink-700 p-0 font-normal focus:outline-none focus:ring-0"
            />

            {isLoading && (
              <HStack mt={2} justifyContent="center">
                <Spinner size="sm" />
              </HStack>
            )}
          </div>

          {options.length > 0 && dropdownRef.current && (
            <Box
              position="fixed"
              top={dropdownRef.current.getBoundingClientRect().bottom + 8}
              left={dropdownRef.current.getBoundingClientRect().left}
              width={dropdownRef.current.offsetWidth}
              bg="white"
              zIndex={9999}
              boxShadow="md"
              borderRadius="md"
              maxH="240px"
              overflowY="auto"
            >
              {options.map((user) => (
                <Box
                  key={user.id}
                  px={4}
                  py={2}
                  cursor="pointer"
                  _hover={{ bg: 'gray.100' }}
                  onClick={() => {
                    setOptions([]);
                    updatePerson(user);
                    setSearchText('');
                  }}
                >
                  {user?.fullName || '-'} / <span className="text-green-600">[{user?.airport?.iataCode || '-'} / {user?.airport?.icaoCode || '-'}]</span>
                </Box>
              ))}
            </Box>
          )}

        </>
      )}
    </Box>
  );
}
