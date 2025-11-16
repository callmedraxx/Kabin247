import axios from 'axios';
import {
  Checkbox,
  Flex,
  HStack,
  Input,
  Switch,
  Text,
  InputGroup,
  InputLeftElement,
  Popover,
  PopoverTrigger,
  Button,
  PopoverContent,
  RadioGroup,
  Radio,
  FormControl,
  FormErrorMessage,
  Spinner,
  Box,
} from '@chakra-ui/react';
import { Alarm, ArrowDown2 } from 'iconsax-react';
import { startCase } from '@/utils/string_formatter';
import { currencies } from '@/utils/currencies';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Field, Form, Formik } from 'formik';
import BusinessPlatformSetupFormSchema from '@/schemas/BusinessPlatformSetupFormSchema';
import CurrencyItem from './CurrencyItem';

type FormData = {
  maintenanceMode: boolean;
  dineIn: number | string;
  delivery: number | string;
  pickup: number;
  deliveryCharge: number | string;
  currencyCode: string;
  currencySymbolPosition: string;
  guestCheckout: boolean;
  loginOnlyVerifiedEmail: boolean;
  sortCategories: string;
  notificationSound: boolean;
  logo: File | undefined;
  favicon: File | undefined;
  copyrightText: string;
};

interface BusinessInfo extends Omit<FormData, 'logo' | 'favicon'> {
  name: string;
  email: string;
  phone: string;
  address: string;
  timeZone: string;
  timeFormat: string;
  dineIn: number;
  delivery: number;
  pickup: number;
  logo?: { url: string } | null;
  favicon?: { url: string } | null;
}

