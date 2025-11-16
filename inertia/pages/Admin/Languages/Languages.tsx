import axios from 'axios';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/common/Layout';
import { FieldArray, Form, Formik } from 'formik';
import { toast } from 'sonner';
import { Box, Button, IconButton, Input } from '@chakra-ui/react';
import { Add, Edit2, Trash } from 'iconsax-react';

interface Language {
  name: string;
  code: string;
}

interface LanguagesProps {
  langs: string;
}

export default function Languages({ langs }: LanguagesProps) {
  const { t } = useTranslation();
  const lotSelector: Language[] = JSON.parse(langs);

  return (
    <Layout title="Manage languages">
      <div className="p-6 w-full max-w-[800px]">
        <Formik
          initialValues={{
            lotSelector,
          }}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              setSubmitting(true);
              await axios.post('/admin/languages', values);
              toast.success(t('Language updated successfully'));
            } catch (error) {
              toast.error(t(error.response.data.message) || t('Something went wrong'));
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, handleChange, isSubmitting }) => (
            <Form className="flex flex-col gap-4">
              <Box
                rounded="6px"
                className="p-6 py-4 bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.06),0px_1px_3px_0px_rgba(0,0,0,0.1)]"
              >
                <FieldArray
                  name="lotSelector"
                  render={(arrayHelpers) => (
                    <div>
                      {values.lotSelector.map((_lots, index) => (
                        <div key={index} className="flex gap-5 mb-3">
                          <Input
                            type="text"
                            placeholder={t('Enter language name')}
                            className="bg-white"
                            name={`lotSelector.${index}.name`}
                            onChange={handleChange}
                            value={values?.lotSelector[index]?.name}
                          />
                          <Input
                            type="text"
                            placeholder={t('Enter language code')}
                            className="bg-white"
                            name={`lotSelector.${index}.code`}
                            onChange={handleChange}
                            value={values?.lotSelector[index]?.code}
                          />
                          <div className="flex gap-2">
                            <IconButton
                              aria-label="Edit"
                              colorScheme="blue"
                              className="hover:bg-blue-100"
                              variant="outline"
                              icon={<Edit2 />}
                              onClick={() =>
                                (window.location.href =
                                  '/admin/languages/' + values?.lotSelector[index]?.code)
                              }
                            />
                            <IconButton
                              variant="outline"
                              colorScheme="red"
                              aria-label="Minus"
                              icon={<Trash />}
                              onClick={() => arrayHelpers.remove(index)}
                            />
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        colorScheme="primary"
                        className="border-primary-500 text-primary-500"
                        onClick={() => arrayHelpers.push({ name: '', code: '' })}
                      >
                        {t('Add New language')}
                        <Add className="text-xl" />
                      </Button>
                    </div>
                  )}
                />
              </Box>
              <Button
                variant="solid"
                colorScheme="primary"
                className="bg-primary-400 hover:bg-primary-500"
                type="submit"
                isDisabled={isSubmitting}
                isLoading={isSubmitting}
              >
                {t('Save')}
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </Layout>
  );
}
