import { useField } from 'formik';
import {
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  FormErrorMessage,
  Switch,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  IconButton,
  Box,
  Spinner,
  InputLeftElement,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import {  Calendar, Clock, ArrowLeft2, ArrowRight2, SearchNormal1 } from 'iconsax-react';
import { useState } from 'react';

const ReservationFieldRenderer = ({
  item,
  setFieldValue,
  values,
  users,
  usersLoading,
  setSearchQuery,
}: {
  item: any;
  setFieldValue: (name: string, value: any) => void;
  values: any;
  users?: any[];
  usersLoading?: boolean;
  setSearchQuery?: (query: string) => void;
  newCustomer?: boolean;
  setNewCustomer?: (value: boolean) => void;
  isSubmitting?: boolean;
}) => {
  const { t } = useTranslation();
  const [field, meta] = useField(item.name);

  const [show, setShow] = useState<boolean>(false);

  return (
    <FormControl isInvalid={!!(meta.touched && meta.error)}>
      {item.type !== 'switch' && item.type !== 'popover' && (
        <FormLabel className="text-sm text-secondary-500">{t(item.label)}</FormLabel>
      )}
      {match(item.type)
        .with('text', 'email', 'number', () => (
          <Input {...field} type={item.type} placeholder={t(item.placeholder || '')} />
        ))
        .with('password', () => (
          <InputGroup size="md">
            <Input
              pr="4.5rem"
              {...field}
              type={show ? 'text' : 'password'}
              placeholder={t(item.placeholder || '')}
            />
            <InputRightElement width="4.5rem">
              <Button h="1.75rem" size="sm" onClick={() => setShow && setShow(!show)}>
                {show ? t('Hide') : t('Show')}
              </Button>
            </InputRightElement>
          </InputGroup>
        ))
        .with('switch', () => (
          <div className="flex items-center gap-3">
            <span className="w-24 text-secondary-400">{t(item.label)}</span>
            <Switch
              defaultChecked={!field.value}
              onChange={(e) => setFieldValue(item.name, !e.target.checked)}
              colorScheme="green"
              size="lg"
            />
          </div>
        ))
        .with('popover', () => (
          <Popover placement="bottom-start">
            {({ onClose }) => (
              <>
                <PopoverTrigger>
                  <Button
                    variant="outline"
                    roundedRight={0}
                    className="justify-start text-black font-normal w-full border-secondary-200"
                  >
                    {values.fullName || t('Select customer')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-4">
                  <Box className="pb-2 mb-2 border-b border-black/10">
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <SearchNormal1 size="18" className="text-neInk-50" />
                      </InputLeftElement>
                      <Input
                        type="search"
                        onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                        placeholder={t('Search customer')}
                      />
                    </InputGroup>
                  </Box>
                  {usersLoading ? (
                    <div className="flex justify-center items-center w-full h-32">
                      <Spinner />
                    </div>
                  ) : (
                    <Box className="max-h-72 space-y-1 overflow-y-scroll">
                      {users?.map((user: any) => (
                        <Button
                          w="full"
                          key={user.id}
                          onClick={() => {
                            setFieldValue('fullName', user.fullName);
                            setFieldValue('userId', user.id);
                            onClose();
                          }}
                          className="flex flex-col items-start h-14 bg-transparent hover:bg-secondary-100 transition-all duration-500"
                        >
                          <p className="font-semibold mb-1">{user.fullName}</p>
                          <p className="text-sm">{user.phoneNumber}</p>
                        </Button>
                      ))}
                    </Box>
                  )}
                </PopoverContent>
              </>
            )}
          </Popover>
        ))
        .with('date', () => (
          <Popover placement="bottom-start">
            {({ onClose }) => (
              <>
                <PopoverTrigger>
                  <Button
                    as={Button}
                    rightIcon={<Calendar size={20} />}
                    variant="outline"
                    className="text-left justify-between text-black font-normal w-full bg-transparent border-secondary-200"
                  >
                    {format(values.reservationDate, 'dd MMM yyyy') || t('Select date')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-4 max-w-72">
                  <div className="relative">
                    <DatePicker
                      selected={values.reservationDate}
                      minDate={new Date()}
                      onChange={(date: Date | null) => {
                        setFieldValue('reservationDate', date);
                        onClose();
                      }}
                      inline
                      renderCustomHeader={({
                        date,
                        decreaseMonth,
                        increaseMonth,
                        prevMonthButtonDisabled,
                        nextMonthButtonDisabled,
                      }) => (
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-base font-medium text-secondary-700">
                            {format(date, 'MMM yyyy')}
                          </span>

                          <div className="space-x-2">
                            <IconButton
                              aria-label={t('Previous month')}
                              icon={<ArrowLeft2 size={14} />}
                              size="sm"
                              onClick={decreaseMonth}
                              isDisabled={prevMonthButtonDisabled}
                              variant="outline"
                            />
                            <IconButton
                              aria-label={t('Next month')}
                              icon={<ArrowRight2 size={14} />}
                              size="sm"
                              onClick={increaseMonth}
                              isDisabled={nextMonthButtonDisabled}
                              variant="outline"
                            />
                          </div>
                        </div>
                      )}
                    />
                  </div>
                </PopoverContent>
              </>
            )}
          </Popover>
        ))
        .with('time', () => (
          <Popover placement="bottom-start">
            {({ onClose }) => (
              <>
                <PopoverTrigger>
                  <Button
                    rightIcon={<Clock size={20} />}
                    variant="outline"
                    className="text-left justify-between text-black font-normal w-full border-secondary-200"
                  >
                    {format(values[item.name], 'hh:mm a') || t('Select time')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-4 max-w-56">
                  <div className="relative max-h-64 overflow-y-scroll">
                    <DatePicker
                      selected={values[item.name]}
                      onChange={(date: Date | null) => {
                        setFieldValue(item.name, date);
                        onClose();
                      }}
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={15}
                      dateFormat="h:mm aa"
                      inline
                    />
                  </div>
                </PopoverContent>
              </>
            )}
          </Popover>
        ))
        .otherwise(() => null)}
      <FormErrorMessage>{t(meta.error || '')}</FormErrorMessage>
    </FormControl>
  );
};

export default ReservationFieldRenderer;
