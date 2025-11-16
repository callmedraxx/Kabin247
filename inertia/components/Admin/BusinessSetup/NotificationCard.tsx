import { FormControl, FormErrorMessage, Switch } from '@chakra-ui/react';
import { Field } from 'formik';
import { Notification } from 'iconsax-react';
import { useTranslation } from 'react-i18next';

export default function NotificationCard() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2 p-6 bg-white rounded-md shadow-[0px_1px_2px_0px_rgba(0,0,0,0.06),0px_1px_3px_0px_rgba(0,0,0,0.1)]">
      <h6 className="flex flex-row items-center gap-2 font-medium text-sm text-secondary-800">
        <Notification />
        {t('Notification sound')}
      </h6>
      <p className="flex-1 font-normal text-sm text-secondary-400">
        {t(
          'By enabling this you’ll hear notification sounds for new orders and other notifications.'
        )}
      </p>

      <Field name="notificationSound">
        {({ field, meta, form }: any) => (
          <FormControl isInvalid={!!(meta.touched && meta.error)}>
            <Switch
              colorScheme="green"
              isChecked={field.value}
              onChange={(e) => form.setFieldValue('notificationSound', e.target.checked)}
            />
            <FormErrorMessage>{t(meta.error || '')}</FormErrorMessage>
          </FormControl>
        )}
      </Field>
    </div>
  );
}
