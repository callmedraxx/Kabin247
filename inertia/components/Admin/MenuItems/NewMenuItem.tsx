import useWindowSize from '@/hooks/useWindowSize';
import NewMenuItemSchema from '@/schemas/NewMenuItemSchema';
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
  HStack,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import axios from 'axios';
import { Form, Formik } from 'formik';
import { Add, ArrowLeft, ArrowRight, MoreCircle, TickCircle } from 'iconsax-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import MenuItemFormFieldRenderer from './MenuItemFormFieldRenderer';

// initial steps
const initSteps = [
  { id: 'information', title: 'Basic information and pricing', isComplete: false },
  { id: 'add-ons', title: 'Variation and add-ons', isComplete: false },
];

export default function NewMenuItem({ refresh }: { refresh?: () => void }) {
  const { t } = useTranslation();
  const btnRef = useRef<HTMLButtonElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeTab, setActiveTab] = useState<'information' | 'add-ons'>('information');
  const [steps, setSteps] = useState(initSteps);
  const windowSize = useWindowSize();

  const fieldItems = [
    {
      heading: 'Basic information',
      fields: [
        { name: 'name', type: 'text', placeholder: 'Item name' },
        { name: 'description', type: 'textarea', placeholder: 'Item description' },
        {
          name: 'image',
          label: 'Item image',
          type: 'file',
        },
        { name: 'categoryId', label: 'Category', type: 'combobox-category' },
        {
          name: 'foodType',
          label: 'Food type',
          type: 'radio-group',
          options: [
            { label: 'Veg', value: 'veg' },
            { label: 'Non-veg', value: 'nonVeg' },
          ],
        },
      ],
    },
    {
      heading: t('Pricing'),
      fields: [
        { name: 'price', label: '', type: 'number', placeholder: t('Enter regular price') },
        { name: 'discount', label: t('Discount'), type: 'number', placeholder: t('Add discount') },
        {
          name: 'discountType',
          label: t('Discount type'),
          type: 'radio-group',
          placeholder: '',
          options: [
            { label: t('Amount ($)'), value: 'amount' },
            { label: t('Percentage (%)'), value: 'percentage' },
          ],
        },
        {
          name: 'chargeIds',
          label: t('Add tax and charges'),
          type: 'tag-charges',
          placeholder: t('Search or add'),
        },
      ],
    },
  ];

  // handle form submit
  const handleOnSubmit = async (values: any, actions: any) => {
    if (!values) return;
    
    try {
      actions.setSubmitting(true);

      const formData = new FormData();

      for (const key in values) {
        if (values[key] !== undefined && values[key] !== null) {
          if (Array.isArray(values[key])) {
            if (values[key].length == 0) {
              formData.append(`${key}[]`, '');
            }
            values[key].forEach((item) => formData.append(`${key}[]`, item ?? ''));
          } else {
            formData.append(key, values[key]);
          }
        }
      }

      const { data } = await axios.post(`/api/menu-items`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Handle success
      if (data?.content?.id) {
        refresh?.();
        toast.success(t('Menu item created successfully'));
        actions.resetForm();
        setActiveTab('information');
        setSteps(initSteps);
      } else {
        toast.error(t(data?.message) || t('Failed to create menu item'));
      }
    } catch (e: any) {
      if (e?.response?.status === 422 && e?.response?.data?.messages) {
        const errorMessages: string[] = [];
        e.response.data.messages.forEach((message: { field: string; message: string }) => {
          const fieldName = message.field;
          actions.setFieldError(fieldName, t(message.message));
          errorMessages.push(`${t(fieldName)}: ${t(message.message)}`);
        });
        if (errorMessages.length > 0) {
          toast.error(t('Please fix the following errors:') + ' ' + errorMessages.join(', '));
        }
      } else if (e?.response?.status === 422 && e?.response?.data?.errors) {
        const errors = e.response.data.errors;
        Object.keys(errors).forEach((field) => {
          const errorMsg = Array.isArray(errors[field]) ? errors[field][0] : errors[field];
          actions.setFieldError(field, t(errorMsg));
        });
        toast.error(t('Please fix the validation errors'));
      } else if (e?.response?.data?.message) {
        toast.error(t(e.response.data.message));
      } else {
        toast.error(t('Something went wrong. Please check your input and try again.'));
      }
    } finally {
      actions.setSubmitting(false);
    }
  };

  // format initial values
  const initialValues = {
    name: '',
    description: '',
    categoryId: '',
    foodType: '',
    price: '',
    discount: '0',
    priority: 1,
    discountType: 'amount',
    isAvailable: true,
    image: '',
    chargeIds: [],
    addonIds: [],
    variantIds: [],
  };

  return (
    <>
      <Box>
        <Button
          w="full"
          color="white"
          bg="primary.400"
          gap="2"
          alignItems="center"
          rounded="6px"
          px={4}
          colorScheme="primary"
          onClick={onOpen}
          className="hover:bg-primary-500"
        >
          {t('Create new item')}
          <Add size={14} color="currentColor" />
        </Button>
      </Box>

      <Drawer
        isOpen={isOpen}
        placement={windowSize.width < 640 ? 'bottom' : 'right'}
        size="md"
        onClose={() => {
          onClose();
          setActiveTab('information');
          setSteps(initSteps);
        }}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent className="@container h-[80%] sm:h-auto rounded-t-xl sm:rounded-t-none">
          <DrawerHeader className="border-b border-black/5 hidden @md:flex">
            <HStack gap={0} className="w-full">
              {steps.map((step) => (
                <Button
                  data-selected={activeTab === step.id}
                  data-complete={step.isComplete}
                  key={step.id}
                  w="full"
                  px={2}
                  py={2}
                  borderTop="2px"
                  rounded={0}
                  fontSize={14}
                  fontWeight={400}
                  lineHeight={5}
                  className="flex-1 justify-start bg-transparent gap-2 hover:bg-transparent cursor-default hover:cursor-default data-[selected=true]:border-primary-400 data-[selected=true]:text-primary-400 border-secondary-300 data-[complete=true]:text-primary-400 data-[complete=true]:border-primary-400 text-center"
                >
                  {step.isComplete ? (
                    <TickCircle variant="Bold" size={16} />
                  ) : (
                    <MoreCircle size={16} />
                  )}
                  <Text whiteSpace="nowrap" color="black">
                    {t(step.title)}
                  </Text>
                </Button>
              ))}
            </HStack>
          </DrawerHeader>

          <Formik
            initialValues={initialValues}
            onSubmit={handleOnSubmit}
            validationSchema={NewMenuItemSchema}
          >
            {({ isSubmitting, submitForm, errors }) => (
              <Form className="flex flex-col flex-1 overflow-y-auto">
                <DrawerBody className="space-y-4 p-0 h-[calc(100vh-80px)] @md:h-[calc(100vh-150px)] overflow-y-auto">
                  <div className="flex flex-col">
                    {activeTab === 'information' &&
                      fieldItems.map((group) => (
                        <Box
                          key={group.heading}
                          p={6}
                          gap={4}
                          className="flex flex-col border-b border-black/[6%] last:border-0"
                        >
                          <h2 className="border-b border-black/5 pb-4 text-secondary-900 text-xl font-medium">
                            {t(group.heading)}
                          </h2>

                          {group.fields.map((field) => (
                            <MenuItemFormFieldRenderer key={field.name} {...field} />
                          ))}
                        </Box>
                      ))}

                    {activeTab === 'add-ons' && (
                      <Flex flexDir="column">
                        <Box
                          p={6}
                          gap={4}
                          className="flex flex-col border-b border-black/[6%] last:border-0"
                        >
                          <h2 className="border-b border-black/5 pb-4 text-secondary-900 text-xl font-medium">
                            {t('Variant')}
                          </h2>
                          <MenuItemFormFieldRenderer name="variantIds" type="tag-variants" />
                        </Box>

                        <Box
                          p={6}
                          gap={4}
                          className="flex flex-col border-b border-black/[6%] last:border-0"
                        >
                          <h2 className="border-b border-black/5 pb-4 text-secondary-900 text-xl font-medium">
                            {t('Addon')}
                          </h2>
                          <MenuItemFormFieldRenderer name="addonIds" type="tag-addons" />
                        </Box>
                      </Flex>
                    )}
                  </div>
                </DrawerBody>
                <DrawerFooter
                  borderTopWidth="1px"
                  borderColor="secondary.200"
                  className="bg-white w-full bottom-0"
                >
                  {activeTab === 'information' ? (
                    <>
                      <Button type="button" variant="outline" w="full" mr={3} onClick={onClose}>
                        {t('Cancel')}
                      </Button>
                      <Button
                        variant="solid"
                        colorScheme="primary"
                        w="full"
                        type="button"
                        onClick={() => {
                          setActiveTab('add-ons');
                          setSteps((s) =>
                            s.map((v) => (v.id === 'information' ? { ...v, isComplete: true } : v))
                          );
                        }}
                        className="bg-primary-400 font-semibold hover:bg-primary-500 bg-transition"
                        rightIcon={<ArrowRight size={16} color="currentColor" />}
                      >
                        {t('Next')}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        w="full"
                        mr={3}
                        onClick={() => setActiveTab('information')}
                        leftIcon={<ArrowLeft size={16} color="currentColor" />}
                      >
                        {t('Back')}
                      </Button>
                      <Button
                        variant="solid"
                        colorScheme="primary"
                        w="full"
                        type="button"
                        isLoading={isSubmitting}
                        disabled={isSubmitting}
                        className="bg-primary-400 font-semibold hover:bg-primary-500 bg-transition"
                        rightIcon={<Add size={16} color="currentColor" />}
                        onClick={() => {
                          if (Object.keys(errors).length) {
                            toast.error(t('Please fill all the fields'));
                          }
                          submitForm();
                        }}
                      >
                        {t('Create')}
                      </Button>
                    </>
                  )}
                </DrawerFooter>
              </Form>
            )}
          </Formik>
        </DrawerContent>
      </Drawer>
    </>
  );
}