export default function PlatformSetup({
  isLoading,
  businessInfo,
  refresh,
}: {
  isLoading?: boolean;
  businessInfo?: BusinessInfo;
  refresh?: () => void;
}) {
  const { t } = useTranslation();
  const [isOpenCurrencyPopover, setIsOpenCurrencyPopover] = useState(false);
  const [currencySearchText, setCurrencySearchText] = useState('');

  // Show loader when fetching data
  if (isLoading) {
    return (
      <Box className="p-6 py-30 rounded-md flex flex-col items-center space-y-4 max-w-[730px] bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.06),0px_1px_3px_0px_rgba(0,0,0,0.1)]">
        <Spinner />
      </Box>
    );
  }

  // Render form
  return (
    <Formik
      initialValues={{
        maintenanceMode: Boolean(businessInfo?.maintenanceMode) || false,
        dineIn: Boolean(businessInfo?.dineIn || 0),
        delivery: Boolean(businessInfo?.delivery || 0),
        pickup: Boolean(businessInfo?.pickup || 0),
        deliveryCharge: businessInfo?.deliveryCharge || 0,
        currencyCode: businessInfo?.currencyCode || 'bdt',
        currencySymbolPosition: businessInfo?.currencySymbolPosition || 'left',
        guestCheckout: Boolean(businessInfo?.guestCheckout) || false,
        loginOnlyVerifiedEmail: Boolean(businessInfo?.loginOnlyVerifiedEmail) || false,
        sortCategories: businessInfo?.sortCategories || 'priority_number',
        notificationSound: Boolean(businessInfo?.notificationSound) || true,
        logo: undefined,
        favicon: undefined,
      }}
      onSubmit={async (values: any, actions) => {
        try {
          actions.setSubmitting(true);
          const formattedData = new FormData();

          // Format data for multipart request
          for (const key in values) {
            if (Array.isArray(values[key])) {
              values[key].forEach((item) => formattedData.append(`${key}[]`, item ?? ''));
            } else {
              formattedData.append(key, values[key]);
            }
          }

          // Make Put request for updating
          const { data } = await axios.put('/api/business-setup/platform-setup', formattedData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          if (data?.success) {
            toast.success(data.message);
            refresh?.();
          }
        } catch (e) {
          toast.error(t(e.response.data.message) || t('Something went wrong'));
        } finally {
          actions.setSubmitting(false);
        }
      }}
      validationSchema={BusinessPlatformSetupFormSchema}
    >
      {({ isSubmitting }) => (
        <Form>
          <div className="platform-setup-container">
            <div className="platform-setup-grid">
              {/* Option config */}
              <div className="flex flex-col gap-4 p-6 bg-white rounded-md shadow-[0px_1px_2px_0px_rgba(0,0,0,0.06),0px_1px_3px_0px_rgba(0,0,0,0.1)]">
                {/* Order type */}
                <Flex flexDir="column" className="gap-2">
                  <label className="text-sm font-medium">{t('Accepted order types')}</label>

                  <HStack flexWrap="wrap">
                    {['dineIn', 'delivery', 'pickup'].map((type) => (
                      <Field key={type} name={type}>
                        {({ field, meta }: any) => (
                          <FormControl className="w-fit" isInvalid={!!(meta.touched && meta.error)}>
                            <Box
                              as="label"
                              className="flex items-center gap-2 py-2 border rounded-md px-4 cursor-pointer hover:bg-secondary-50"
                            >
                              <Text className="text-lg">{t(startCase(type))}</Text>
                              <Switch
                                size="lg"
                                isChecked={field.value}
                                colorScheme="green"
                                {...field}
                              />
                            </Box>
                            <FormErrorMessage>{t(meta.error || '')}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                    ))}
                  </HStack>
                </Flex>

                {/* Delivery charge */}
                <Flex className="gap-y-2 flex-col">
                  <label className="font-medium text-sm"> {t('Delivery charge')} </label>

                  <Field name="deliveryCharge">
                    {({ field, meta }: any) => (
                      <FormControl isInvalid={!!(meta.touched && meta.error)}>
                        <InputGroup size="lg">
                          <InputLeftElement className="text-secondary-500">$</InputLeftElement>
                          <Input size="lg" type="number" {...field} />
                        </InputGroup>

                        <FormErrorMessage>{t(meta.error || '')}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </Flex>

                {/* Select currency */}
                <Flex className="gap-y-2 flex-col">
                  <label className="text-sm font-medium text-secondary-800">
                    {t('Select currency')}
                  </label>

                  <Field name="currencyCode">
                    {({ field, meta, form }: any) => (
                      <FormControl isInvalid={!!(meta.touched && meta.error)}>
                        <Popover
                          matchWidth
                          isOpen={isOpenCurrencyPopover}
                          onOpen={() => setIsOpenCurrencyPopover(true)}
                          onClose={() => setIsOpenCurrencyPopover(false)}
                        >
                          <PopoverTrigger>
                            <Button
                              size="lg"
                              variant="outline"
                              className="w-full font-normal justify-start px-4"
                            >
                              {field.value ? (
                                <Text className="flex-1 text-left">
                                  {field.value?.toUpperCase()}
                                </Text>
                              ) : (
                                <Text className="text-secondary-500 flex-1 text-left">
                                  {t('Select')}
                                </Text>
                              )}
                              <ArrowDown2 size={18} />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-1 w-full">
                            <div className="p-2 border-b border-black/5 mb-1">
                              <Input
                                type="search"
                                placeholder={t('Search currency')}
                                className="text-sm"
                                value={currencySearchText}
                                onChange={(e) => setCurrencySearchText(e.target.value)}
                              />
                            </div>
                            <Flex
                              flexDir="column"
                              className="flex flex-col max-h-[300px] overflow-y-auto"
                            >
                              {currencies
                                ?.filter((currency) =>
                                  currency.cc
                                    ?.toLowerCase()
                                    ?.includes(currencySearchText?.toLowerCase())
                                )
                                .map((currency: { cc: string }, index: number) => (
                                  <div className="w-full" key={`currency-option-${index}`}>
                                    <CurrencyItem
                                      currency={currency}
                                      onSelect={(currency) => {
                                        form.setFieldValue('currencyCode', currency.cc);
                                        setIsOpenCurrencyPopover(false);
                                      }}
                                    />
                                  </div>
                                ))}
                            </Flex>
                          </PopoverContent>
                        </Popover>
                        <FormErrorMessage>{t(meta.error || '')}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </Flex>

                {/* Currency symbol position */}
                <Flex className="flex-col">
                  <label className="font-medium text-sm text-secondary-800">
                    {t('Currency symbol position')}
                  </label>

                  <Field name="currencySymbolPosition">
                    {({ field, meta, form }: any) => (
                      <FormControl isInvalid={!!(meta.touched && meta.error)}>
                        <RadioGroup
                          colorScheme="green"
                          value={field.value}
                          onChange={(value) => form.setFieldValue('currencySymbolPosition', value)}
                        >
                          <HStack className="py-3.5 space-x-3">
                            <Radio
                              value="left"
                              border="border"
                              className="border border-secondary-300"
                            >
                              ($) {t('Left')}
                            </Radio>
                            <Radio
                              value="right"
                              border="border"
                              className="border border-secondary-300"
                            >
                              {t('Right')} ($)
                            </Radio>
                          </HStack>
                        </RadioGroup>

                        <FormErrorMessage>{t(meta.error || '')}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </Flex>

                {/* Guest checkout */}
                <Flex className="flex-col">
                  <label className="font-medium text-sm text-secondary-800">
                    {t('Guest checkout')}
                  </label>

                  <Field name="guestCheckout">
                    {({ field, meta, form }: any) => (
                      <FormControl isInvalid={!!(meta.touched && meta.error)}>
                        <div className="py-3.5">
                          <Checkbox
                            colorScheme="green"
                            isChecked={!!field.value}
                            onChange={(e) => form.setFieldValue('guestCheckout', e.target.checked)}
                            className="border-secondary-200 items-center text-sm [&>span]:border-secondary-200 text-secondary-800"
                          >
                            <span className="-mt-[0.20rem] inline-block">
                              {t('Allow creating orders without customer account')}
                            </span>
                          </Checkbox>
                        </div>

                        <FormErrorMessage>{t(meta.error || '')}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </Flex>

                {/* Guest checkout */}
                <Flex className="flex-col">
                  <label className="font-medium text-sm text-secondary-800">
                    {t('Client email verification')}
                  </label>

                  <Field name="loginOnlyVerifiedEmail">
                    {({ field, meta, form }: any) => (
                      <FormControl isInvalid={!!(meta.touched && meta.error)}>
                        <div className="py-3.5">
                          <Checkbox
                            colorScheme="green"
                            isChecked={!!field.value}
                            onChange={(e) => form.setFieldValue('loginOnlyVerifiedEmail', e.target.checked)}
                            className="border-secondary-200 items-center text-sm [&>span]:border-secondary-200 text-secondary-800"
                          >
                            <span className="-mt-[0.20rem] inline-block">
                              {t('Allow access only to customers with a verified email')}
                            </span>
                          </Checkbox>
                        </div>

                        <FormErrorMessage>{t(meta.error || '')}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </Flex>

                {/* Sort POS categories by */}
                <Flex className="flex-col">
                  <label className="font-medium text-sm text-secondary-800">
                    {t('Sort POS categories by')}
                  </label>

                  <Field name="sortCategories">
                    {({ field, meta, form }: any) => (
                      <FormControl isInvalid={!!(meta.touched && meta.error)}>
                        <RadioGroup
                          value={field.value}
                          colorScheme="green"
                          onChange={(value) => form.setFieldValue('sortCategories', value)}
                        >
                          <HStack className="py-3.5 @3xl:space-x-3 flex-wrap">
                            <Radio
                              value="priority_number"
                              border="border"
                              className="border border-secondary-300"
                            >
                              {t('Priority number')}
                            </Radio>
                            <Radio
                              value="alphabetical_order"
                              border="border"
                              className="border border-secondary-300"
                            >
                              {t('Alphabetical order')}
                            </Radio>
                          </HStack>
                        </RadioGroup>

                        <FormErrorMessage>{t(meta.error || '')}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </Flex>
              </div>

              {/* Maintenance card */}
              <div>
                <div className="flex flex-col gap-2 p-6 bg-white rounded-md shadow-[0px_1px_2px_0px_rgba(0,0,0,0.06),0px_1px_3px_0px_rgba(0,0,0,0.1)]">
                  <h6 className="flex flex-row items-center gap-2 font-medium text-sm text-secondary-800">
                    <Alarm />
                    {t('Maintenance mode')}
                  </h6>
                  <p className="font-normal text-sm text-secondary-400 flex-1">
                    {t(
                      'The app and the website will be temporarily unavailable for customers and other users. Only admin panel will remain accessible.'
                    )}
                  </p>

                  <Field name="maintenanceMode">
                    {({ field, meta, form }: any) => (
                      <FormControl isInvalid={!!(meta.touched && meta.error)}>
                        <Switch
                          colorScheme="green"
                          isChecked={field.value}
                          size="lg"
                          onChange={(e) => form.setFieldValue('maintenanceMode', e.target.checked)}
                        />
                        <FormErrorMessage>{t(meta.error || '')}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Button
                isLoading={isSubmitting}
                type="submit"
                colorScheme="primary"
                className="@3xl:absolute top-0 right-0 w-fit bg-primary-400"
              >
                {t('Update')}
              </Button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
}
