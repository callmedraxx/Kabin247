import { Box, Button, FormLabel, Spinner } from '@chakra-ui/react';
import axios from 'axios';
import { Form, Formik } from 'formik';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { match } from 'ts-pattern';
import { FieldRenderer } from './BusinessSetup/FieldRenderer';
import PaymentMethodSchema from '@/schemas/PaymentMethodSchema';

type PaymentMethod = {
  config: string;
  countries: string;
  currencies: string;
  createdAt: string;
  id: number;
  extraParams: string;
  mode: string;
  key: string;
  logo: string;
  name: string;
  status: boolean;
  public: string;
  secret: string;
  updatedAt: string;
  webhook: string;
};

export default function PaymentMethod({
  isLoading,
  paymentMethod,
  refresh,
}: {
  isLoading?: boolean;
  paymentMethod: PaymentMethod;
  refresh?: () => void;
}) {
  const { t } = useTranslation();
  const config = JSON.parse(paymentMethod?.config);
  // form fields config
  let fieldItems: Array<{
    name: string;
    label: string;
    type: string;
    placeholder?: string;
    options?: Array<{ label: string; value: string }>;
    items?: Array<{ name: string; label: string; type: string; placeholder?: string }>;
  }> = [
    { name: 'name', label: 'Name', type: 'text', placeholder: 'Name of the payment method' },
  ]
  fieldItems = [...fieldItems, ...config?.fields?.map((field: any) => ({
    name: field.name,
    label: field.label,
    type: field.type,
    placeholder: field.label,
    options: field.options,
    items: field.items, // Add this line to include the items property
  })), {
    name: 'status',
    label: 'Status',
    type: 'radio_group',
    options: [
      { label: 'Active', value: '1' },
      { label: 'Inactive', value: '0' },
    ],
  }];

  if (isLoading) {
    return (
      <Box className="p-6 py-30 rounded-md flex flex-col items-center space-y-4 max-w-[730px] bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.06),0px_1px_3px_0px_rgba(0,0,0,0.1)]">
        <Spinner />
      </Box>
    );
  }

  // render form field
  return (
    <div>
      <Formik
        initialValues={{
          name: paymentMethod?.name || '',
          public: paymentMethod?.public || '',
          secret: paymentMethod?.secret || '',
          mode: paymentMethod?.mode || '',
          webhook: paymentMethod?.webhook || '',
          status: paymentMethod?.status ? '1' : '0',
        }}
        onSubmit={async (values: any, actions) => {
          try {
            actions.setSubmitting(true);

            const { data } = await axios.put('/api/payment-methods/' + paymentMethod?.id, values);

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
        validationSchema={PaymentMethodSchema}
      >
        {({ isSubmitting }) => (
          <div className="flex flex-col gap-4 @container">
            <Form className="w-full grid grid-cols-1 @3xl:grid-cols-2 gap-4">
              <div className="col-span-1">
                <Box
                  rounded="6px"
                  className="p-6 py-4 flex flex-col items-center space-y-4 bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.06),0px_1px_3px_0px_rgba(0,0,0,0.1)]"
                >
                  <div className="w-full flex flex-col items-stretch space-y-4">
                    {fieldItems.map((field, i) =>
                      match(field)
                        // render group field
                        .with({ type: 'group' }, (groupField) => (
                          <Fragment key={i}>
                            <div className="w-full">
                              <FormLabel className="text-sm text-secondary-800">
                                {groupField.label}
                              </FormLabel>
                              <div className="flex flex-col gap-2">
                                {groupField.items?.map((item, j) => (
                                  <FieldRenderer key={j} {...item} />
                                ))}
                              </div>
                            </div>
                          </Fragment>
                        ))

                        // other fields
                        .otherwise(
                          () =>
                            field.type !== 'group' &&
                            field.name && <FieldRenderer key={i} {...field} />
                        )
                    )}
                  </div>

                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    colorScheme="primary"
                    className="w-fit bg-primary-400 self-start"
                  >
                    {t('Update')}
                  </Button>
                </Box>
              </div>
            </Form>
          </div>
        )}
      </Formik>
    </div>
  );
}
