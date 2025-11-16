import axios from 'axios';
import { Form, Formik } from 'formik';
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormControl,
  FormLabel,
  Icon,
  Input,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { Add, Location, SearchNormal } from 'iconsax-react';
import { toast } from 'sonner';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import useDebounce from '@/hooks/useDebounce';

export default function NewDelivery({ refresh }: { refresh: () => void }) {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);

  const [selectedAirport, setSelectedAirport] = useState<any>(null);
  const [airportSearch, setAirportSearch] = useState('');
  const [debouncedAirportSearch] = useDebounce(airportSearch, 300);
  const [airportPage, setAirportPage] = useState(1);
  const [airportOptions, setAirportOptions] = useState<any[]>([]);
  const [isAirportLoading, setIsAirportLoading] = useState(false);
  const [hasMoreAirports, setHasMoreAirports] = useState(true);
  const [airportEditing, setAirportEditing] = useState(false);
  const airportBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAirportPage(1);
    setAirportOptions([]);
    setHasMoreAirports(true);
  }, [debouncedAirportSearch]);

  useEffect(() => {
    if (!airportEditing) return;
    const fetchAirports = async () => {
      setIsAirportLoading(true);
      try {
        const res = await axios.get(`/api/airports?q=${airportSearch || ""}&page=${airportPage}`);
        const newAirports = res.data?.results || [];
        setAirportOptions((prev) => airportPage === 1 ? newAirports : [...prev, ...newAirports]);
        setHasMoreAirports(newAirports.length === 20);
      } catch {
        toast.error(t('Failed to load airports'));
      } finally {
        setIsAirportLoading(false);
      }
    };
    fetchAirports();
  }, [debouncedAirportSearch, airportPage, airportEditing, airportSearch]);

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

  const updateAirport = (airport: any, setFieldValue: any) => {
    setSelectedAirport(airport);
    setFieldValue('address', airport.id);
    setAirportEditing(false);
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required(t('Name is required')),
    email: Yup.string().email(t('Invalid email')).required(t('Email is required')),
    phoneNumber: Yup.string().required(t('Phone is required')),
  });

  return (
    <>
      <Button
        variant="solid"
        colorScheme="primary"
        className="bg-primary-400 hover:bg-primary-500"
        rightIcon={<Add />}
        onClick={onOpen}
      >
        {t('Create new')}
      </Button>
      <Drawer isOpen={isOpen} placement="right" size="md" onClose={onClose} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader className="border-b border-black/5">
            {t('Create new caterer')}
          </DrawerHeader>

          <Formik
            initialValues={{
              name: '',
              email: '',
              phoneNumber: '',
              address: '',
              isSuspended: false,
              isEmailVerified: true,
              roleId: 7,
              notificationSound: 1,
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, actions) => {
              try {
                actions.setSubmitting(true);
                const payload = {
                  firstName: values.name,
                  lastName: '',
                  email: values.email,
                  phoneNumber: values.phoneNumber,
                  address: selectedAirport?.id,
                  isSuspended: values.isSuspended,
                  isEmailVerified: values.isEmailVerified,
                  roleId: 7,
                  notificationSound: 1,
                };
                const { data } = await axios.post('/api/users', payload);
                if (data?.success) {
                  onClose();
                  refresh();
                  toast.success(t('Caterer created successfully'));
                }
              } catch (e) {
                toast.error(t(e.response?.data?.message) || t('Something went wrong'));
              } finally {
                actions.setSubmitting(false);
              }
            }}
          >
            {({ values, errors, touched, isSubmitting, handleChange, setFieldValue }) => (
              <Form className='h-full'>
                <DrawerBody className="space-y-5 h-full">
                  <FormControl isRequired isInvalid={!!errors.name && touched.name}>
                    <FormLabel>{t('Caterer name')}</FormLabel>
                    <Input name="name" value={values.name} onChange={handleChange} />
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.email && touched.email}>
                    <FormLabel>{t('Email address')}</FormLabel>
                    <Input name="email" value={values.email} onChange={handleChange} />
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.phoneNumber && touched.phoneNumber}>
                    <FormLabel>{t('Contact number')}</FormLabel>
                    <Input name="phoneNumber" value={values.phoneNumber} onChange={handleChange} />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>{t('Delivery Airport')}</FormLabel>
                    <Box
                      ref={airportBoxRef}
                      className="relative rounded-[6px] text-purple-800 w-full cursor-pointer hover:bg-primary-50 border border-purple-300"
                    >
                      {!airportEditing ? (
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
                                <Icon as={Location} className="mr-2 ml-4" />
                                {selectedAirport?.name || t('Click to select airport')}
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
                      ) : (
                        <>
                          <Flex align="center" gap={2}>
                            <Icon as={SearchNormal} className="text-purple-800 h-[18px] ml-4" />
                            <Input
                              value={airportSearch}
                              onChange={(e) => setAirportSearch(e.target.value)}
                              placeholder={t('Search airport')}
                              className="flex-1 bg-white border-none text-md placeholder-purple-700 p-0 font-normal focus:outline-none focus:ring-0" />
                          </Flex>

                          {airportOptions.length > 0 && (
                            <Box
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
                                  onClick={() => updateAirport(airport, setFieldValue)}
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
                </DrawerBody><DrawerFooter
                  borderTopWidth="1px"
                  borderColor="secondary.200"
                  className="absolute bg-white w-full bottom-0"
                >
                  <Button variant="outline" w="full" mr={3} onClick={onClose}>
                    {t('Cancel')}
                  </Button>
                  <Button
                    variant="solid"
                    colorScheme="primary"
                    w="full"
                    type="submit"
                    isLoading={isSubmitting}
                    className="bg-primary-400 hover:bg-primary-500"
                    rightIcon={<Add />}
                  >
                    {t('Create')}
                  </Button>
                </DrawerFooter>
              </Form>
            )}
          </Formik>
        </DrawerContent>
      </Drawer >
    </>
  );
}
