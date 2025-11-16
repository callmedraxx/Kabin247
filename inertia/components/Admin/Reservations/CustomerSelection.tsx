import axios from 'axios';
import NewCustomerSchema from '@/schemas/NewCustomerSchema';
import { Field, Formik } from 'formik';
import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  HStack,
  IconButton,
  Input,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Spinner,
  Text,
  useBoolean,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Add, Minus } from 'iconsax-react';
import { toast } from 'sonner';
import { useState } from 'react';
import useSWR from 'swr';
import fetcher from '@/lib/fetcher';
import useDebounce from '@/hooks/useDebounce';
import { match, P } from 'ts-pattern';

// Customer creation form fields
const CUSTOMER_FIELDS = [
  { name: 'fullName', type: 'text', placeholder: 'Client name' },
  { name: 'email', type: 'email', placeholder: 'Email address' },
  { name: 'phoneNumber', type: 'tel', placeholder: 'Contact number' },
  { name: 'address', type: 'text', placeholder: 'Airport' },
];

// Customer creatioin form

export default function CustomerSelection({
  onSelect,
  toggleCreationMode,
}: {
  onSelect: (data: any) => void;
  toggleCreationMode?: (status: boolean) => void;
}) {
  const { t } = useTranslation();
  const [selectedCustomer, setSelectedCustomer] = useState<{ fullName: string; id: number }>();
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useBoolean();

  const customerSearchedText = useDebounce(search, 300);

  // fetch existing customer data
  const { data: users, isLoading: isUserLoading } = useSWR(
    () => `/api/users?type=customer&search=${customerSearchedText}`,
    fetcher
  );

  // toggle creation mode
  const toggleCustomerCreationMode = () => {
    toggleCreationMode?.(!isCreatingCustomer);
    setIsCreatingCustomer((prev) => !prev);
  };

  // Render new custerom creation form
  if (isCreatingCustomer) {
    return (
      <Formik
        initialValues={{
          fullName: '',
          email: '',
          phoneNumber: '',
          address: '',
        }}
        validationSchema={NewCustomerSchema}
        onSubmit={async (values, actions) => {
          actions.setSubmitting(true);

          const customerData = {
            fullName: values.fullName,
            email: values.email,
            phoneNumber: values.phoneNumber,
            address: values.address,
            roleId: 6,
          };
          try {
            actions.setSubmitting(true);
            const { data } = await axios.post('/api/users', customerData);
            if (data?.success) {
              toast.success(t(data?.message) || t('Client created successfully'));
              onSelect?.(data.content);
              setSelectedCustomer(data.content);
              setIsCreatingCustomer(false);
              toggleCreationMode?.(false);
            }
          } catch (e) {
            // handle validation error
            if (e?.response?.data?.messages) {
              e.response.data.messages?.forEach((message: { field: string; message: string }) => {
                actions.setFieldError(message.field, t(message.message));
              });
            } else {
              // handle others errors
              toast.error(
                e.response.data.message ? t(e.response.data.message) : t('Something went wrong')
              );
            }
          } finally {
            actions.resetForm();
            actions.setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, submitForm }) => (
          <div className="flex flex-col gap-y-2">
            {CUSTOMER_FIELDS.map((fieldItem, index) => (
              // render form field
              <Field key={index} name={fieldItem.name}>
                {({ field, meta }: any) => (
                  <FormControl isInvalid={!!(meta.touched && meta.error)}>
                    <HStack className="space-x-0 gap-0">
                      <Input
                        type={fieldItem.type}
                        placeholder={fieldItem.placeholder}
                        borderRightRadius={field.name === 'fullName' ? '0' : 'md'}
                        {...field}
                      />
                      {field.name === 'fullName' && (
                        <IconButton
                          aria-label="closeCreationForm"
                          onClick={toggleCustomerCreationMode}
                          className="rounded-l-none border border-secondary-200"
                        >
                          <Minus />
                        </IconButton>
                      )}
                    </HStack>
                    <FormErrorMessage>{t(meta.error || '')}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
            ))}

            <Flex className="w-full justify-end">
              <Button
                colorScheme="purple"
                isLoading={isSubmitting}
                type="button"
                onClick={submitForm}
              >
                {t('Add customer')}
              </Button>
            </Flex>
          </div>
        )}
      </Formik>
    );
  }

  // Render popover menu for select existing customer
  return (
    <Popover matchWidth isOpen={open} onOpen={setOpen.on} onClose={setOpen.off}>
      <HStack className="gap-0">
        <PopoverTrigger>
          <Button
            variant="outline"
            className="font-normal w-full text-left justify-start rounded-r-none"
          >
            <Text color={!selectedCustomer ? 'secondary.500' : 'inherit'}>
              {selectedCustomer?.fullName || t('Client name')}
            </Text>
          </Button>
        </PopoverTrigger>

        <IconButton
          aria-label="addNewCustomer"
          onClick={toggleCustomerCreationMode}
          className="rounded-l-none border border-secondary-200"
        >
          <Add />
        </IconButton>
      </HStack>
      <PopoverContent className="w-full">
        <PopoverHeader className="border-black/[6%]">
          <Input
            type="search"
            placeholder={t('Search...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </PopoverHeader>

        <PopoverBody className="flex flex-col items-stretch p-1 max-h-[300px] overflow-y-auto overflow-x-hidden">
          {match({ isUserLoading, users })
            // render loading
            .with({ isUserLoading: true }, () => (
              <HStack className="px-4 py-2.5">
                <Spinner size="sm" color="secondary.500" />
                <Text className="text-secondary-500"> {t('Loading...')} </Text>
              </HStack>
            ))

            // render customer list
            .with({ users: P.not(P.nullish) }, ({ users }) =>
              users?.map((user: { id: number; fullName: string }) => (
                <Button
                  onClick={() => {
                    setSelectedCustomer(user);
                    onSelect?.(user);
                    setOpen.off();
                  }}
                  variant="ghost"
                  key={user.id}
                  className="text-left font-normal justify-start"
                >
                  {user.fullName}
                </Button>
              ))
            )
            // reender empty message
            .otherwise(() => (
              <Text className="text-secondary-500 px-4 py-2.5 text-sm">
                {' '}
                {t('Client not fount')}{' '}
              </Text>
            ))}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
