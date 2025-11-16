import { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Icon,
  Input,
  Switch,
  IconButton,
  Flex,
  Text,
  Portal,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
} from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { toast } from 'sonner';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Edit2, Location, SearchNormal } from 'iconsax-react';
import useDebounce from '@/hooks/useDebounce';
import { BaseUserType } from '@/types/customer_type';

export default function EditDelivery({
  isIconButton,
  delivery,
  refresh,
}: {
  isIconButton?: boolean;
  delivery: BaseUserType;
  refresh: () => void;
}) {
  const { t } = useTranslation();
  const btnRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const [airportSearch, setAirportSearch] = useState('');
  const [debouncedAirportSearch] = useDebounce(airportSearch, 300);
  const [airportPage, setAirportPage] = useState(1);
  const [airportOptions, setAirportOptions] = useState<any[]>([]);
  const [hasMoreAirports, setHasMoreAirports] = useState(true);
  const [isAirportLoading, setIsAirportLoading] = useState(false);
  const [airportEditing, setAirportEditing] = useState(false);
  const [selectedAirport, setSelectedAirport] = useState(delivery.airport || null);
  const airportBoxRef = useRef<HTMLDivElement>(null);
  const airportListRef = useRef<HTMLDivElement>(null);

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);

  // Reset airport pagination when search changes
  useEffect(() => {
    setAirportPage(1);
    setAirportOptions([]);
    setHasMoreAirports(true);
  }, [debouncedAirportSearch]);

  // Fetch airport results
  useEffect(() => {
    if (!airportEditing) return;
    const fetchAirports = async () => {
      setIsAirportLoading(true);
      try {
        const res = await axios.get(`/api/airports?q=${airportSearch || ""}&page=${airportPage}`);
        const newAirports = res.data?.results || [];
        setAirportOptions((prev) =>
          airportPage === 1 ? newAirports : [...prev, ...newAirports]
        );
        setHasMoreAirports(newAirports.length === 20);
      } catch {
        toast.error(t('Failed to load airports'));
      } finally {
        setIsAirportLoading(false);
      }
    };
    fetchAirports();
  }, [debouncedAirportSearch, airportPage, airportEditing, airportSearch]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (airportBoxRef.current && !airportBoxRef.current.contains(e.target as Node)) {
        setAirportOptions([]);
        setAirportEditing(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateAirport = (airport: any) => {
    setSelectedAirport(airport);
    setAirportEditing(false);
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required(t('Name is required')),
    email: Yup.string().email(t('Invalid email')).required(t('Email is required')),
    phoneNumber: Yup.string().required(t('Phone is required')),
  });

  return (
    <>
      {isIconButton ? (
        <IconButton
          aria-label={t('Edit')}
          icon={<Edit2 size="18" color="currentColor" />}
          colorScheme="blue"
          className="hover:bg-blue-100 text-blue-600"
          variant="outline"
          onClick={openDrawer}
          ref={btnRef}
        />
      ) : (
        <Button
          aria-label="Edit"
          rightIcon={<Edit2 size="18" />}
          colorScheme="blue"
          width="full"
          className="hover:bg-blue-100 text-blue-600"
          variant="outline"
          onClick={openDrawer}
          ref={btnRef}
        >
          {t('Edit')}
        </Button>
      )}
      <Drawer isOpen={isOpen} placement="right" size="md" onClose={closeDrawer} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent className='h-full'>
          <DrawerHeader className="border-b border-black/5 h-full">
            {t('Edit caterer')}
          </DrawerHeader>

          <Formik
            initialValues={{
              name: delivery.firstName ?? '',
              email: delivery.email ?? '',
              phoneNumber: delivery.phoneNumber ?? '',
              isSuspended: delivery.isSuspended === 0 ? true : false,
              isEmailVerified: !!delivery.isEmailVerified,
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, actions) => {
              try {
                const payload = {
                  firstName: values.name,
                  lastName: '',
                  email: values.email,
                  phoneNumber: values.phoneNumber,
                  address: selectedAirport?.id,
                  isSuspended: values.isSuspended ? 0 : 1,
                  isEmailVerified: values.isEmailVerified,
                  roleId: 7,
                  notificationSound: 1,
                };
                const { data } = await axios.put(`/api/users/${delivery.id}`, payload);
                if (data?.success) {
                  closeDrawer();
                  refresh();
                  toast.success(t(data?.message || 'Caterer updated successfully'));
                }
              } catch (err: any) {
                toast.error(t(err?.response?.data?.message || 'Something went wrong'));
              } finally {
                actions.setSubmitting(false);
              }
            }}
          >
            {({ values, errors, touched, isSubmitting, handleChange, setFieldValue }) => (
              <Form className='h-full'>
                <DrawerBody className="space-y-4 h-full">
                  <FormControl isInvalid={!!errors.name && touched.name} isRequired>
                    <FormLabel>{t('Caterer name')}</FormLabel>
                    <Input name="name" value={values.name} onChange={handleChange} />
                    <FormErrorMessage>{errors.name}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.email && touched.email} isRequired>
                    <FormLabel>{t('Email address')}</FormLabel>
                    <Input name="email" value={values.email} onChange={handleChange} />
                    <FormErrorMessage>{errors.email}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.phoneNumber && touched.phoneNumber} isRequired>
                    <FormLabel>{t('Contact number')}</FormLabel>
                    <Input name="phoneNumber" value={values.phoneNumber} onChange={handleChange} />
                    <FormErrorMessage>{errors.phoneNumber}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired mt={4}>
                    <FormLabel>{t('Delivery Airport')}</FormLabel>
                    <Box
                      ref={airportBoxRef}
                      className="relative rounded-[6px] text-purple-800 w-full cursor-pointer hover:bg-primary-50 border border-purple-300 focus-within:border-purple-200 border-primary-200"
                    >
                      {!airportEditing &&
                        <Popover placement="top-end" trigger="hover" openDelay={100} closeDelay={100}>
                          <Flex align="center" justify="space-between" className="w-full">
                            <PopoverTrigger>
                              <Box
                                onClick={() => {
                                  setAirportEditing(true);
                                  setAirportSearch('');
                                }}
                                className="text-md font-normal flex items-center h-[28px] w-full py-5"
                              >
                                <Icon as={Location} size="sm" className="mr-2 ml-4" />
                                {selectedAirport?.name || t('Click to select delivery airport')}
                              </Box>
                            </PopoverTrigger>
                          </Flex>
                          {selectedAirport && (
                            <Portal>
                              <PopoverContent w="sm" p={2}>
                                <PopoverArrow />
                                <PopoverBody fontSize="sm">
                                  <Text><strong>{t('Name')}:</strong> {selectedAirport.name}</Text>
                                  <Text><strong>{t('FBO Name')}:</strong> {selectedAirport.fboName}</Text>
                                  <Text><strong>{t('Email')}:</strong> {selectedAirport.fboEmail}</Text>
                                  <Text><strong>{t('Phone')}:</strong> {selectedAirport.fboPhone}</Text>
                                  <Text><strong>{t('IATA Code')}:</strong> {selectedAirport.iataCode}</Text>
                                  <Text><strong>{t('ICAO Code')}:</strong> {selectedAirport.icaoCode}</Text>
                                </PopoverBody>
                              </PopoverContent>
                            </Portal>
                          )}
                        </Popover>
                      }

                      {airportEditing && (
                        <>
                          <Flex align="center" gap={2} mt={0} position="relative">
                            <Icon as={SearchNormal} className="text-purple-800 h-[18px] ml-4" />
                            <Input
                              value={airportSearch}
                              onChange={(e) => {
                                setAirportSearch(e.target.value);
                              }}
                              placeholder={t('Search airport')}
                              className="flex-1 bg-white border-none text-md placeholder-purple-700 p-0 font-normal focus:outline-none focus:ring-0"
                            />
                          </Flex>

                          {airportOptions.length > 0 && (
                            <Box
                              ref={airportListRef}
                              position="absolute"
                              top="100%"
                              mt="2"
                              left="0"
                              width="100%"
                              bg="white"
                              zIndex={9999}
                              boxShadow="md"
                              borderRadius="md"
                              maxH="240px"
                              overflowY="auto"
                              onScroll={(e: any) => {
                                const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
                                if (bottom && hasMoreAirports && !isAirportLoading) {
                                  setAirportPage((prev) => prev + 1);
                                }
                              }}
                            >
                              {airportOptions.map((airport) => (
                                <Box
                                  key={airport.id}
                                  px={4}
                                  py={2}
                                  cursor="pointer"
                                  _hover={{ bg: 'gray.100' }}
                                  onClick={() => updateAirport(airport)}
                                >
                                  {airport.fboName}{' '}
                                  <Text fontSize="xs" color="green.600" as="span">
                                    [{airport.iataCode} / {airport.icaoCode}]
                                  </Text>
                                </Box>
                              ))}
                            </Box>
                          )}
                        </>
                      )}
                    </Box>
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="isSuspended" mb="0">{t('Acc. Status')}</FormLabel>
                    <Switch
                      id="isSuspended"
                      isChecked={values.isSuspended}
                      onChange={(e) => setFieldValue('isSuspended', e.target.checked)}
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="isEmailVerified" mb="0">{t('Verify email')}</FormLabel>
                    <Switch
                      id="isEmailVerified"
                      isChecked={values.isEmailVerified}
                      onChange={(e) => setFieldValue('isEmailVerified', e.target.checked)}
                    />
                  </FormControl>
                </DrawerBody>
                <DrawerFooter
                  borderTopWidth="1px"
                  borderColor="secondary.200"
                  className="absolute bg-white w-full bottom-0"
                >
                  <Button variant="outline" w="full" mr={3} onClick={closeDrawer}>
                    {t('Cancel')}
                  </Button>
                  <Button
                    variant="solid"
                    colorScheme="primary"
                    w="full"
                    type="submit"
                    isLoading={isSubmitting}
                    className="bg-primary-400 hover:bg-primary-500"
                  >
                    {t('Save')}
                  </Button>
                </DrawerFooter>
              </Form>
            )}
          </Formik>
        </DrawerContent>
      </Drawer>
    </>
  );
}
