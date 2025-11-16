import BusinessInfoFormSchema from '@/schemas/BusinessInfoFormSchema';
import { Box, Button, FormLabel, Spinner } from '@chakra-ui/react';
import axios from 'axios';
import { Form, Formik } from 'formik';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { match } from 'ts-pattern';
import { FieldRenderer } from './FieldRenderer';

type BusinessInfo = {
  name: string;
  siteUrl: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  timeZone: string;
  timeFormat: string;
};

export default function BusinessInfo({
  isLoading,
  businessInfo,
  refresh,
}: {
  isLoading?: boolean;
  businessInfo?: BusinessInfo;
  refresh?: () => void;
}) {
  const { t } = useTranslation();

  // form fields config
  const fieldItems = [
    { name: 'name', label: 'Name', type: 'text', placeholder: 'Name of your company/business' },
    { name: 'siteUrl', label: 'Site URL', type: 'text', placeholder: 'https:// example.com' },
    {
      name: 'email',
      label: 'Email address',
      type: 'email',
      placeholder: 'Enter company email address',
    },
    {
      name: 'phone',
      label: 'Phone',
      type: 'tel',
      placeholder: 'Enter phone number',
    },
    {
      type: 'group',
      label: 'Airport',
      items: [
        {
          name: 'address',
          type: 'text',
          label: '',
          placeholder: 'Enter airport',
        },
        {
          name: 'country',
          type: 'country',
          label: '',
          placeholder: 'Country',
        },
      ],
    },
  ];

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
          name: businessInfo?.name || '',
          siteUrl: businessInfo?.siteUrl || '',
          email: businessInfo?.email || '',
          phone: businessInfo?.phone || '',
          address: businessInfo?.address || '',
          country: businessInfo?.country || '',
          timeZone: businessInfo?.timeZone || '',
          timeFormat: businessInfo?.timeFormat || '',
        }}
        onSubmit={async (values: any, actions) => {
          try {
            actions.setSubmitting(true);

            const formattedData = {
              name: values.name,
              siteUrl: values.siteUrl,
              email: values.email,
              phone: values.phone,
              address: values.address,
              country: values.country,
              timeZone: values.timeZone,
              timeFormat: values.timeFormat,
            };

            const { data } = await axios.put('/api/business-setup/business-info', formattedData);

            if (data?.success) {
              toast.success(data.message);
              refresh?.();
            }
          } catch (e) {
            toast.error(t(e.response.data.message || e.response.data.messages?.[0]?.message) || t('Something went wrong'));
          } finally {
            actions.setSubmitting(false);
          }
        }}
        validationSchema={BusinessInfoFormSchema}
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
                </Box>
              </div>

              <div className="col-span-1">
                <Box
                  rounded="6px"
                  className="p-6 py-4 flex flex-col items-center space-y-4 bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.06),0px_1px_3px_0px_rgba(0,0,0,0.1)]"
                >
                  <FieldRenderer
                    name="timeZone"
                    type="timezone"
                    label="Time zone"
                    placeholder="Select time zone"
                  />

                  <FieldRenderer
                    name="timeFormat"
                    type="radio_group"
                    label="Time format"
                    options={[
                      { label: '12 hour', value: '12_format' },
                      { label: '24 hour', value: '24_format' },
                    ]}
                  />
                </Box>
              </div>

              <Button
                type="submit"
                isLoading={isSubmitting}
                colorScheme="primary"
                className="@3xl:absolute top-0 right-0 w-fit bg-primary-400"
              >
                {t('Update')}
              </Button>
            </Form>
          </div>
        )}
      </Formik>
    </div>
  );
}
