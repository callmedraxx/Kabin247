import useDebounce from '@/hooks/useDebounce';
import useWindowSize from '@/hooks/useWindowSize';
import fetcher from '@/lib/fetcher';
import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import {
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  Flex,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Popover,
  PopoverAnchor,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Spinner,
  Text,
  Textarea,
  useBoolean,
  useDisclosure,
  FormControl,
  Icon,
  Portal,
  PopoverArrow,
  Select,
  Stack,
  SimpleGrid,
  Tooltip,
} from '@chakra-ui/react';
import axios from 'axios';
import { Add, ArrowRight, SearchNormal, Edit2, Location, Minus, CloseCircle } from 'iconsax-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import useSWR, { useSWRConfig } from 'swr';
import { match, P } from 'ts-pattern';
import { Formik } from 'formik';
import CustomerInsertForm from './CustomerInsertForm';
import CustomerUpdateForm from './CustomerUpdateForm';
import PaymentTypeRadioGroup from './PaymentTypeSelect';
import usePOS, { POSState } from '@/data/use_pos';
import { Charge, Customer, POSItem } from '@/types/pos_type';
import { POSItemModal } from './POSItemModal';
import POSItemsTable from './POSItemsTable';

type POSCheckoutFormProps = {
  searchMenuItems: (q: string) => Promise<SuggestedItem[]>;
};

type SuggestedItem = {
  id: number;
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  variants?: any[];
  addons?: any[];
};

