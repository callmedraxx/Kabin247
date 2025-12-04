import CustomerLayout from '@/components/Customer/CustomerLayout';
import { convertToCurrencyFormat } from '@/utils/currency_formatter';
import { PageProps } from '@/types';
import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  IconButton,
  Input,
  Spinner,
} from '@chakra-ui/react';
import { Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Field, Form, Formik } from 'formik';
import { ArrowLeft } from 'iconsax-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import useSWR from 'swr';
import fetcher from '@/lib/fetcher';
import { toast } from 'sonner';
import usePOS from '@/data/use_pos';

const CheckoutFormSchema = Yup.object({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email address').required('Full name is required'),
  phoneNumber: Yup.string().required('Phone number is required'),
  address: Yup.string().required('Airport is required'),
  paymentMethod: Yup.string().required('Payment method is required'),
});

export default function Checkout() {
  const { t } = useTranslation();
  const {
    props: { auth },
  } = usePage() as { props: PageProps };

  const { data: paymentMethods } = useSWR('/api/user/payment-methods', fetcher);

  const cart = usePOS();

  const checkoutInputs = [
    {
      type: 'group',
      items: [
        {
          label: 'First name',
          name: 'firstName',
          type: 'text',
          placeholder: 'Enter your first name',
        },

        {
          label: 'First name',
          name: 'lastName',
          type: 'text',
          placeholder: 'Enter your last name',
        },
      ],
    },
    {
      label: 'Email',
      name: 'email',
      type: 'email',
      placeholder: 'Enter your email address',
      disabled: true,
    },
    {
      label: 'Phone',
      name: 'phoneNumber',
      type: 'tel',
      placeholder: 'Enter your phone number',
    },
    {
      label: 'Airport',
      name: 'address',
      type: 'text',
      placeholder: 'Enter the airport nearist to you',
    },
  ];

  useEffect(() => {
    if (!auth) {
      router.visit('/login');
    }
  }, []);

  const resetCartState = () => {
    cart.resetPOS();
  };

  if (!auth) {
    return (
      <CustomerLayout>
        <div className="flex flex-col items-center justify-center h-screen">
          <Spinner />
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <Formik
        initialValues={{
          firstName: auth.firstName || '',
          lastName: auth.lastName || '',
          email: auth.email || 'initialEmail',
          phoneNumber: auth.phoneNumber || '',
          address: auth.address || '',
          paymentMethod: '',
        }}
        validationSchema={CheckoutFormSchema}
        onSubmit={async (values, actions) => {
          // Format the data for submission
          const formattedData = {
            userId: auth?.id,
            discount: cart.discount,
            type: cart?.type,
            paymentType: values?.paymentMethod,
            customerNote: cart.note,
            paymentStatus: 'unpaid',
            deliveryDate: new Date().toISOString().split('T')[0],
            orderItems:
              cart.POSItems.map((item) => ({
                ...item,
                menuItemId: item.id,
                variants:
                  Array.from(item.variants.values()).map((variant) => ({
                    ...variant,
                    options: Array.from(variant.option.values()) || [],
                    optionIds: Array.from(variant.option.keys()) || [],
                  })) || [],

                addons:
                  Array.from(item.addons.values()).map((addon) => ({
                    ...addon,
                  })) || [],
              })) || [],
          };

          try {
            // update user data
            const { data, status } = await axios.put('/api/users/profile/update', values);
            if ((data?.success && status === 200) || status === 201) {
              // Create order
              const { data: orderResponseData } = await axios.post(
                '/api/user/orders',
                formattedData
              );

              if (orderResponseData?.success && formattedData?.paymentType === 'ach') {
                // reset and cart redirect to success page for ACH
                resetCartState();
                router.visit('/confirm');
              }
              if (orderResponseData?.success && formattedData?.paymentType !== 'ach') {
                // reset and redirect to payment gateway for card/paypal/stripe
                resetCartState();
                window.location.href = orderResponseData?.redirectUrl;
              }
            }
          } catch (error) {
            toast.error(t(error.response.data.message || 'Failed to checkout'));
          } finally {
            actions.setSubmitting(false);
          }

          return;
        }}
      >
        {({ isSubmitting }) => (
          <main className="bg-white mt-20">
            <Form>
              <section className="container">
                <div className="flex items-center gap-4 py-9">
                  <IconButton
                    as={Link}
                    href="/user/my-orders"
                    aria-label="left arrow"
                    className="rounded-full min-w-14 min-h-14 bg-transparent border border-secondary-200"
                  >
                    <ArrowLeft />
                  </IconButton>
                  <h2 className="text-3xl">{t('Checkout')}</h2>
                </div>
                <div className="mb-10">
                  <h4 className="mb-2">{t('Delivery airport')}</h4>
                  <div className="max-w-[460px] mb-10">
                    <>
                      {checkoutInputs.map((item, index) =>
                        item.type === 'group' ? (
                          <div key={index} className="grid grid-cols-2 gap-4 mb-4">
                            {item.items?.map((subItem) => (
                              <Field name={subItem.name} key={subItem.name}>
                                {({ field, meta }: { field: any; meta: any }) => (
                                  <FormControl isInvalid={!!(meta.touched && meta.error)}>
                                    <Input
                                      rounded="full"
                                      type={subItem.type}
                                      placeholder={t(subItem.placeholder)}
                                      className="h-12 bg-white"
                                      {...field}
                                    />

                                    <FormErrorMessage>{t(meta.error || '')}</FormErrorMessage>
                                  </FormControl>
                                )}
                              </Field>
                            ))}
                          </div>
                        ) : (
                          <Field name={item.name} key={index}>
                            {({ field, meta }: { field: any; meta: any }) => (
                              <FormControl isInvalid={!!(meta.touched && meta.error)}>
                                <Input
                                  {...item}
                                  rounded="full"
                                  type={item.type}
                                  placeholder={t(item.placeholder || '')}
                                  className="h-12 bg-white mb-4"
                                  {...field}
                                />

                                <FormErrorMessage>{t(meta.error || '')}</FormErrorMessage>
                              </FormControl>
                            )}
                          </Field>
                        )
                      )}
                    </>
                  </div>
                  <h4 className="mb-2">{t('Payment method')}</h4>
                  <div className="flex items-center gap-2">
                    <Field name="paymentMethod">
                      {({ field, meta, form }: { field: any; meta: any; form: any }) => (
                        <FormControl isInvalid={!!(meta.touched && meta.error)}>
                          <Flex className="gap-2">
                            <Button
                              variant="outline"
                              colorScheme="outline"
                              data-selected={field.value === 'ach'}
                              className={`h-12 uppercase border rounded-full px-8 data-[selected=true]:border-primary-400 data-[selected=true]:text-primary-400 border-secondary-200 hover:border-primary-400 hover:text-primary-400`}
                              onClick={() => {
                                form.setFieldValue('paymentMethod', 'ach');
                                cart.changePaymentType('ach');
                              }}
                            >
                              ACH
                            </Button>

                            {paymentMethods?.content?.map((item: Record<string, any>) => (
                              <Button
                                key={item.id}
                                variant="outline"
                                colorScheme="outline"
                                data-selected={field.value === item.key}
                                className={`h-12 uppercase border rounded-full px-8 data-[selected=true]:border-primary-400 data-[selected=true]:text-primary-400 border-secondary-200 hover:border-primary-400 hover:text-primary-400`}
                                onClick={() => {
                                  form.setFieldValue('paymentMethod', item.key);
                                  cart.changePaymentType(item.key);
                                }}
                              >
                                {item.name}
                              </Button>
                            ))}
                          </Flex>

                          <FormErrorMessage>{t(meta.error || '')}</FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                  </div>
                </div>
                <div className="max-w-[675px] py-10 border-t border-t-black/10">
                  <div className="flex justify-between items-center py-2 border-b border-black/5 px-4">
                    <p className="text-lg">{t('Total')}</p>
                    <p className="text-xl font-bold">{convertToCurrencyFormat(cart.total)}</p>
                  </div>
                  <div className="flex gap-4 items-center justify-between pt-3">
                    <Button
                      as={Link}
                      href="/user/my-orders"
                      variant="outline"
                      colorScheme="secondary"
                      className="button-outline"
                    >
                      {t('Back')}
                    </Button>
                    <Button
                      type="submit"
                      variant="solid"
                      colorScheme="primary"
                      className="button-primary"
                      disabled={isSubmitting}
                      isLoading={isSubmitting}
                    >
                      {t('Confirm order')}
                    </Button>
                  </div>
                </div>
              </section>
            </Form>
          </main>
        )}
      </Formik>
    </CustomerLayout>
  );
}
