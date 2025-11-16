import axios from 'axios';
import { useRef } from 'react';
import { toast } from 'sonner';
import { match } from 'ts-pattern';
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  IconButton,
  Input,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { Field, FieldArray, Form, Formik } from 'formik';
import { Edit2 } from 'iconsax-react';
import EditMenuItemVariantSchema from '@/schemas/EditMenuItemVariantSchema';
import VariantFormInputField from './VariantFormInputField';
import DeleteVariant from './DeleteVariant';
import { useTranslation } from 'react-i18next';

export default function EditVariant({
  isIconButton = false,
  editData,
  refresh,
}: {
  isIconButton: boolean;
  editData: any;
  refresh: () => void;
}) {
  const { t } = useTranslation();
  const btnRef = useRef<HTMLButtonElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Field configuration for the form inputs
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

  // Submit handler for form data submission to update the variants
  const handleOnSubmit = async (values: any, actions: any) => {
    const newValues = {
      ...values,
      min: Boolean(values?.allowMultiple) ? Number(values.min) : 1,
      max: Boolean(values?.allowMultiple) ? Number(values.max) : 1,
    };

    try {
      actions.setSubmitting(true);
      const { data } = await axios.put(`/api/variants/${editData.id}`, newValues);

      if (data?.content?.id) {
        refresh();
        toast.success(t('Menu item updated successfully'));
        actions.resetForm();
      }
    } catch (e) {
      toast.error(t(e.response.data.message) || t('Something went wrong'));
    } finally {
      actions.setSubmitting(false);
    }
  };

  // format initial values for formik based on edit data
  const getInitialValues = (prevData: any) => {
    return {
      name: prevData?.name ?? '',
      value: prevData?.value ?? '',
      allowMultiple: Boolean(prevData?.allowMultiple),
      requirement: prevData?.requirement || 'optional',
      min: prevData?.min ?? '',
      max: prevData?.max ?? '',
      isAvailable: true,
      variantOptions: [
        ...(prevData?.variantOptions.map((d: any) => ({
          id: d.id,
          name: d.name,
          price: d.price,
        })) || { name: '', price: '' }),
      ],
    };
  };

  return (
    <>
      <Box>
        {isIconButton ? (
          <IconButton
            aria-label={t('Edit')}
            icon={<Edit2 size="18" color="currentColor" />}
            colorScheme="blue"
            className="hover:bg-blue-100 text-blue-600"
            variant="outline"
            onClick={onOpen}
          />
        ) : (
          <Button
            aria-label="Edit"
            rightIcon={<Edit2 size="18" />}
            colorScheme="blue"
            className="hover:bg-blue-100 text-blue-600"
            variant="outline"
            onClick={onOpen}
          >
            {t('Edit')}
          </Button>
        )}
      </Box>

      <Drawer isOpen={isOpen} placement="right" size="md" onClose={onClose} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader className="border-b border-black/5 mt-1">{t('Edit variant')}</DrawerHeader>

          <Formik
            initialValues={{ ...getInitialValues(editData) }}
            onSubmit={handleOnSubmit}
            validationSchema={EditMenuItemVariantSchema}
          >
            {({ isSubmitting, setFieldValue, values }) => (
              <Form>
                <DrawerBody className="space-y-4 p-6 pt-4 h-[calc(100vh-150px)] overflow-y-auto">
                  <Flex
                    gap={4}
                    direction="column"
                    border="1px"
                    borderStyle="dashed"
                    p={2}
                    rounded="6px"
                    borderColor="teal.500"
                  >
                    {fieldItems.map((field, index) =>
                      match(field)
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
                              <Text
                                color="secondary.500"
                                fontWeight={500}
                                fontSize={14}
                                lineHeight={5}
                              >
                                {t('Option')} {index + 1}
                              </Text>
                              <Button
                                onClick={() => {
                                  remove(index);
                                  if (values.variantOptions?.length < 2) {
                                    setFieldValue('variantOptions', [{ name: '', price: '' }]);
                                  }
                                }}
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
                                      <Input
                                        type="text"
                                        placeholder={t('Additional price')}
                                        {...field}
                                      />
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

                    <HStack gap={2} w="full">
                      <Button
                        type="button"
                        onClick={() => {
                          setFieldValue('variantOptions', [
                            ...values.variantOptions,
                            { name: '', price: '' },
                          ]);
                        }}
                        variant="outline"
                        colorScheme="blue"
                        h={8}
                        width="full"
                        fontSize={14}
                        fontWeight={600}
                        disabled={isSubmitting}
                      >
                        {t('Add another option')}
                      </Button>

                      <DeleteVariant
                        id={editData.id}
                        refresh={refresh}
                        trigger={
                          <Button
                            fontSize={14}
                            fontWeight={600}
                            h={8}
                            width="full"
                            type="button"
                            variant="outline"
                            colorScheme="red"
                            disabled={isSubmitting}
                          >
                            {t('Remove this variant')}
                          </Button>
                        }
                      />
                    </HStack>
                  </Flex>
                </DrawerBody>
                <DrawerFooter
                  borderTopWidth="1px"
                  borderColor="secondary.200"
                  className="absolute bg-white w-full bottom-0"
                >
                  <Button type="button" variant="outline" w="full" mr={3} onClick={onClose}>
                    {t('Cancel')}
                  </Button>
                  <Button
                    variant="solid"
                    colorScheme="primary"
                    w="full"
                    type="submit"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                    className="bg-blue-500 font-semibold hover:bg-blue-400 bg-transition active:bg-blue-600"
                  >
                    {t('Update')}
                  </Button>
                </DrawerFooter>
              </Form>
            )}
          </Formik>
        </DrawerContent>
      </Drawer>
    </>
  );
}
