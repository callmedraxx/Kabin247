import { v4 as uuidV4 } from 'uuid';
import fetcher from '@/lib/fetcher';
import { Box, Button, Flex, HStack, Spinner } from '@chakra-ui/react';
import axios from 'axios';
import { Add } from 'iconsax-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import useSWR from 'swr';
import FileUpload from '../FileUpload';

export default function Slider() {
  const { t } = useTranslation();
  const [isUpdating, setIsUpdating] = useState(false);
  const [sliders, setSliders] = useState<
    { uuid: string; id?: number; image: File | undefined; preview?: string }[]
  >([{ uuid: 'b6ff05cb-c21c-4cbe-9158-8653518dd171', id: undefined, image: undefined }]);

  const { data, isLoading } = useSWR('/api/promotions/slider', fetcher, {
    revalidateOnFocus: false,
  });

  // update local sliders state by existing data.
  const updateLocalState = useCallback(() => {
    setSliders(
      data?.content.map((slider: any) => ({
        id: slider.id,
        uuid: uuidV4(),
        image: undefined,
        preview: slider?.sliderImage?.url,
      }))
    );
  }, [data]);

  // update local sliders state by existing data.
  useEffect(() => {
    if (!data) return;
    updateLocalState();
  }, [updateLocalState]);

  // update
  const onUpdate = async () => {
    setIsUpdating(true);
    try {
      const fd = new FormData();

      // Append each slider to the FormData object
      sliders.forEach((slider, index) => {
        fd.append(`slider[${index}][id]`, String(slider.id || ''));
        fd.append(`slider[${index}][image]`, slider.image || '');
      });

      // Send the FormData via Axios
      const { data } = await axios.put('/api/promotions/slider', fd, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (data?.content) {
        toast.success(t('Slider updated successfully'));
      }
    } catch (error) {
      if (error?.response?.data?.messages?.[0]) {
        toast.error(t(error.response.data.messages[0].message));
      } else {
        toast.error(t('Something went wrong'));
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Show loading state.
  if (isLoading)
    return (
      <div>
        <Spinner />
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sliders.map((slider, index) => (
        <Flex
          key={slider.uuid}
          className="col-span-1 flex flex-col space-y-2 p-6 bg-white rounded-md shadow-[0px_1px_2px_0px_rgba(0,0,0,0.06),0px_1px_3px_0px_rgba(0,0,0,0.1)]"
        >
          <HStack justify="space-between">
            <label>
              {t('Image ')}
              {index + 1}
            </label>
            {index > 0 && (
              <Button
                variant="link"
                colorScheme="red"
                className="text-red-500 font-semibold pr-3"
                onClick={() => {
                  setSliders((p) => p.filter((s) => s.uuid !== slider.uuid));
                }}
              >
                {t('Remove')}
              </Button>
            )}
          </HStack>
          <div className="[&>div]:h-[182px]">
            <FileUpload
              defaultValue={slider.preview || ''}
              onChange={(file) => {
                setSliders((p) =>
                  p.map((s) => (s.uuid === slider.uuid ? { ...s, image: file } : s))
                );
              }}
            />
          </div>
        </Flex>
      ))}

      <Box className="sm:absolute top-0 right-4">
        <HStack className="gap-4">
          <Button
            variant="outline"
            colorScheme="primary"
            className="border-primary-500 text-primary-500"
            onClick={() => {
              setSliders([
                ...sliders,
                {
                  uuid: uuidV4(),
                  id: undefined,
                  image: undefined,
                },
              ]);
            }}
          >
            {t('Add new slide')}
            <Add />
          </Button>

          <Button
            onClick={onUpdate}
            colorScheme="primary"
            className="bg-primary-400 hover:bg-primary-500"
            isLoading={isUpdating}
          >
            {t('Update')}
          </Button>
        </HStack>
      </Box>
    </div>
  );
}
