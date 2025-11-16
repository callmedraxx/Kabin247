import axios from 'axios';
import { toast } from 'sonner';
import { match } from 'ts-pattern';
import { Field, FieldArray, Formik } from 'formik';
import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  Input,
  Text,
} from '@chakra-ui/react';
import NewMenuItemVariantSchema from '@/schemas/NewMenuItemVariantSchema';
import VariantFormInputField from './Variants/VariantFormInputField';
import { useTranslation } from 'react-i18next';
import { Add, Trash } from 'iconsax-react';

export default function VariantCreationForm({
  afterFormSubmitCallback,
  removeVariantCallback,
}: {
  afterFormSubmitCallback: (data: any) => void;
  removeVariantCallback: () => void;
}) {
  const { t } = useTranslation();

  const fieldItems = [
    { name: 'name', type: 'text', placeholder: 'Variant name' },
    { name: 'value', type: 'text', placeholder: 'Variant unique name' },
    { name: 'allowMultiple', type: 'checkbox', label: 'Allow multiple selection' },
    {
      name: 'requirement',
      type: 'radio-group',
      label: 'Selection Requirement',
      options: [
        { label: 'Optional', value: 'optional' },
        { label: 'Required', value: 'required' },
      ],
    },

    {
      type: 'group',
      label: 'Selection range (Min-Max)',
      fields: [
        {
          name: 'min',
          type: 'number-with-controller',
          placeholder: 'Minimum',
        },
        {
          name: 'max',
          type: 'number-with-controller',
          placeholder: 'Maximum',
        },
      ],
    },
  ];

  return (
    <Formik
      initialValues={{
        name: '',
        value: '',
        allowMultiple: false,
        requirement: 'required',
        min: 1,
        max: 1,
        isAvailable: true,
        variantOptions: [{ name: '', price: '' }],
      }}
      onSubmit={async (values, actions) => {
        const newValues = {
          ...values,
          min: Boolean(values?.allowMultiple) ? Number(values.min) : 1,
          max: Boolean(values?.allowMultiple) ? Number(values.max) : 1,
        };

        try {
          actions.setSubmitting(true);
          const { data } = await axios.post('/api/variants', newValues);
          if (data?.content?.id) {
            afterFormSubmitCallback(data);
            toast.success(t('Variant created successfully'));
          }
        } catch (e) {
          if (Array.isArray(e.response.data.messages)) {
            e.response.data.messages.map((message: any) => {
              actions.setFieldError(message.field, message.message);
            });
          } else {
            toast.error(t(e.response.data.message) || t('Something went wrong'));
          }
        } finally {
          actions.setSubmitting(false);
        }
      }}
      validationSchema={NewMenuItemVariantSchema}
    >
      {({ values, isSubmitting, submitForm, setFieldValue }) => (
        <div>
          <div>
            <Flex gap={4} direction="column">
              {fieldItems.map((field, index) =>
                match(field)
                  // group input
                  .with(
                    { type: 'group' },
                    () =>
                      Boolean(values?.allowMultiple) && (
                        <Flex key={index} flexDirection="column">
                          <FormLabel
                            color="secondary.500"
                            fontWeight={500}
                            fontSize={14}
                            lineHeight={5}
                          >
                            {t(field.label ?? '')}
                          </FormLabel>

                          <Grid templateColumns="repeat(2,1fr)" gap={2}>
                            {field?.fields?.map((field) => (
                              <GridItem key={field.name}>
                                <VariantFormInputField {...field} />
                              </GridItem>
                            ))}
                          </Grid>
                        </Flex>
                      )
                  )
                  // normal input
                  .otherwise(
                    () =>
                      field.name &&
                      !field.fields && <VariantFormInputField key={index} {...field} />
                  )
              )}

              <hr className="border-black/[6%]" />

              <FieldArray name="variantOptions">
                {({ remove }: any) =>
                  values.variantOptions.map((_, index) => (
                    <Flex key={index} flexDirection="column" gap={2}>
                      <HStack>
                        <Text color="secondary.500" fontWeight={500} fontSize={14} lineHeight={5}>
                          {t('Option')} {index + 1}
                        </Text>
                        <Button
                          onClick={() => remove(index)}
                          variant="link"
                          className="hover:no-underline"
                        >
                          <Text color="red.500" fontWeight={600} fontSize={14} lineHeight={5}>
                            {t('Remove')}
                          </Text>
                        </Button>
                      </HStack>

                      <Grid templateColumns="repeat(2,1fr)" gap={2}>
                        <GridItem>
                          <Field name={`variantOptions.${index}.name`}>
                            {({ field, form }: any) => (
                              <FormControl
                                isInvalid={
                                  form.errors.variantOptions?.[index]?.name &&
                                  form.touched.variantOptions?.[index]?.name
                                }
                              >
                                <Input type="text" placeholder={t('Name')} {...field} />
                                <FormErrorMessage>
                                  {t(form.errors.variantOptions?.[index]?.name)}
                                </FormErrorMessage>
                              </FormControl>
                            )}
                          </Field>
                        </GridItem>

                        <GridItem>
                          <Field name={`variantOptions.${index}.price`}>
                            {({ field, form }: any) => (
                              <FormControl
                                isInvalid={
                                  form.errors.variantOptions?.[index]?.price &&
                                  form.touched.variantOptions?.[index]?.price
                                }
                              >
                                <Input type="text" placeholder={t('Additional price')} {...field} />
                                <FormErrorMessage>
                                  {t(form.errors.variantOptions?.[index]?.price)}
                                </FormErrorMessage>
                              </FormControl>
                            )}
                          </Field>
                        </GridItem>
                      </Grid>
                    </Flex>
                  ))
                }
              </FieldArray>

              <HStack gap={2} w="full" className="flex-wrap @md:flex-nowrap">
                <Button
                  type="button"
                  onClick={() => {
                    setFieldValue('variantOptions', [
                      ...values.variantOptions,
                      {
                        name: '',
                        price: '',
                      },
                    ]);
                  }}
                  variant="outline"
                  colorScheme="blue"
                  h={8}
                  fontSize={14}
                  fontWeight={600}
                  disabled={isSubmitting}
                  className="w-full flex-1 @md:w-auto gap-x-0"
                  leftIcon={<Add size={18} color="currentColor" />}
                >
                  {t('Option')}
                </Button>

                <Button
                  fontSize={14}
                  fontWeight={600}
                  h={8}
                  type="button"
                  variant="outline"
                  width="50%"
                  colorScheme="red"
                  disabled={isSubmitting}
                  onClick={removeVariantCallback}
                  className="flex-1"
                  leftIcon={<Trash size={18} color="currentColor" />}
                >
                  {t('Remove')}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  borderColor="secondary.200"
                  color="secondary.800"
                  justifySelf="flex-end"
                  ml="auto"
                  width="50%"
                  h={8}
                  fontSize={14}
                  fontWeight={600}
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  onClick={() => submitForm()}
                  noOfLines={1}
                  className="flex-1"
                >
                  {t('Save')}
                </Button>
              </HStack>
            </Flex>
          </div>
        </div>
      )}
    </Formik>
  );
}
