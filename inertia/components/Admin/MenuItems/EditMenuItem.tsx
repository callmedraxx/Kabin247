import EditMenuItemSchema from '@/schemas/EditMenuItemSchema';
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
  IconButton,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import axios from 'axios';
import { Form, Formik } from 'formik';
import { ArrowLeft, ArrowRight, Edit2, MoreCircle, TickCircle } from 'iconsax-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import MenuItemFormFieldRenderer from './MenuItemFormFieldRenderer';
import { useTranslation } from 'react-i18next';
import useWindowSize from '@/hooks/useWindowSize';

const initSteps = [
  { id: 'information', title: 'Basic information and pricing', isComplete: true },
  { id: 'add-ons', title: 'Variation and add-ons', isComplete: true },
];

export default function EditMenuItem({
  isIconButton = false,
  editData,
  refresh,
}: {
  isIconButton?: boolean;
  editData: any;
  refresh: () => void;
}) {
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
          previewImage: editData?.image?.url ?? '',
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
      heading: 'Pricing',
      fields: [
        { name: 'price', label: '', type: 'number', placeholder: 'Enter regular price' },
        { name: 'discount', label: 'Discount', type: 'number', placeholder: 'Add discount' },
        {
          name: 'discountType',
          label: 'Discount type',
          type: 'radio-group',
          placeholder: '',
          options: [
            { label: 'Amount ($)', value: 'amount' },
            { label: 'Percentage (%)', value: 'percentage' },
          ],
        },
        {
          name: 'chargeIds',
          label: 'Add tax and charges',
          type: 'tag-charges',
          placeholder: 'Search or add',
        },
      ],
    },
  ];

  // handle form submit
  const handleOnSubmit = async (values: any, actions: any) => {
    try {
      actions.setSubmitting(true);

      const formData = new FormData();
      for (const key in values) {
        if (Array.isArray(values[key])) {
          if (values[key].length == 0) {
            formData.append(`${key}[]`, '');
          }
          values[key].forEach((item) => formData.append(`${key}[]`, item ?? ''));
        } else {
          formData.append(key, values[key]);
        }
      }

      const { data } = await axios.put(
        `/api/menu-items/${editData?.id}`,
        values.image ? formData : values,
        {
          headers: { ...(values.image && { 'Content-Type': 'multipart/form-data' }) },
        }
      );

      // Handle success
      if (data?.content?.id) {
        refresh();
        toast.success(t('Menu item updated successfully'));
        actions.resetForm();
        setActiveTab('information');
        setSteps(initSteps);
      }
    } catch (e) {
      toast.error(t(e.response.data.message) || t('Something went wrong'));
    } finally {
      actions.setSubmitting(false);
    }
  };

  // format initial values
  const getInitialValues = (prevData: any) => {
    return {
      name: prevData?.name ?? '',
      description: prevData?.description ?? '',
      categoryId: prevData?.categoryId ?? '',
      foodType: prevData?.foodType ?? '',
      price: prevData?.price ?? '',
      discount: prevData?.discount ?? '',
      priority: 1, // NOTE: this data is static here...
      discountType: prevData?.discountType ?? '',
      isAvailable: Boolean(prevData?.isAvailable),
      image: '',
      chargeIds: prevData?.charges?.map((charge: any) => charge.id) ?? [],
      addonIds: prevData?.addons?.map((addon: any) => addon.id) ?? [],
      variantIds: prevData?.variants?.map((variant: any) => variant.id) ?? [],
    };
  };

  return (
    <>
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
          w="full"
          variant="outline"
          onClick={onOpen}
        >
          {t('Edit')}
        </Button>
      )}

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
        <DrawerContent className="h-[80%] sm:h-auto rounded-t-xl sm:rounded-t-none">
          <DrawerHeader className="border-b border-black/5 hidden @md:block">
            <HStack gap={0}>
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
                  className="justify-start bg-transparent gap-2 hover:bg-transparent cursor-default hover:cursor-default data-[selected=true]:border-primary-400 data-[selected=true]:text-primary-400 border-secondary-300 data-[complete=true]:text-primary-400 data-[complete=true]:border-primary-400 text-center"
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
            initialValues={{ ...getInitialValues(editData) }}
            onSubmit={handleOnSubmit}
            validationSchema={EditMenuItemSchema}
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
                            s.map((v) =>
                              v.id === 'information'
                                ? {
                                    ...v,
                                    isComplete: true,
                                  }
                                : v
                            )
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
                        colorScheme="blue"
                        w="full"
                        type="button"
                        isLoading={isSubmitting}
                        disabled={isSubmitting}
                        onClick={() => {
                          if (Object.keys(errors).length) {
                            toast.error(t('Please fill all the fields'));
                          } else {
                            submitForm();
                          }
                        }}
                      >
                        {t('Update')}
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
