import { useField } from 'formik';
import {
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  FormErrorMessage,
  Switch,
  Button,
  RadioGroup,
  Radio,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { useState } from 'react';
import { AddonCharges } from './AddonItems/AddonsCharges';
import ImageUpload from './Categories/ImageUpload';

const FieldRenderer = ({
  item,
  setFieldValue = () => {},
}: {
  item: {
    name: string;
    label?: string;
    type: string;
    placeholder?: string;
    options?: { name: string; label: string }[];
    preview?: string;
  };
  setFieldValue?: (name: string, value: any) => void;
}) => {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const [field, meta, helpers] = useField(item.name);

  return (
    <FormControl isInvalid={!!(meta.touched && meta.error)} className='overflow-y-scroll'>
      {item.label && item.type !== 'switch' && (
        <FormLabel className="text-sm text-secondary-500">{t(item.label)}</FormLabel>
      )}
      {match(item.type)
        .with('file', () => (
          <>
            <ImageUpload defaultValue={item.preview} onChange={(file) => helpers.setValue(file)} />
            <Text as="p" color="secondary.400" mt="18px">
              *{t('The image should be 64x64px in PNG/JPG format')}*
            </Text>
          </>
        ))
        .with('text', 'email', 'number', 'tel', () => (
          <Input {...field} type={item.type} placeholder={t(item.placeholder || '')} />
        ))

        .with('password', () => (
          <InputGroup size="md">
            <Input
              pr="4.5rem"
              {...field}
              type={show ? 'text' : 'password'}
              placeholder={t(item.placeholder || '')}
            />
            <InputRightElement width="4.5rem">
              <Button h="1.75rem" size="sm" onClick={() => setShow(!show)}>
                {show ? t('Hide') : t('Show')}
              </Button>
            </InputRightElement>
          </InputGroup>
        ))

        .with('switch', () => (
          <div className="flex items-center gap-3">
            {item.label && <span className="w-28 text-secondary-400">{t(item?.label)}</span>}
            <Switch
              onChange={(e) => setFieldValue(item.name, e.target.checked)}
              defaultChecked={field.value}
              colorScheme="green"
              size="lg"
            />
          </div>
        ))

        .with('radio', () => (
          <RadioGroup
            onChange={(value) => setFieldValue(item.name, value)}
            defaultValue={field.value}
          >
            <Stack direction="row" gap="2">
              {item.options?.map((option) => (
                <Radio key={option.name} colorScheme="green" value={option.name} borderColor="gray">
                  {t(option.label)}
                </Radio>
              ))}
            </Stack>
          </RadioGroup>
        ))

        // handle charges input
        .with('addon-charges', () => (
          <AddonCharges
            defaultValue={field.value}
            onSelect={(values: any) => {
              const ids = values?.map((v: any) => v.id) ?? [];
              helpers.setValue(ids);
            }}
          />
        ))
        .otherwise(() => null)}
      <FormErrorMessage>{t(meta.error || '')}</FormErrorMessage>
    </FormControl>
  );
};

export default FieldRenderer;
