import axios from 'axios';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Spinner,
} from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { FieldRenderer } from './FieldRenderer';
import { toast } from 'sonner';

type PropsType = {
  isLoading?: boolean;
  businessInfo?: any;
  refresh: () => void;
};

// footer content input fields config.
const FOOTER_CONTENT_FIELDS = [
  {
    name: 'companySlogan',
    type: 'textarea',
    label: 'Company slogan/Short description',
    placeholder: 'Write here',
  },
  {
    name: 'copyrightText',
    type: 'text',
    label: 'Copyright text',
    placeholder: 'Enter copyright text',
  },
  {
    name: 'facebook',
    type: 'url',
    label: 'Facebook',
    placeholder: 'Enter facebook page url',
  },
  {
    name: 'instagram',
    type: 'url',
    label: 'Instagram',
    placeholder: 'Enter instagram page url',
  },
  {
    name: 'twitter',
    type: 'url',
    label: 'X (Twitter)',
    placeholder: 'Enter x page url',
  },
];

// Contact us page content input fields config.
const CONTACT_CONTENT_FIELDS = [
  { name: 'name', label: 'Name', type: 'text', placeholder: 'Name of your company/business' },
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
    name: 'address-group',
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

export default function SiteSettings({ isLoading, businessInfo, refresh }: PropsType) {
  const { t } = useTranslation();

  // return spinner ui for isLoading
  if (isLoading) {
    return (
      <Box className="p-6 py-30 rounded-md flex flex-col items-center space-y-4 max-w-[730px] bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.06),0px_1px_3px_0px_rgba(0,0,0,0.1)]">
        <Spinner />
      </Box>
    );
  }

  // Render content upload form
  return (
    <Formik
      initialValues={{
        favicon: undefined,
        logo: undefined,
        minimizedLogo: undefined,
        companySlogan: businessInfo?.companySlogan || '',
        copyrightText: businessInfo?.copyrightText || '',
        facebook: businessInfo?.facebook || '',
        instagram: businessInfo?.instagram || '',
        twitter: businessInfo?.twitter || '',

        // about us page
        aboutUsImage: undefined,
        aboutUsHeading: businessInfo?.aboutUsHeading || '',
        aboutUsDescription: businessInfo?.aboutUsDescription || '',

        // contact us page
        name: businessInfo?.name || '',
        email: businessInfo?.email || '',
        phone: businessInfo?.phone || '',
        address: businessInfo?.address || '',
        country: businessInfo?.country || '',
        contactUsImage: undefined,

        // terms & condition , privacy policy and return policy
        termsAndConditions: businessInfo?.termsAndConditions || '',
        privacyPolicy: businessInfo?.privacyPolicy || '',
        returnPolicy: businessInfo?.returnPolicy || '',

        theme: 'default',
      }}
      onSubmit={async (values: any, actions: any) => {
        refresh();
        try {
          actions.setSubmitting(true);
          const formattedData = new FormData();

          // Format data for multipart request
          for (const key in values) {
            if (Array.isArray(values[key])) {
              if (values[key].length === 0) {
                formattedData.append(`${key}[]`, '');
              }
              values[key].forEach((item) => formattedData.append(`${key}[]`, item ?? ''));
            } else {
              formattedData.append(key, values[key] || '');
            }
          }

          // Make Put request for updating
          const { data } = await axios.put('/api/business-setup/site-setting', formattedData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          if (data?.success) {
            toast.success(data.message);
            refresh?.();
          }
        } catch (e) {
          if (Array.isArray(e.response.data.messages)) {
            e.response.data.messages.forEach((err: any) => {
              toast.error(t(err.message));
              actions.s(err.field, err.message);
            });
          } else {
            toast.error(t(e.response.data.message) || t('Something went wrong'));
          }
        } finally {
          actions.setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, submitForm, errors }) => (
        <Form className="@container">
          <Accordion defaultIndex={[0, 1, 2, 3, 4, 5]} allowMultiple>
            <AccordionItem className="border-none">
              <AccordionButton className="border-b-[2px] border-b-black/[6%]">
                <Box as="p" flex="1" textAlign="left">
                  {t('Global')}
                </Box>
                <AccordionIcon />
              </AccordionButton>

              {/* Site management */}
              <AccordionPanel className="px-0 py-4">
                <div className="grid grid-cols-1 @2xl:grid-cols-2 gap-4">
                  {/* Site logo and favicon */}
                  <div className="flex flex-col gap-4">
                    <div className="@container flex flex-col gap-6 p-4 sm:p-6 bg-white rounded-md shadow-[0px_1px_2px_0px_rgba(0,0,0,0.06),0px_1px_3px_0px_rgba(0,0,0,0.1)]">
                      {/* Favicon */}
                      <div className="grid grid-cols-1 @md:grid-cols-2 gap-4">
                        <FieldRenderer
                          name="favicon"
                          type="file"
                          label="Website favicon"
                          defaultPreview={businessInfo?.favicon?.url}
                        />
                      </div>

                      {/* Minimized Logo */}
                      <div className="grid grid-cols-1 @md:grid-cols-2 gap-4">
                        <FieldRenderer
                          name="minimizedLogo"
                          type="file"
                          label="Minimized logo"
                          defaultPreview={businessInfo?.minimizedLogo?.url}
                        />

                        {/* Logo */}
                        <FieldRenderer
                          name="logo"
                          type="file"
                          label="Company logo"
                          defaultPreview={businessInfo?.logo?.url}
                        />
                      </div>
                    </div>
                  </div>

                  {/* footer content input fields */}
                  <div>
                    <div className="flex flex-col gap-4 p-4 sm:p-6 bg-white rounded-md shadow-[0px_1px_2px_0px_rgba(0,0,0,0.06),0px_1px_3px_0px_rgba(0,0,0,0.1)]">
                      {FOOTER_CONTENT_FIELDS.map((field) => (
                        <FieldRenderer key={field.name} {...field} />
                      ))}
                    </div>
                  </div>
                </div>
              </AccordionPanel>
            </AccordionItem>

            {/* About us page */}
            <AccordionItem className="border-none">
              <AccordionButton className="border-b-[2px] border-b-black/[6%]">
                <Box as="p" flex="1" textAlign="left">
                  {t('About us page')}
                </Box>
                <AccordionIcon />
              </AccordionButton>

              {/* Site management */}
              <AccordionPanel className="px-0 py-4">
                <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
                  {/* Site logo and favicon */}
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-6 p-4 sm:p-6 bg-white rounded-md shadow-[0px_1px_2px_0px_rgba(0,0,0,0.06),0px_1px_3px_0px_rgba(0,0,0,0.1)] [&>div>p]:hidden [&>div>div]:h-[180px]">
                      <FieldRenderer
                        name="aboutUsImage"
                        type="file"
                        label="Image"
                        defaultPreview={businessInfo?.aboutUsImage?.url}
                      />
                    </div>
                  </div>

                  {/* About us page content input fields */}
                  <div>
                    <div className="flex flex-col gap-4 p-4 sm:p-6 bg-white rounded-md shadow-[0px_1px_2px_0px_rgba(0,0,0,0.06),0px_1px_3px_0px_rgba(0,0,0,0.1)]">
                      {[
                        {
                          name: 'aboutUsHeading',
                          type: 'text',
                          label: 'Heading',
                          placeholder: 'Enter about us heading',
                        },
                        {
                          name: 'aboutUsDescription',
                          type: 'textarea',
                          label: 'Description',
                          placeholder: 'Write here',
                        },
                      ].map((field) => (
                        <FieldRenderer key={field.name} {...field} />
                      ))}
                    </div>
                  </div>
                </div>
              </AccordionPanel>
            </AccordionItem>

            {/* Contact us page */}
            <AccordionItem className="border-none">
              <AccordionButton className="border-b-[2px] border-b-black/[6%]">
                <Box as="p" flex="1" textAlign="left">
                  {t('Contact us page')}
                </Box>
                <AccordionIcon />
              </AccordionButton>

              {/* Site management */}
              <AccordionPanel className="px-0 py-4">
                <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
                  {/* Site logo and favicon */}
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4 p-4 sm:p-6 bg-white rounded-md shadow-[0px_1px_2px_0px_rgba(0,0,0,0.06),0px_1px_3px_0px_rgba(0,0,0,0.1)] data-[error]:[&>div>div]:h-fit [&>div>p]:hidden [&>div>div]:h-[180px]">
                      <FieldRenderer
                        name="contactUsImage"
                        type="file"
                        label="Image"
                        defaultPreview={businessInfo.contactUsImage?.url}
                      />
                    </div>
                  </div>

                  {/* About us page content input fields */}
                  <div>
                    <div className="flex flex-col gap-4 p-4 sm:p-6 bg-white rounded-md shadow-[0px_1px_2px_0px_rgba(0,0,0,0.06),0px_1px_3px_0px_rgba(0,0,0,0.1)]">
                      {CONTACT_CONTENT_FIELDS.map((field) =>
                        field.type === 'group' ? (
                          <div key={field.name} className="flex flex-col gap-2">
                            <label> {t(field.label)} </label>
                            {field?.items?.map((item, itemIndex) => (
                              <FieldRenderer key={itemIndex} {...item} />
                            ))}
                          </div>
                        ) : (
                          field.name && <FieldRenderer key={field.name} {...field} />
                        )
                      )}
                    </div>
                  </div>
                </div>
              </AccordionPanel>
            </AccordionItem>

            {/* Terms & Conditions */}
            <AccordionItem className="border-none">
              <AccordionButton className="border-b-[2px] border-b-black/[6%]">
                <Box as="p" flex="1" textAlign="left">
                  {t('Terms & Conditions')}
                </Box>
                <AccordionIcon />
              </AccordionButton>

              <AccordionPanel className="px-0 py-4">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-4 p-4 sm:p-6 bg-white rounded-md shadow-[0px_1px_2px_0px_rgba(0,0,0,0.06),0px_1px_3px_0px_rgba(0,0,0,0.1)] [&>div>textarea]:h-80">
                    <FieldRenderer
                      name="termsAndConditions"
                      type="textarea"
                      label="Description"
                      placeholder="Write here"
                    />
                  </div>
                </div>
              </AccordionPanel>
            </AccordionItem>

            {/* Privacy Policy */}
            <AccordionItem className="border-none">
              <AccordionButton className="border-b-[2px] border-b-black/[6%]">
                <Box as="p" flex="1" textAlign="left">
                  {t('Privacy Policy')}
                </Box>
                <AccordionIcon />
              </AccordionButton>

              <AccordionPanel className="px-0 py-4">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-4 p-4 sm:p-6 bg-white rounded-md shadow-[0px_1px_2px_0px_rgba(0,0,0,0.06),0px_1px_3px_0px_rgba(0,0,0,0.1)] [&>div>textarea]:h-80">
                    <FieldRenderer
                      name="privacyPolicy"
                      type="textarea"
                      label="Description"
                      placeholder="Write here"
                    />
                  </div>
                </div>
              </AccordionPanel>
            </AccordionItem>

            {/* Return Policy */}
            <AccordionItem className="border-none">
              <AccordionButton className="border-b-[2px] border-b-black/[6%]">
                <Box as="p" flex="1" textAlign="left">
                  {t('Return Policy')}
                </Box>
                <AccordionIcon />
              </AccordionButton>

              <AccordionPanel className="px-0 py-4">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-4 p-4 sm:p-6 bg-white rounded-md shadow-[0px_1px_2px_0px_rgba(0,0,0,0.06),0px_1px_3px_0px_rgba(0,0,0,0.1)] [&>div>textarea]:h-80">
                    <FieldRenderer
                      name="returnPolicy"
                      type="textarea"
                      label="Description"
                      placeholder="Write here"
                    />
                  </div>
                </div>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>

          <Button
            type="button"
            isLoading={isSubmitting}
            colorScheme="primary"
            className="@3xl:absolute top-0 right-0 bg-primary-400"
            onClick={() => {
              if (Object.keys(errors).length) {
                toast.error('Please fill in all required fields');
                return;
              }
              submitForm();
            }}
          >
            Update
          </Button>
        </Form>
      )}
    </Formik>
  );
}
