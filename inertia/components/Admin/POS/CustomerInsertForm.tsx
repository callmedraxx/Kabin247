import axios from 'axios';
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  HStack,
  Icon,
  IconButton,
  Input,
  Spinner,
  Text,
  Textarea,
} from '@chakra-ui/react';
import { Field, Form, Formik } from 'formik';
import { Minus, Location, SearchNormal } from 'iconsax-react';
import { toast } from 'sonner';
import NewCustomerSchema from '@/schemas/NewCustomerSchema';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import useDebounce from '@/hooks/useDebounce';

export default function CustomerInsertForm({
  close,
  onSubmit,
}: {
  close: () => void;
  onSubmit?: (res: any) => void;
}) {
  const { t } = useTranslation();
  const boxRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingAirport, setEditingAirport] = useState(false);
  const [selectedAirportName, setSelectedAirportName] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (!editingAirport || debouncedSearch.length < 2) {
      setOptions([]);
      return;
    }

    setIsLoading(true);
    axios
      .get(`/api/airports?q=${debouncedSearch}`)
      .then((res) => {
        // Handle different response formats
        const airports = res.data?.results || res.data?.data || res.data || [];
        setOptions(Array.isArray(airports) ? airports : []);
      })
      .catch(() => toast.error(t('Failed to load airports')))
      .finally(() => setIsLoading(false));
  }, [debouncedSearch, editingAirport]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOptions([]);
        setEditingAirport(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Formik
      initialValues={{
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        address: '', // airportId
        clientAddress: '',
      }}
      validationSchema={NewCustomerSchema}
      onSubmit={async (values, actions) => {
        actions.setSubmitting(true);

        const { firstName, lastName, email, phoneNumber, address, clientAddress } = values;
        const formData = {
          firstName,
          lastName,
          email,
          phoneNumber,
          roleId: 6,
          address, // this is airportId
          clientAddress: clientAddress || undefined,
        };

        try {
          const { data } = await axios.post('/api/users', formData);
          if (data?.success) {
            onSubmit?.(data);
            toast.success(t(data?.message) || t('Client created successfully'));
          }
        } catch (e) {
          toast.error(t(e.response?.data?.message || 'Something went wrong'));
        } finally {
          actions.setSubmitting(false);
          actions.resetForm();
        }
      }}
      bg="white"
    >
      {({ isSubmitting, setFieldValue }) => (
        <Form className="flex flex-col gap-2">
          {[
            { name: 'firstName', type: 'text', placeholder: 'First name' },
            { name: 'lastName', type: 'text', placeholder: 'Last name' },
            { name: 'email', type: 'email', placeholder: 'Email address' },
            { name: 'phoneNumber', type: 'text', placeholder: 'Contact number' },
          ].map((item) => (
            <Field key={item.name} name={item.name}>
              {({ field, meta }: any) => (
                <FormControl isInvalid={meta.errors && meta.touched}>
                  <HStack gap="0">
                    <Input
                      {...field}
                      type={item.type}
                      placeholder={t(item.placeholder)}
                      roundedRight={item.name === 'firstName' ? 0 : 'auto'}
                    />
                    {item.name === 'firstName' && (
                      <IconButton
                        type="button"
                        aria-label="Minus"
                        roundedLeft="0"
                        border="1px"
                        borderColor="secondary.200"
                        onClick={() => close?.()}
                      >
                        <Minus />
                      </IconButton>
                    )}
                  </HStack>
                  <FormErrorMessage>{t(meta.errors)}</FormErrorMessage>
                </FormControl>
              )}
            </Field>
          ))}

          {/* Airport selection (address = airportId, but show airport.name) */}
          <FormControl>
            <Box
              ref={boxRef}
              onClick={(e) => e.stopPropagation()}
              className="relative border rounded-[6px] px-4 py-1.5 border-purple-300 focus-within:border-purple-200 border-primary-200 text-purple-800 w-full cursor-pointer hover:bg-primary-50"
            >
              {!editingAirport ? (
                <Box
                  onClick={() => setEditingAirport(true)}
                  className="text-md font-normal flex items-center h-[28px]"
                >
                  <Icon as={Location} size="sm" className="mr-2" />
                  {selectedAirportName || t('Click to select airport')}
                </Box>
              ) : (
                <>
                  <div className="flex items-center h-[28px] relative">
                    <Icon as={SearchNormal} className="text-purple-800 h-[18px] mr-2" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={t('Search airport')}
                      className="flex-1 bg-white border-none text-md placeholder-purple-700 p-0 font-normal focus:outline-none focus:ring-0"
                    />
                    {isLoading && (
                      <HStack mt={2} justifyContent="center">
                        <Spinner size="sm" />
                      </HStack>
                    )}
                  </div>

                  {options.length > 0 && (
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
                    >
                      {options.map((airport) => (
                        <Box
                          key={airport.id}
                          px={4}
                          py={2}
                          cursor="pointer"
                          _hover={{ bg: 'gray.100' }}
                          onClick={() => {
                            setFieldValue('address', airport.id);
                            setSelectedAirportName(airport.fboName || airport.name);
                            setSearch('');
                            setOptions([]);
                            setEditingAirport(false);
                          }}
                        >
                          {airport.fboName}{' '}
                          <Text fontSize="xs" color="green.600" as="span">
                            [{airport.iataCode} / {airport.icaoCode}]
                          </Text>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {!isLoading && debouncedSearch.length >= 2 && options.length === 0 && (
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

          {/* Full Address Details */}
          <FormControl>
            <Field name="clientAddress">
              {({ field, meta }: any) => (
                <FormControl isInvalid={meta.errors && meta.touched}>
                  <Textarea
                    {...field}
                    placeholder={t('Full address details (street, city, state, zip code, etc.)')}
                    rows={3}
                    resize="vertical"
                  />
                  <FormErrorMessage>{t(meta.errors)}</FormErrorMessage>
                </FormControl>
              )}
            </Field>
          </FormControl>

          <Button
            type="submit"
            colorScheme="primary"
            className="bg-primary-400 hover:bg-primary-500"
            isLoading={isSubmitting}
          >
            {t('Create new client')}
          </Button>
        </Form>
      )}
    </Formik>
  );
}