export const POSCheckoutForm = ({ searchMenuItems }: POSCheckoutFormProps) => {
  const pos = usePOS();
  const { t } = useTranslation();
  const { mutate } = useSWRConfig();

  const [isCustomerInsertFormOpen, setIsCustomerInsertForm] = useState(false);
  const [isCustomerUpdateFormOpen, setIsCustomerUpdateForm] = useState(false);
  const [isCustomerPopoverOpen, setCustomerPopoverOpen] = useBoolean();
  const [customerSearchText, setCustomerSearchText] = useState('');

  const [airportSearch, setAirportSearch] = useState('');
  const [airportEditing, setAirportEditing] = useState(false);
  const [airportOptions, setAirportOptions] = useState<any[]>([]);
  const [selectedAirport, setSelectedAirport] = useState<any>(null);
  const [isAirportLoading, setIsAirportLoading] = useState(false);
  const airportBoxRef = useRef<HTMLDivElement>(null);
  const debouncedAirportSearch = useDebounce(airportSearch, 300);
  const [airportPage, setAirportPage] = useState(1);
  const [hasMoreAirports, setHasMoreAirports] = useState(true);
  const airportListRef = useRef<HTMLDivElement>(null);

  const [isAddingAirport, setIsAddingAirport] = useState(false);
  const [newAirport, setNewAirport] = useState({
    name: '',
    fboName: '',
    fboEmail: '',
    fboPhone: '',
    iataCode: '',
    icaoCode: '',
  });
  const [specialtyItemShoppingFee, setSpecialtyItemShoppingFee] = useState<number>(0);
  const [serviceCharge, setServiceCharge] = useState<number>(0);
  const [addAirportErrors, setAddAirportErrors] = useState<{ [key: string]: string }>({});
  const [isSubmittingAirport, setIsSubmittingAirport] = useState(false);


  useEffect(() => {
    const listEl = airportListRef.current;
    if (!listEl) return;

    const handleScroll = () => {
      if (
        listEl.scrollTop + listEl.clientHeight >= listEl.scrollHeight - 10 &&
        hasMoreAirports &&
        !isAirportLoading
      ) {
        setAirportPage((prev) => prev + 1);
      }
    };

    listEl.addEventListener('scroll', handleScroll);
    return () => listEl.removeEventListener('scroll', handleScroll);
  }, [hasMoreAirports, isAirportLoading]);


  const [catererSearch, setCatererSearch] = useState('');
  const [catererEditing, setCatererEditing] = useState(false);
  const [catererOptions, setCatererOptions] = useState<any[]>([]);
  const [selectedCaterer, setSelectedCaterer] = useState<any>(null);
  const [isCatererLoading, setIsCatererLoading] = useState(false);
  const catererBoxRef = useRef<HTMLDivElement>(null);
  const debouncedCatererSearch = useDebounce(catererSearch, 300);
  const [catererPage, setCatererPage] = useState(1);
  const [hasMoreCaterers, setHasMoreCaterers] = useState(true);
  const catererListRef = useRef<HTMLDivElement>(null);

  const [isAddingCaterer, setIsAddingCaterer] = useState(false);
  const [isCatererUpdateFormOpen, setIsCatererUpdateFormOpen] = useState(false);
  const [newCaterer, setNewCaterer] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    airportId: ''
  });
  const [addCatererErrors, setAddCatererErrors] = useState<{ [key: string]: string }>({});
  const [isSubmittingCaterer, setIsSubmittingCaterer] = useState(false);

  useEffect(() => {
    const listEl = catererListRef.current;
    if (!listEl) return;

    const handleScroll = () => {
      if (
        listEl.scrollTop + listEl.clientHeight >= listEl.scrollHeight - 10 &&
        hasMoreCaterers &&
        !isCatererLoading
      ) {
        setCatererPage((prev) => prev + 1);
      }
    };

    listEl.addEventListener('scroll', handleScroll);
    return () => listEl.removeEventListener('scroll', handleScroll);
  }, [hasMoreCaterers, isCatererLoading]);

  const [catererAirportSearch, setCatererAirportSearch] = useState('');
  const [catererAirportEditing, setCatererAirportEditing] = useState(false);
  const [catererAirportOptions, setCatererAirportOptions] = useState<any[]>([]);
  const [selectedCatererAirport, setSelectedCatererAirport] = useState<any>(null);
  const [isCatererAirportLoading, setIsCatererAirportLoading] = useState(false);
  const catererAirportBoxRef = useRef<HTMLDivElement>(null);
  const debouncedCatererAirportSearch = useDebounce(catererAirportSearch, 300);
  const [catererAirportPage, setCatererAirportPage] = useState(1);
  const [hasMoreCatererAirports, setHasMoreCatererAirports] = useState(true);
  const catererAirportListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const listEl = airportListRef.current;
    if (!listEl) return;

    const handleScroll = () => {
      if (
        listEl.scrollTop + listEl.clientHeight >= listEl.scrollHeight - 10 &&
        hasMoreCatererAirports &&
        !isCatererAirportLoading
      ) {
        setCatererAirportPage((prev) => prev + 1);
      }
    };

    listEl.addEventListener('scroll', handleScroll);
    return () => listEl.removeEventListener('scroll', handleScroll);
  }, [hasMoreCatererAirports, isCatererAirportLoading]);

  const [errors, setErrors] = useState<Map<string, string>>(new Map());
  const [isOrderProcessing, setIsOrderProcessing] = useState(false);

  const windowSize = useWindowSize();
  const customerSearchedText = useDebounce(customerSearchText, 300);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (pos.deliveryAirport) setSelectedAirport(pos.deliveryAirport);
  }, [pos.deliveryAirport]);

  useEffect(() => {
    if (pos.deliveryCaterer) setSelectedCaterer(pos.deliveryCaterer);
  }, [pos.deliveryCaterer]);

  const { data: users, isLoading: isUserLoading } = useSWR(
    () => `/api/users?type=customer&search=${customerSearchedText}`,
    fetcher
  );

  useEffect(() => {
    if (!airportEditing) return;

    const fetchAirports = async () => {
      setIsAirportLoading(true);
      try {
        const res = await axios.get(`/api/airports?q=${debouncedAirportSearch}&page=${airportPage}`);
        const newAirports = res.data?.results || [];

        setAirportOptions((prev) =>
          airportPage === 1 ? newAirports : [...prev, ...newAirports]
        );
        setHasMoreAirports(newAirports.length === 20); // or match your backend limit
      } catch {
        toast.error(t('Failed to load airports'));
      } finally {
        setIsAirportLoading(false);
      }
    };

    fetchAirports();
  }, [debouncedAirportSearch, airportPage, airportEditing]);


  const updateAirport = async (airport: any) => {
    setSelectedAirport(airport);
    setAirportSearch('');
    setAirportEditing(false);
    resetError('deliveryAirport');
  };

  const updateCatererAirport = async (catererAirport: any) => {
    setSelectedCatererAirport(catererAirport);
    setCatererAirportSearch('');
    setCatererAirportEditing(false);
  };

  useEffect(() => {
    if (!catererAirportEditing) return;

    const fetchCatererAirports = async () => {
      setIsCatererAirportLoading(true);
      try {
        const res = await axios.get(`/api/airports?q=${debouncedCatererAirportSearch}&page=${catererAirportPage}`);
        const newCatererAirports = res.data?.results || [];

        setCatererAirportOptions((prev) =>
          catererAirportPage === 1 ? newCatererAirports : [...prev, ...newCatererAirports]
        );
        setHasMoreCatererAirports(newCatererAirports.length === 20); // or match your backend limit
      } catch {
        toast.error(t('Failed to load airports'));
      } finally {
        setIsCatererAirportLoading(false);
      }
    };

    fetchCatererAirports();
  }, [debouncedCatererAirportSearch, catererAirportPage, catererAirportEditing]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (airportBoxRef.current && !airportBoxRef.current.contains(e.target as Node)) {
        setAirportOptions([]);
        setAirportEditing(false);
      };
      if (catererBoxRef.current && !catererBoxRef.current.contains(e.target as Node)) {
        setCatererOptions([]);
        setCatererEditing(false);
      };
      if (catererAirportBoxRef.current && !catererAirportBoxRef.current.contains(e.target as Node)) {
        setCatererAirportOptions([]);
        setCatererAirportEditing(false);
      };
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateCaterer = async (caterer: any) => {
    setSelectedCaterer(caterer);
    setCatererSearch('');
    setCatererEditing(false);
    resetError('caterer');
    pos.setDeliveryCaterer(caterer);
  };

  useEffect(() => {
    if (!catererEditing) return;

    const fetchCaterers = async () => {
      setIsCatererLoading(true);
      try {
        // Search by name, email, or airport code
        const searchTerm = debouncedCatererSearch.trim();
        let results = [];
        
        if (searchTerm.length >= 2) {
          // Check if search looks like airport code (2-4 letters/numbers, typically uppercase)
          const isAirportCode = /^[A-Z0-9]{2,4}$/i.test(searchTerm);
          
          if (isAirportCode) {
            // Search airports first by code
            const airportRes = await axios.get('/api/airports', {
              params: {
                q: searchTerm,
                page: 1,
                limit: 10,
              },
            });
            const airports = airportRes.data?.results || airportRes.data?.data || airportRes.data || [];
            
            if (airports.length > 0) {
              // Get all caterers and filter by airport
              const catererRes = await axios.get('/api/users', {
                params: {
                  type: 'delivery',
                  page: 1,
                  limit: 100, // Get more to filter
                },
              });
              const allCaterers = catererRes.data.data || [];
              
              // Filter caterers by matching airport IDs
              for (const airport of airports) {
                const airportCaterers = allCaterers.filter((c: any) => 
                  c.airport?.id === airport.id || 
                  c.address === airport.id ||
                  c.airport?.iataCode?.toUpperCase() === searchTerm.toUpperCase() ||
                  c.airport?.icaoCode?.toUpperCase() === searchTerm.toUpperCase()
                );
                results = [...results, ...airportCaterers];
              }
              
              // Remove duplicates
              results = results.filter((v: any, i: number, a: any[]) => 
                a.findIndex((t: any) => t.id === v.id) === i
              );
            }
          }
          
          // Also search by name/email (always do this, or if airport code search had no results)
          if (!isAirportCode || results.length === 0) {
            const nameRes = await axios.get('/api/users', {
              params: {
                type: 'delivery',
                search: searchTerm,
                page: catererPage,
                limit: 20,
              },
            });
            const nameResults = nameRes.data.data || [];
            
            // Merge results, avoiding duplicates
            nameResults.forEach((caterer: any) => {
              if (!results.find((r: any) => r.id === caterer.id)) {
                results.push(caterer);
              }
            });
          }
        }

        setCatererOptions((prev) =>
          catererPage === 1 ? results : [...prev, ...results]
        );
        setHasMoreCaterers(results.length === 20);
      } catch {
        toast.error(t('Failed to load caterers'));
      } finally {
        setIsCatererLoading(false);
      }
    };

    fetchCaterers();
  }, [debouncedCatererSearch, catererPage, catererEditing]);

  // reset errors
  const resetError = (key: string) => {
    errors.delete(key);
    setErrors(errors);
  };

  const resetPOSState = () => {
    // Reset POS state (items, charges, totals, notes, etc.)
    pos.resetPOS();
    
    // Reset customer selection
    setCustomerSearchText('');
    setIsCustomerInsertForm(false);
    setIsCustomerUpdateFormOpen(false);
    setCustomerPopoverOpen.off();
    
    // Reset airport selection
    setSelectedAirport(null);
    setAirportSearch('');
    setAirportEditing(false);
    setAirportOptions([]);
    setAirportPage(1);
    setHasMoreAirports(true);
    setIsAddingAirport(false);
    setNewAirport({
      name: '',
      fboName: '',
      fboEmail: '',
      fboPhone: '',
      iataCode: '',
      icaoCode: '',
    });
    
    // Reset fee fields
    setSpecialtyItemShoppingFee(0);
    setServiceCharge(0);
    setAddAirportErrors({});
    
    // Reset caterer selection
    setSelectedCaterer(null);
    setCatererEditing(false);
    setCatererSearch('');
    setCatererOptions([]);
    setCatererPage(1);
    setHasMoreCaterers(true);
    setIsAddingCaterer(false);
    setIsCatererUpdateFormOpen(false);
    setNewCaterer({
      name: '',
      email: '',
      phoneNumber: '',
      airportId: ''
    });
    setAddCatererErrors({});
    setSelectedCatererAirport(null);
    setCatererAirportSearch('');
    setCatererAirportEditing(false);
    setCatererAirportOptions([]);
    setCatererAirportPage(1);
    setHasMoreCatererAirports(true);
    
    // Reset errors
    setErrors(new Map());
    
    // Reset item modal
    setIsModalOpen(false);
    setEditingItem(null);
  };

  // Validate required fields
  const validateOrder = (state: POSState): { isValid: boolean; errors: Map<string, string> } => {
    const validationErrors = new Map<string, string>();

    if (!state?.customer?.id) {
      validationErrors.set('customer', t('Client is required'));
    }

    if (!selectedCaterer?.id) {
      validationErrors.set('caterer', t('Caterer / Delivery Person is required'));
    }

    if (!state?.paymentType || (state.paymentType !== 'card' && state.paymentType !== 'ach')) {
      validationErrors.set('paymentType', t('Payment method is required'));
    }

    // Check for valid items (with name, quantity > 0, price >= 0)
    const validItems = state.POSItems?.filter((item: POSItem) => {
      return item.name && 
             item.name.trim() !== '' && 
             item.quantity > 0 && 
             item.price >= 0;
    }) || [];

    if (validItems.length === 0) {
      validationErrors.set('items', t('At least one valid item is required'));
    }

    if (!state.deliveryDate || state.deliveryDate.trim() === '') {
      validationErrors.set('deliveryDate', t('Delivery date is required'));
    }

    if (!state.deliveryTime || state.deliveryTime.trim() === '') {
      validationErrors.set('deliveryTime', t('Delivery time is required'));
    }

    if (!selectedAirport?.id) {
      validationErrors.set('deliveryAirport', t('Delivery airport is required'));
    }

    return {
      isValid: validationErrors.size === 0,
      errors: validationErrors,
    };
  };

  // Memoize validation result to avoid recalculating on every render
  const validationResult = useMemo(() => validateOrder(pos), [
    pos.customer?.id,
    pos.paymentType,
    pos.POSItems?.length,
    pos.deliveryDate,
    pos.deliveryTime,
    selectedCaterer?.id,
    selectedAirport?.id,
    pos.POSItems,
  ]);
  const isFormValid = validationResult.isValid;

  // handle on place order logic
  const onPlaceOrder = async (state: POSState) => {
    setIsOrderProcessing(true);

    // Validate required fields
    const validation = validateOrder(state);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsOrderProcessing(false);
      // Show toast with first error
      const firstError = Array.from(validation.errors.values())[0];
      toast.error(firstError);
      return;
    }

    // Filter out invalid items (items without name or with zero quantity/price)
    const validItems = state.POSItems.filter((item: POSItem) => {
      return item.name && 
             item.name.trim() !== '' && 
             item.quantity > 0 && 
             item.price >= 0;
    });

    if (validItems.length === 0) {
      setErrors(new Map([['items', t('At least one valid item is required')]]));
      setIsOrderProcessing(false);
      toast.error(t('At least one valid item is required'));
      return;
    }

    // Format the data for submission
    const formattedData = {
      userId: state?.customer?.id,
      type: "delivery",
      paymentType: state?.paymentType,
      customerNote: state?.note || '',
      paymentStatus: 'payment_requested',
      note: state.note || '',
      packagingNote: state.packagingNote || '',
      reheatMethod: state.reheatMethod || '',
      tailNumber: state.tailNumber || '',
      deliveryDate: state.deliveryDate,
      deliveryTime: state.deliveryTime,
      dietaryRes: state.dietaryRes || '',
      priority: state.priority || '',
      deliveryAirportId: selectedAirport?.id,
      deliveryManId: selectedCaterer?.id,
      specialtyItemShoppingFee: specialtyItemShoppingFee || 0,
      serviceCharge: serviceCharge || 0,
      orderItems: validItems, // Only send valid items
    };

    try {
      const { data } = await axios.post('/api/orders', formattedData);

      if (data?.success) {
        toast.success(t(data?.message) || t('Customer created successfully'));
        resetPOSState();
        mutate((key: string) => key.startsWith('/api/orders'));
      }
    } catch (e) {
      toast.error(t(e.response.data.message) || t('Something went wrong'));
    } finally {
      setIsOrderProcessing(false);
    }
  };

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'red.100';
      case 'high':
        return 'orange.100';
      case 'vip':
        return 'purple.100';
      case 'scheduled':
        return 'blue.100';
      case 'normal':
        return 'gray.100';
      default:
        return 'white';
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<POSItem | null>(null);

  const handleSaveItem = (item: POSItem) => {
    if (editingItem) {
      pos.updateItemInPOS(item); // for editing
    } else {
      pos.addItemToPOS({ ...item, id: Date.now() }); // for new
    }
    setEditingItem(null); // null = new item
  };

  const content = (
    <>
      <div className="@[900px]:sticky top-0 right-0 w-full inset-y-0 flex flex-col @[900px]:min-w-[512px] h-[calc(100vh-65px)]  md:h-[calc(100vh-76px)] bg-white border-l border-black/10">
        <Flex
          flexDir="column"
          rowGap="2"
          flexGrow={1}
          flexShrink={1}
          minH={0}
          px={4}
          py={6}
          overflowY="auto"
          overflowX="hidden"
          style={{ 
            overscrollBehavior: 'contain', 
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth'
          }}
        >
          <div className='flex flex-col bg-[#f6f9fc] p-4 rounded-lg'>
            <Stack spacing={{ base: 3, md: 4 }}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={{ base: 2, md: 2 }}>
                {/* Customer information */}
                <div className='flex-1 flex-col mt-2'>
                  <Text fontSize="sm" color="black" mb={1} fontWeight="medium">
                    {t('Client Information')}
                  </Text>
                  {isCustomerInsertFormOpen ? (
                    <CustomerInsertForm
                      close={() => setIsCustomerInsertForm(false)}
                      onSubmit={(data) => {
                        if (data?.content) {
                          pos.setCustomer(data.content);
                          resetError('customer');
                        }
                        setIsCustomerInsertForm(false);
                      }}
                    />
                  ) : isCustomerUpdateFormOpen ? (
                    <CustomerUpdateForm
                      customer={pos.customer as Customer}
                      close={() => setIsCustomerUpdateForm(false)}
                      onSubmit={(data) => {
                        if (data?.content) {
                          pos.setCustomer(data.content);
                          resetError('customer');
                        }
                        setIsCustomerUpdateForm(false);
                      }}
                    />
                  ) : (
                    <Popover
                      matchWidth
                      isOpen={isCustomerPopoverOpen}
                      onOpen={setCustomerPopoverOpen.on}
                      onClose={setCustomerPopoverOpen.off}
                    >
                      <PopoverAnchor>
                        <HStack gap="0" border="1px solid #0002" borderRadius="6px" backgroundColor="white" w="full">
                          <Input
                            readOnly
                            roundedRight="0"
                            value={pos?.customer?.fullName || ''}
                            placeholder={t('Search or select client')}
                            onClick={setCustomerPopoverOpen.on}
                            onMouseUp={(e) => e.preventDefault()}
                            onMouseDown={(e) => e.preventDefault()}
                            border="none"
                          />
                          {pos?.customer?.id ? (
                            <>
                              <Tooltip label={t('Edit Client')} placement="top">
                                <IconButton
                                  aria-label="Edit Client"
                                  roundedLeft="0"
                                  roundedRight="0"
                                  border="1px"
                                  borderColor="secondary.200"
                                  onClick={() => setIsCustomerUpdateForm(true)}
                                  colorScheme="blue"
                                  variant="solid"
                                  bg="blue.500"
                                  _hover={{ bg: "blue.600" }}
                                >
                                  <Edit2 size={18} color="white" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip label={t('Clear Client')} placement="top">
                                <IconButton
                                  aria-label="Clear Client"
                                  roundedLeft="0"
                                  roundedRight="0"
                                  border="1px"
                                  borderColor="secondary.200"
                                  onClick={() => {
                                    pos.setCustomer(null);
                                    setCustomerPopoverOpen.off();
                                    resetError('customer');
                                  }}
                                  colorScheme="red"
                                  variant="solid"
                                  bg="red.500"
                                  _hover={{ bg: "red.600" }}
                                >
                                  <CloseCircle size={18} color="white" />
                                </IconButton>
                              </Tooltip>
                            </>
                          ) : null}
                          <Tooltip label={t('Create New Client')} placement="top">
                            <IconButton
                              aria-label="Add New Client"
                              roundedLeft="0"
                              border="1px"
                              borderColor="secondary.200"
                              onClick={() => setIsCustomerInsertForm(true)}
                              colorScheme="green"
                              variant="solid"
                              bg="green.500"
                              _hover={{ bg: "green.600" }}
                            >
                              <Add size={18} color="white" />
                            </IconButton>
                          </Tooltip>
                        </HStack>
                      </PopoverAnchor>

                      <PopoverContent className="w-full">
                        <PopoverHeader className="border-black/[6%]">
                          <InputGroup>
                            <InputLeftElement pointerEvents="none">
                              <SearchNormal size={18} className="text-secondary-500" />
                            </InputLeftElement>
                            <Input
                              type="search"
                              placeholder={t('Search...')}
                              value={customerSearchText}
                              onChange={(e) => setCustomerSearchText(e.target.value)}
                            />
                          </InputGroup>
                        </PopoverHeader>
                        <PopoverBody>
                          {match({ users, isUserLoading })
                            .with({ isUserLoading: true }, () => (
                              <HStack justifyContent="center" py="2.5">
                                <Spinner size="sm" />
                                <Text className="text-secondary-500"> {t('Loading...')} </Text>
                              </HStack>
                            ))
                            // render user list
                            .with({ users: P.not(P.nullish) }, ({ users }) => (
                              <Flex
                                aria-description="customerSelection"
                                flexDir="column"
                                alignItems="stretch"
                              >
                                {users.map((user: any) => (
                                  <Button
                                    variant="ghost"
                                    justifyContent="flex-start"
                                    size="sm"
                                    key={user.id}
                                    rounded="4px"
                                    onClick={() => {
                                      pos.setCustomer(user);
                                      setCustomerPopoverOpen.off();
                                      resetError('customer');
                                    }}
                                    textAlign="left"
                                    fontWeight={400}
                                    fontSize={15}
                                  >
                                    {user.fullName} ( {user.email} )
                                  </Button>
                                ))}
                              </Flex>
                            ))
                            // if user not found show empty message with create button
                            .otherwise(() => (
                              <Flex flexDir="column" gap={3} alignItems="stretch">
                                <Text color="secondary.500" textAlign="center" py={2}>
                                  {customerSearchText.trim() 
                                    ? t('No client found matching') + ` "${customerSearchText}"`
                                    : t('No clients found')}
                                </Text>
                                <Button
                                  size="sm"
                                  colorScheme="primary"
                                  className="bg-primary-400 hover:bg-primary-500"
                                  leftIcon={<Add size={16} />}
                                  onClick={() => {
                                    setIsCustomerInsertForm(true);
                                    setCustomerPopoverOpen.off();
                                  }}
                                >
                                  {t('Create New Client')}
                                </Button>
                              </Flex>
                            ))}
                        </PopoverBody>
                      </PopoverContent>
                    </Popover>
                  )}

                  {errors.get('customer') || validationResult.errors.get('customer') ? (
                    <Text className="text-sm text-red-500">{t((errors.get('customer') || validationResult.errors.get('customer')) as 'string')}</Text>
                  ) : null}
                </div>

                {/* Caterer Selection (Searchable like airport) */}
                <div className='flex-1 flex-col mt-2'>
                  <Text fontSize="sm" color="black" mb={1} fontWeight="medium">
                    {t('Caterer / Delivery Person')} {validationResult.errors.get('caterer') && <Text as="span" color="red.500">*</Text>}
                  </Text>
                  {isCatererUpdateFormOpen ? (
                    <Box p={3} border="1px solid" borderColor="gray.200" borderRadius="md" bg="white">
                      <Formik
                        initialValues={{
                          firstName: selectedCaterer?.firstName || selectedCaterer?.fullName?.split(' ')[0] || '',
                          lastName: selectedCaterer?.lastName || selectedCaterer?.fullName?.split(' ').slice(1).join(' ') || '',
                          email: selectedCaterer?.email || '',
                          phoneNumber: selectedCaterer?.phoneNumber || '',
                          airportId: selectedCaterer?.airport?.id || selectedCaterer?.address || '',
                        }}
                        onSubmit={async (values, actions) => {
                          actions.setSubmitting(true);
                          try {
                            const { data } = await axios.put(`/api/users/${selectedCaterer?.id}`, {
                              firstName: values.firstName,
                              lastName: values.lastName,
                              email: values.email,
                              phoneNumber: values.phoneNumber,
                              address: values.airportId,
                              roleId: 7,
                            });
                            if (data?.success) {
                              toast.success(t('Caterer updated successfully'));
                              updateCaterer(data.content);
                              setIsCatererUpdateFormOpen(false);
                            }
                          } catch (e: any) {
                            toast.error(t(e.response?.data?.message || 'Failed to update caterer'));
                          } finally {
                            actions.setSubmitting(false);
                          }
                        }}
                      >
                        {({ isSubmitting, setFieldValue, values }) => (
                          <form className="flex flex-col gap-2">
                            <Input
                              size="sm"
                              placeholder={t('First name')}
                              value={values.firstName}
                              onChange={(e) => setFieldValue('firstName', e.target.value)}
                            />
                            <Input
                              size="sm"
                              placeholder={t('Last name')}
                              value={values.lastName}
                              onChange={(e) => setFieldValue('lastName', e.target.value)}
                            />
                            <Input
                              size="sm"
                              type="email"
                              placeholder={t('Email')}
                              value={values.email}
                              onChange={(e) => setFieldValue('email', e.target.value)}
                            />
                            <Input
                              size="sm"
                              placeholder={t('Phone number')}
                              value={values.phoneNumber}
                              onChange={(e) => setFieldValue('phoneNumber', e.target.value)}
                            />
                            <HStack>
                              <Button
                                size="sm"
                                onClick={() => setIsCatererUpdateFormOpen(false)}
                                variant="outline"
                              >
                                {t('Cancel')}
                              </Button>
                              <Button
                                size="sm"
                                type="submit"
                                colorScheme="primary"
                                className="bg-primary-400 hover:bg-primary-500"
                                isLoading={isSubmitting}
                              >
                                {t('Update')}
                              </Button>
                            </HStack>
                          </form>
                        )}
                      </Formik>
                    </Box>
                  ) : (
                  <Box
                    ref={catererBoxRef}
                    className={`relative rounded-[6px] text-pink-800 cursor-pointer bg-white ${isAddingCaterer ? '' : 'border border-black-400 focus-within:border-pink-200'}`}
                  >
                    {!catererEditing && !isAddingCaterer && (
                      <Popover trigger="hover" placement="top-end" openDelay={100} closeDelay={100}>
                        <PopoverTrigger>
                          <Flex align="center" justify="space-between" className="w-full">
                            <Box
                              onClick={() => {
                                setCatererEditing(true);
                                setCatererSearch('');
                                setCatererPage(1);
                                setCatererOptions([]);
                                setHasMoreCaterers(true);
                              }}
                              className="text-md font-normal flex items-center h-[28px] w-full ml-4"
                            >
                              {selectedCaterer?.fullName || t('Search caterer or delivery person')}
                            </Box>
                            <HStack gap="0">
                              {selectedCaterer?.id ? (
                                <>
                                  <Tooltip label={t('Edit Caterer')} placement="top">
                                    <IconButton
                                      aria-label="Edit Caterer"
                                      icon={<Edit2 size={18} color="white" />}
                                      size="md"
                                      colorScheme="blue"
                                      variant="solid"
                                      bg="blue.500"
                                      _hover={{ bg: "blue.600" }}
                                      borderRadius="0"
                                      borderLeft="2px solid #ddd9"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsCatererUpdateFormOpen(true);
                                        setCatererEditing(false);
                                      }}
                                    />
                                  </Tooltip>
                                  <Tooltip label={t('Clear Caterer')} placement="top">
                                    <IconButton
                                      aria-label="Clear Caterer"
                                      icon={<CloseCircle size={18} color="white" />}
                                      size="md"
                                      colorScheme="red"
                                      variant="solid"
                                      bg="red.500"
                                      _hover={{ bg: "red.600" }}
                                      borderRadius="0"
                                      borderLeft="2px solid #ddd9"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedCaterer(null);
                                        pos.setDeliveryCaterer(null);
                                      }}
                                    />
                                  </Tooltip>
                                </>
                              ) : null}
                              <Tooltip label={t('Create New Caterer')} placement="top">
                                <IconButton
                                  aria-label="Add new caterer"
                                  icon={<Add size="24" color="white" />}
                                  size="md"
                                  colorScheme="green"
                                  variant="solid"
                                  bg="green.500"
                                  _hover={{ bg: "green.600" }}
                                  borderRadius="0 5px 5px 0"
                                  borderLeft="2px solid #ddd9"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsAddingCaterer(true);
                                    setCatererEditing(false);
                                  }}
                                />
                              </Tooltip>
                            </HStack>
                          </Flex>
                        </PopoverTrigger>

                        {selectedCaterer?.fullName && (
                          <Portal>
                            <PopoverContent w="sm" p={2}>
                              <PopoverArrow />
                              <PopoverBody fontSize="sm">
                                <Text><strong>{t('Name')}:</strong> {selectedCaterer?.fullName || '-'}</Text>
                                <Text><strong>{t('Email')}:</strong> {selectedCaterer?.email || '-'}</Text>
                                <Text><strong>{t('Phone')}:</strong> {selectedCaterer?.phoneNumber || '-'}</Text>
                                <Text><strong>{t('Airport Name')}:</strong> {selectedCaterer?.airport?.name || '-'}</Text>
                                <Text><strong>{t('Airport FBO Name')}:</strong> {selectedCaterer?.airport?.fboName || '-'}</Text>
                                <Text><strong>{t('Airport IATA Code')}:</strong> {selectedCaterer?.airport?.iataCode || '-'}</Text>
                                <Text><strong>{t('Airport ICAO Code')}:</strong> {selectedCaterer?.airport?.icaoCode || '-'}</Text>
                              </PopoverBody>
                            </PopoverContent>
                          </Portal>
                        )}
                      </Popover>
                    )}

                    {catererEditing && !isAddingCaterer && (
                      <>
                        <Flex align="center" gap={2} mt={0} position="relative" ml={4}>
                          {/* <Icon as={SearchNormal} className="text-pink-800 h-[18px] ml-4" /> */}
                          <Input
                            value={catererSearch}
                            placeholder={t('Type caterer name, email, or airport code (IATA/ICAO)')}
                            onChange={(e) => {
                              setCatererSearch(e.target.value);
                              setCatererPage(1);
                              setCatererOptions([]);
                              setHasMoreCaterers(true);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') e.preventDefault();
                            }}
                            className="flex-1 bg-white border-none text-md placeholder-pink-700 p-0 font-normal focus:outline-none focus:ring-0"
                          />
                          <Tooltip label={t('Create New Caterer')} placement="top">
                            <IconButton
                              aria-label={isAddingCaterer ? 'Cancel caterer form' : 'Add new caterer'}
                              icon={<Add size="24" color="white" />}
                              size="md"
                              colorScheme="green"
                              variant="solid"
                              bg="green.500"
                              _hover={{ bg: "green.600" }}
                              borderRadius="0 5px 5px 0"
                              borderLeft="2px solid #ddd9"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsAddingCaterer(!isAddingCaterer);
                                setCatererEditing(false);
                              }}
                            />
                          </Tooltip>
                        </Flex>

                        {catererOptions.length > 0 && catererBoxRef.current && (
                          <Box
                            ref={catererListRef}
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
                          >
                            {catererOptions.map((user) => (
                              <Box
                                key={user.id}
                                px={4}
                                py={2}
                                cursor="pointer"
                                _hover={{ bg: 'gray.100' }}
                                onClick={() => {
                                  setCatererOptions([]);
                                  updateCaterer(user);
                                  setCatererSearch('');
                                }}
                              >
                                {user?.fullName || '-'} / <span className="text-green-600">[{user?.airport?.iataCode || '-'} / {user?.airport?.icaoCode || '-'}]</span>
                              </Box>
                            ))}
                          </Box>
                        )}

                        {!isCatererLoading && debouncedCatererSearch.length >= 2 && catererOptions.length === 0 && (
                          <Box
                            mt={2}
                            p={2}
                            borderWidth="1px"
                            borderColor="gray.200"
                            className="bg-white rounded-[6px] text-center text-sm text-gray-500 absolute left-0 z-[50] w-full"
                          >
                            {t('No matching caterers found')}
                          </Box>
                        )}
                      </>
                    )}

                    {isAddingCaterer && (
                      <Box mt={2} p={0} borderRadius="md" bg="white" zIndex={1000} position="relative">
                        <FormControl isRequired isInvalid={!!addCatererErrors.name} mb={2} className="flex" border="1px solid #ddd8" borderRadius="6px">
                          <Input
                            value={newCaterer.name}
                            placeholder="Name *"
                            onChange={(e) => setNewCaterer({ ...newCaterer, name: e.target.value })}
                            border={"none"}
                          />
                          <IconButton
                            aria-label={'Cancel caterer form'}
                            icon={<Minus size="24" color="currentColor" />}
                            size="md"
                            colorScheme="gray"
                            borderRadius="0 5px 5px 0"
                            borderLeft="2px solid #ddd9"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsAddingCaterer(!isAddingCaterer);
                              setCatererEditing(false);
                            }}
                          />
                        </FormControl>

                        <FormControl mb={2}>
                          <Input
                            value={newCaterer.email}
                            placeholder="Email *"
                            onChange={(e) => setNewCaterer({ ...newCaterer, email: e.target.value })}
                          />
                        </FormControl>

                        <FormControl mb={2}>
                          <Input
                            value={newCaterer.phoneNumber}
                            placeholder="Phone Number"
                            onChange={(e) => setNewCaterer({ ...newCaterer, phoneNumber: e.target.value })}
                          />
                        </FormControl>

                        <FormControl mb={2}>
                          <FormControl isRequired>
                            <Box
                              ref={catererAirportBoxRef}
                              className={`relative rounded-[6px] text-purple-800 w-full cursor-pointer hover:bg-primary-50 border border-purple-300 focus-within:border-purple-200 border-primary-200`}
                            >
                              {!catererAirportEditing &&
                                <Flex align="center" justify="space-between" className="w-full">
                                  <Box
                                    onClick={() => {
                                      setCatererAirportEditing(true);
                                      setCatererAirportSearch('');
                                      setCatererAirportPage(1);
                                      setCatererAirportOptions([]);
                                      setHasMoreCatererAirports(true);
                                    }}
                                    className="text-md font-normal flex items-center h-[28px] w-full py-5"
                                  >
                                    <Icon as={Location} size="sm" className="mr-2 ml-4" />
                                    {selectedCatererAirport?.name || t('Click to select delivery airport')}
                                  </Box>
                                </Flex>
                              }
                              {catererAirportEditing && (
                                <>
                                  <Flex align="center" gap={2} mt={0} position="relative">
                                    <Icon as={SearchNormal} className="text-purple-800 h-[18px] ml-4" />
                                    <Input
                                      value={catererAirportSearch}
                                      onChange={(e) => {
                                        setCatererAirportSearch(e.target.value);
                                        setCatererAirportPage(1);
                                        setCatererAirportOptions([]);
                                        setHasMoreCatererAirports(true);
                                      }}
                                      placeholder={t('Search airport')}
                                      className="flex-1 bg-white border-none text-md placeholder-purple-700 p-0 font-normal focus:outline-none focus:ring-0"
                                    />
                                  </Flex>

                                  {catererAirportOptions.length > 0 && catererAirportBoxRef.current && (
                                    <Box
                                      ref={catererAirportListRef}
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
                                    >
                                      {catererAirportOptions.map((catererAirport) => (
                                        <Box
                                          key={catererAirport.id}
                                          px={4}
                                          py={2}
                                          cursor="pointer"
                                          _hover={{ bg: 'gray.100' }}
                                          onClick={() => {
                                            setNewCaterer({ ...newCaterer, airportId: catererAirport.id })
                                            updateCatererAirport(catererAirport)
                                          }
                                          }
                                        >
                                          {catererAirport.fboName}{' '}
                                          <Text fontSize="xs" color="green.600" as="span">
                                            [{catererAirport.iataCode} / {catererAirport.icaoCode}]
                                          </Text>
                                        </Box>
                                      ))}
                                    </Box>
                                  )}

                                  {!isCatererAirportLoading && debouncedCatererAirportSearch.length >= 2 && catererAirportOptions.length === 0 && (
                                    <Box
                                      mt={2}
                                      p={2}
                                      borderWidth="1px"
                                      borderColor="gray.200"
                                      className="bg-white rounded-[6px] text-center text-sm text-gray-500 absolute left-0 z-[50] w-full"
                                    >
                                      {t('No matching airports found')}
                                    </Box>
                                  )}
                                </>
                              )}
                            </Box>
                          </FormControl>
                        </FormControl>

                        <HStack mt={2} className="w-full">
                          <Button
                            size="md"
                            colorScheme="primary"
                            isLoading={isSubmittingCaterer}
                            className="bg-primary-400 hover:bg-primary-500 w-full"
                            onClick={async () => {
                              const errs: any = {};
                              if (!newCaterer.name.trim()) errs.name = 'Required';
                              setAddCatererErrors(errs);
                              if (Object.keys(errs).length > 0) return;

                              setIsSubmittingCaterer(true);
                              try {
                                const res = await axios.post('/api/users', {
                                  firstName: newCaterer.name,
                                  lastName: '',
                                  email: newCaterer.email,
                                  phoneNumber: newCaterer.phoneNumber,
                                  address: newCaterer.airportId,
                                  roleId: 7,
                                  isEmailVerified: 1,
                                  isSuspended: 0,
                                  notificationSound: 1,
                                });

                                const created = res.data;
                                toast.success(t('Caterer created successfully'));
                                updateCaterer(created);
                              } catch {
                                toast.error(t('Failed to create caterer'));
                              } finally {
                                setIsSubmittingCaterer(false);
                                setIsAddingCaterer(false);
                                setNewCaterer({ name: '', email: '', phoneNumber: '', airportId: '' });
                                setAddCatererErrors({});
                              }
                            }}
                          >
                            {t('Create new Caterer')}
                          </Button>
                        </HStack>
                      </Box>
                    )}
                  </Box>
                  )}
                </div>

                {/* Priority selection */}
                <div className='flex-1 mt-2'>
                  <Text fontSize="sm" color="black" mb={1} fontWeight="medium">
                    {t('Order Priority')}
                  </Text>
                  <Select
                    placeholder={t('Set order priority level')}
                    value={pos.priority}
                    onChange={(e) => pos.setPriority(e.target.value)}
                    bg={getPriorityBg(pos.priority)}
                    className="flex focus:border-primary-500 focus:outline-none focus:shadow-none mb-2"
                  >
                    <option value="normal">✅ {t('Normal')}</option>
                    <option value="high">⚠️ {t('High')}</option>
                    <option value="urgent">🔥 {t('Urgent')}</option>
                    <option value="scheduled">⏰ {t('Scheduled')}</option>
                    <option value="vip">👑 {t('VIP')}</option>
                  </Select>
                </div>
              </SimpleGrid>
            </Stack>
            <Divider mt={4} mb={2} />
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={{ base: 2, md: 2 }}>
              {/* Delivery Airport Dropdown */}
              <div className='flex-col flex-1 mt-2'>
                <Text fontSize="sm" color="" mb={1} fontWeight="medium">
                  {t('Delivery Airport')} {validationResult.errors.get('deliveryAirport') && <Text as="span" color="red.500">*</Text>}
                </Text>
                <Box
                  ref={airportBoxRef}
                  className={`relative rounded-[6px] text-purple-800 w-full cursor-pointer bg-white ${isAddingAirport ? '' : 'border border-black-300 focus-within:border-black-200'
                    }`}
                >
                  {!isAddingAirport && !airportEditing &&
                    <Popover placement="top-end" trigger="hover" openDelay={100} closeDelay={100}>
                      <Flex align="center" justify="space-between" className="w-full">
                        <PopoverTrigger>
                          <Box
                            onClick={() => {
                              if (!isAddingAirport) {
                                setAirportEditing(true);
                                setAirportSearch('');
                                setAirportPage(1);
                                setAirportOptions([]);
                                setHasMoreAirports(true);
                              }
                            }}
                            className="text-md font-normal flex items-center h-[28px] w-full ml-4"
                          >
                            {selectedAirport
                              ? `${selectedAirport.iataCode || selectedAirport.icaoCode || ''}${selectedAirport.iataCode && selectedAirport.icaoCode && selectedAirport.iataCode !== selectedAirport.icaoCode ? ` / ${selectedAirport.icaoCode}` : ''} - ${selectedAirport.fboName || selectedAirport.name}`
                              : t('Search delivery airport (IATA/ICAO code)')}
                          </Box>
                        </PopoverTrigger>

                        <IconButton
                          aria-label={isAddingAirport ? 'Cancel airport form' : 'Add new airport'}
                          icon={<Add size="24" color="currentColor" />}
                          size="md"
                          colorScheme="gray"
                          borderRadius='0 5px 5px 0'
                          borderLeft="2px solid #ddd9"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsAddingAirport(!isAddingAirport);
                            setAirportEditing(false);
                          }}
                        />
                      </Flex>
                      {(selectedAirport) && (
                        <Portal>
                          <PopoverContent w="sm" p={2}>
                            <PopoverArrow />
                            <PopoverBody fontSize="sm">
                              <Text><strong>{t('Name')}:</strong> {selectedAirport?.name}</Text>
                              <Text><strong>{t('Email')}:</strong> {selectedAirport?.fboEmail}</Text>
                              <Text><strong>{t('Phone')}:</strong> {selectedAirport?.fboPhone}</Text>
                              <Text><strong>{t('IATA Code')}:</strong> {selectedAirport?.iataCode}</Text>
                              <Text><strong>{t('ICAO Code')}:</strong> {selectedAirport?.icaoCode}</Text>
                            </PopoverBody>
                          </PopoverContent>
                        </Portal>
                      )}
                    </Popover>
                  }
                  {airportEditing && !isAddingAirport && (
                    <>
                      <Flex align="center" gap={2} mt={0} position="relative" ml={4}>
                        {/* <Icon as={SearchNormal} className="text-purple-800 h-[18px] ml-4" /> */}
                        <Input
                          value={airportSearch}
                          onChange={(e) => {
                            setAirportSearch(e.target.value);
                            setAirportPage(1);
                            setAirportOptions([]);
                            setHasMoreAirports(true);
                          }}
                          placeholder={t('Type IATA/ICAO code or airport name')}
                          className="flex-1 bg-white border-none text-md placeholder-purple-700 p-0 font-normal focus:outline-none focus:ring-0"
                        />
                        <IconButton
                          aria-label={isAddingAirport ? 'Cancel airport form' : 'Add new airport'}
                          icon={<Add size="24" color="currentColor" />}
                          size="md"
                          colorScheme="gray"
                          borderRadius='0 5px 5px 0'
                          borderLeft="2px solid #ddd9"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsAddingAirport(!isAddingAirport);
                            setAirportEditing(false);
                          }}
                        />
                      </Flex>

                      {airportOptions.length > 0 && airportBoxRef.current && (
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
                              <Text fontWeight="medium" as="span">
                                {airport.iataCode || airport.icaoCode || ''}
                                {(airport.iataCode || airport.icaoCode) && ' - '}
                              </Text>
                              {airport.fboName || airport.name}
                              {airport.iataCode && airport.icaoCode && airport.iataCode !== airport.icaoCode && (
                                <Text fontSize="xs" color="gray.500" as="span" ml={1}>
                                  ({airport.icaoCode})
                                </Text>
                              )}
                            </Box>
                          ))}
                        </Box>
                      )}

                      {!isAirportLoading && debouncedAirportSearch.length >= 2 && airportOptions.length === 0 && (
                        <Box
                          mt={2}
                          p={2}
                          borderWidth="1px"
                          borderColor="gray.200"
                          className="bg-white rounded-[6px] text-center text-sm text-gray-500 absolute left-0 z-[50] w-full"
                        >
                          {t('No matching airports found')}
                        </Box>
                      )}
                    </>
                  )}

                  {isAddingAirport && (
                    <Box
                      mt={0}
                      p={0}
                      borderRadius="md"
                      bg="white"
                      zIndex={1000}
                      position="relative"
                    >
                      <FormControl isRequired isInvalid={!!addAirportErrors.name} mb={2} border="1px solid #ddd" className="flex rounded-[6px]">
                        <Input
                          value={newAirport.name}
                          placeholder='Name *'
                          border="none"
                          onChange={(e) => setNewAirport({ ...newAirport, name: e.target.value })}
                        />
                        <IconButton
                          aria-label={isAddingAirport ? 'Cancel airport form' : 'Add new airport'}
                          icon={<Minus size="24" color="currentColor" />}
                          size="md"
                          colorScheme="gray"
                          borderRadius='0 5px 5px 0'
                          borderLeft="2px solid #ddd9"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsAddingAirport(!isAddingAirport);
                            setAirportEditing(false);
                          }}
                        />
                      </FormControl>

                      <FormControl isRequired isInvalid={!!addAirportErrors.fboName} mb={2}>
                        <Input
                          value={newAirport.fboName}
                          placeholder="FBO Name *"
                          onChange={(e) => setNewAirport({ ...newAirport, fboName: e.target.value })}
                        />
                      </FormControl>

                      <FormControl mb={2}>
                        <Input
                          value={newAirport.fboEmail}
                          placeholder="FBO Email"
                          onChange={(e) => setNewAirport({ ...newAirport, fboEmail: e.target.value })}
                        />
                      </FormControl>

                      <FormControl mb={2}>
                        <Input
                          value={newAirport.fboPhone}
                          placeholder="FBO Phone"
                          onChange={(e) => setNewAirport({ ...newAirport, fboPhone: e.target.value })}
                        />
                      </FormControl>

                      <FormControl mb={2}>
                        <Input
                          value={newAirport.iataCode}
                          placeholder="IATA Code"
                          onChange={(e) => setNewAirport({ ...newAirport, iataCode: e.target.value })}
                        />
                      </FormControl>

                      <FormControl mb={2}>
                        <Input
                          value={newAirport.icaoCode}
                          placeholder="ICAO Code"
                          onChange={(e) => setNewAirport({ ...newAirport, icaoCode: e.target.value })}
                        />
                      </FormControl>

                      <HStack mt={2} className="w-full">
                        <Button
                          size="md"
                          colorScheme="primary"
                          isLoading={isSubmittingAirport}
                          className="bg-primary-400 hover:bg-primary-500 w-full"
                          onClick={async () => {
                            const errs: typeof addAirportErrors = {};
                            if (!newAirport.name.trim()) errs.name = 'Required';
                            if (!newAirport.fboName.trim()) errs.fboName = 'Required';
                            setAddAirportErrors(errs);
                            if (Object.keys(errs).length > 0) return;

                            setIsSubmittingAirport(true);
                            try {
                              const res = await axios.post('/api/airports', {
                                name: newAirport.name,
                                fbo_name: newAirport.fboName,
                                fbo_email: newAirport.fboEmail,
                                fbo_phone: newAirport.fboPhone,
                                iata_code: newAirport.iataCode,
                                icao_code: newAirport.icaoCode,
                              });

                              const created = res.data;
                              toast.success(t('Airport created successfully'));
                              updateAirport(created);
                            } catch {
                              toast.error(t('Failed to create airport'));
                            } finally {
                              setIsSubmittingAirport(false);
                              setIsAddingAirport(false);
                              setNewAirport({
                                name: '',
                                fboName: '',
                                fboEmail: '',
                                fboPhone: '',
                                iataCode: '',
                                icaoCode: '',
                              });
                              setAddAirportErrors({});
                            }
                          }}
                        >
                          {t('Create new airport')}
                        </Button>
                      </HStack>
                    </Box>
                  )}
                </Box>
                {errors.get('deliveryAirport') || validationResult.errors.get('deliveryAirport') ? (
                  <Text className="text-sm text-red-500 mt-1">{t((errors.get('deliveryAirport') || validationResult.errors.get('deliveryAirport')) as 'string')}</Text>
                ) : null}
              </div>

              <div className='flex flex-1 mt-2 gap-2 items-start'>
                {/* Delivery date */}
                <div className='flex-1'>
                  <Text fontSize="sm" color="black" mb={1} fontWeight="medium">
                    {t('Delivery Date')} {validationResult.errors.get('deliveryDate') && <Text as="span" color="red.500">*</Text>}
                  </Text>
                  <Input
                    type="date"
                    value={pos.deliveryDate}
                    onChange={(e) => {
                      pos.setDeliveryDate(e.target.value);
                      resetError('deliveryDate');
                    }}
                    className="focus:border-primary-500 focus:outline-none focus:shadow-none mb-2 bg-white"
                  />
                  {errors.get('deliveryDate') || validationResult.errors.get('deliveryDate') ? (
                    <Text className="text-sm text-red-500">{t((errors.get('deliveryDate') || validationResult.errors.get('deliveryDate')) as 'string')}</Text>
                  ) : null}
                </div>

                {/* Delivery time */}
                <div className='flex-1'>
                  <Text fontSize="sm" color="black" mb={1} fontWeight="medium">
                    {t('Delivery Time')} (24h) {validationResult.errors.get('deliveryTime') && <Text as="span" color="red.500">*</Text>}
                  </Text>
                  <Input
                    type="time"
                    value={pos.deliveryTime}
                    onChange={(e) => {
                      pos.setDeliveryTime(e.target.value);
                      resetError('deliveryTime');
                    }}
                    className="focus:border-primary-500 focus:outline-none focus:shadow-none mb-2 bg-white"
                  />
                  {errors.get('deliveryTime') || validationResult.errors.get('deliveryTime') ? (
                    <Text className="text-sm text-red-500">{t((errors.get('deliveryTime') || validationResult.errors.get('deliveryTime')) as 'string')}</Text>
                  ) : null}
                </div>
              </div>

              <div className='flex flex-1 mt-2 gap-2 items-start'>
                {/* Tail Number */}
                <div className='flex-1'>
                  <Text fontSize="sm" color="black" mb={1} fontWeight="medium">
                    {t('Aircraft Tail Number')}
                  </Text>
                  <Input
                    placeholder={t('e.g., N123AB, G-ABCD')}
                    value={pos.tailNumber}
                    onChange={(e) => pos.setTailNumber(e.target.value.toUpperCase())}
                    className="focus:border-primary-500 focus:outline-none focus:shadow-none mb-2 bg-white"
                  />
                </div>

                {/* Reheat method selection */}
                <div className='flex-1'>
                  <Text fontSize="sm" color="black" mb={1} fontWeight="medium">
                    {t('Reheating Instructions')}
                  </Text>
                  <Select
                    placeholder={t('Select how food should be reheated')}
                    value={pos.reheatMethod}
                    onChange={(e) => pos.setReheatMethod(e.target.value)}
                    className="flex focus:border-primary-500 focus:outline-none focus:shadow-none mb-2 bg-white"
                  >
                    <option value="microwave_lid_open">📡 {t('Microwave (with lid slightly open)')}</option>
                    <option value="microwave_no_lid">📡 {t('Microwave (remove lid entirely)')}</option>
                    <option value="oven_180">🔥 {t('Oven (180°C / 350°F for 10 min)')}</option>
                    <option value="air_fryer">🍟 {t('Air Fryer (180°C / 350°F for 5 min)')}</option>
                    <option value="pan_fry">🍳 {t('Stovetop - Pan/Skillet')}</option>
                    <option value="boil_bag">🥣 {t('Boil-in-Bag (sealed pouch in boiling water)')}</option>
                    <option value="steam">💨 {t('Steam for 5–7 minutes')}</option>
                    <option value="grill">♨️ {t('Grill or Salamander (quick high-heat)')}</option>
                    <option value="sous_vide">🫧 {t('Sous Vide (if vacuum-sealed)')}</option>
                    <option value="cold_no_reheat">❄️ {t('No Reheating Required (served cold)')}</option>
                    <option value="not_suitable">🚫 {t('Not Suitable for Reheating')}</option>
                  </Select>
                </div>
              </div>
            </SimpleGrid>
            <Divider mt={4} mb={2} />
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={{ base: 2, md: 2 }}>
              {/* Client Note */}
              <div className='flex-1 mt-2'>
                <Text fontSize="sm" color="black" mb={1} fontWeight="medium">
                  {t('Client Note')}
                </Text>
                <Textarea
                  rows={3}
                  placeholder={t('Special instructions or requests from client')}
                  value={pos.note}
                  onChange={(e) => pos.setNote(e.target.value)}
                  className="focus:border-primary-500 focus:outline-none focus:shadow-none mb-2 bg-white"
                />
              </div>

              {/* Dietary Restrictions */}
              <div className='flex-1 mt-2'>
                <Text fontSize="sm" color="red.600" mb={1} fontWeight="medium">
                  {t('Dietary Restrictions')} ⚠️
                </Text>
                <Textarea
                  rows={3}
                  placeholder={t('Allergies, dietary restrictions, special requirements')}
                  value={pos.dietaryRes}
                  onChange={(e) => pos.setDietaryRes(e.target.value)}
                  className="border-red-300 focus:border-red-400 placeholder-red-900 focus:outline-none focus:shadow-none mb-2 bg-white"
                />
              </div>

              {/* Packaging note */}
              <div className='flex-1 mt-2'>
                <Text fontSize="sm" color="black" mb={1} fontWeight="medium">
                  {t('Packaging Instructions')}
                </Text>
                <Textarea
                  rows={3}
                  placeholder={t('Special packaging, presentation, or container requirements')}
                  value={pos.packagingNote}
                  onChange={(e) => pos.setPackagingNote(e.target.value)}
                  className="focus:border-primary-500 focus:outline-none focus:shadow-none bg-white"
                />
              </div>
            </SimpleGrid>
          </div>
          <Divider mt={4} mb={2} />

          {/* Unified menu items selection */}
          <div>
            <POSItemsTable
              items={pos.POSItems}
              onChange={pos.setPOSItems}
              searchItems={searchMenuItems}
            />
            {errors.get('items') || validationResult.errors.get('items') ? (
              <Text className="text-sm text-red-500 mt-2">{t((errors.get('items') || validationResult.errors.get('items')) as 'string')}</Text>
            ) : null}

            <POSItemModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              initialItem={editingItem}
              onSave={handleSaveItem}
            />
          </div>
          <Divider mt={4} mb={2} />
          {/* Calculations */}
          <Flex flexDir="column" className="text-lg font-normal">
            {/* Charges */}
            {pos.POSCharges.map((charge: Charge) => (
              <Box
                as="div"
                key={charge?.id}
                className="grid grid-cols-[1fr,100px] border-b py-1.5 border-black/5"
              >
                <Text>{charge.name}:</Text>
                <Text fontWeight={500} textAlign="right">
                  {convertToCurrencyFormat(charge.amount)}
                </Text>
              </Box>
            ))}

          </Flex>

          {/* Specialty Item Shopping Fee and Service Charge */}
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={2} mt={4} mb={2}>
            <FormControl>
              <Text fontSize="sm" color="black" mb={1} fontWeight="medium">
                {t('Specialty Item Shopping Fee')}
              </Text>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Text color="gray.500">$</Text>
                </InputLeftElement>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={specialtyItemShoppingFee || ''}
                  onChange={(e) => setSpecialtyItemShoppingFee(parseFloat(e.target.value) || 0)}
                  className="focus:border-primary-500 focus:outline-none focus:shadow-none bg-white"
                />
              </InputGroup>
            </FormControl>

            <FormControl>
              <Text fontSize="sm" color="black" mb={1} fontWeight="medium">
                {t('Service Charge')}
              </Text>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Text color="gray.500">$</Text>
                </InputLeftElement>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={serviceCharge || ''}
                  onChange={(e) => setServiceCharge(parseFloat(e.target.value) || 0)}
                  className="focus:border-primary-500 focus:outline-none focus:shadow-none bg-white"
                />
              </InputGroup>
            </FormControl>
          </SimpleGrid>

          <Box className="flex flex-col gap-3.5">
            {/* Total price ( Grand Total ) */}
            <Box
              as="div"
              className="grid grid-cols-[1fr,100px] text-lg font-normal border-b py-1 border-black/[6%]"
            >
              <Box> {t('Grand total')}: </Box>
              <Text fontWeight={700} textAlign="right">
                {convertToCurrencyFormat(pos.total)}
              </Text>
            </Box>

            {/* Payment type */}
            <Flex flexDir="column" gap="2">
              <label>
                {t('Payment type')} {validationResult.errors.get('paymentType') && <Text as="span" color="red.500">*</Text>}
              </label>
              <PaymentTypeRadioGroup
                defaultValue={pos.paymentType}
                onChange={(value) => {
                  pos.changePaymentType(value as 'card' | 'ach');
                  resetError('paymentType');
                }}
              />

              {errors.get('paymentType') || validationResult.errors.get('paymentType') ? (
                <Text className="text-sm text-red-500">
                  {t((errors.get('paymentType') || validationResult.errors.get('paymentType')) as 'string')}
                </Text>
              ) : null}
            </Flex>

            <Divider className="border-black/[6%] opacity-100" />

          </Box>
        </Flex>
        {/* Submit / Clear button */}
        <HStack spacing={1} gap="3" p={2}>
          <Button variant="outline" colorScheme="primary" w="full" onClick={() => resetPOSState()}>
            {t('Clear')}
          </Button>
          <Button
            type="button"
            variant="solid"
            colorScheme="green"
            w="full"
            isLoading={isOrderProcessing}
            disabled={isOrderProcessing || !isFormValid}
            rightIcon={<ArrowRight size={16} color="currentColor" />}
            onClick={() => onPlaceOrder(pos)}
            title={!isFormValid ? Array.from(validationResult.errors.values()).join(', ') : ''}
          >
            {t('Save')}
          </Button>
        </HStack>
      </div>
    </>
  );

  if (windowSize.width < 768) {
    return (
      <>
        <Button
          colorScheme="primary"
          className="absolute top-20 right-10 z-10 bg-primary-400 hover:bg-primary-500"
          onClick={onOpen}
        >
          <HStack>
            <Badge className="rounded-full" size="lg">
              {pos.POSItems.length}
            </Badge>
            <span> {t("Order checkout")} </span>
          </HStack>
        </Button>
        <Drawer isOpen={isOpen} onClose={onClose} size="md">
          <DrawerContent>
            <DrawerHeader className="border-b border-b-black/[6%]">
              {t("Order checkout")}
              <DrawerCloseButton />
            </DrawerHeader>

            <DrawerBody className="p-0">{content}</DrawerBody>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return content;
};

export default POSCheckoutForm;
