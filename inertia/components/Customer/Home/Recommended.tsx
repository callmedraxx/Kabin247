import fetcher from '@/lib/fetcher';
import { BaseMenuItem } from '@/types/customer_type';
import { HStack, IconButton, Spinner } from '@chakra-ui/react';
import { ArrowLeft, ArrowRight } from 'iconsax-react';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';
import useSWR from 'swr';
import ProductItem from './ProductItem';

export default function Recommended() {
  const { t } = useTranslation();
  const sliderRef = useRef<SwiperRef | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const { data, error, isLoading } = useSWR(
    '/api/user/menu-items/global?recommended=true',
    fetcher
  );

  const handlePrev = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slideNext();
  }, []);

  const handleSlideChange = useCallback(() => {
    if (!sliderRef.current) return;
    setIsBeginning(sliderRef.current.swiper.isBeginning);
    setIsEnd(sliderRef.current.swiper.isEnd);
  }, []);

  // loading
  if (isLoading) {
    return (
      <div className="py-10 container">
        <HStack className="justify-center">
          <Spinner />
        </HStack>
      </div>
    );
  }

  if (error || data?.length === 0) return null;

  return (
    <div className="py-10">
      <div className="container relative">
        <div className="flex justify-between items-center">
          <h3 className="text-xl sm:text-2xl p-6">{t('Recommended for you')}</h3>
          <div className="flex items-center gap-2">
            <IconButton
              aria-label={t('left arrow')}
              onClick={handlePrev}
              isDisabled={isBeginning}
              className="rounded-full sm:min-w-14 sm:min-h-14 bg-primary-400 hover:bg-primary-500 text-white disabled:hover:bg-primary-400 sm:hidden"
            >
              <ArrowLeft />
            </IconButton>

            <IconButton
              aria-label={t('right arrow')}
              onClick={handleNext}
              isDisabled={isEnd}
              className="rounded-full sm:min-w-14 sm:min-h-14 bg-primary-400 hover:bg-primary-500 text-white disabled:hover:bg-primary-400 sm:hidden"
            >
              <ArrowRight />
            </IconButton>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <IconButton
            aria-label={'left arrow'}
            onClick={handlePrev}
            isDisabled={isBeginning}
            className="rounded-full sm:min-w-14 sm:min-h-14 bg-primary-400 hover:bg-primary-500 text-white disabled:hover:bg-primary-400 absolute sm:relative right-16 top-5 sm:right-auto sm:top-auto"
          >
            <ArrowLeft />
          </IconButton>
          <Swiper
            slidesPerView={1}
            spaceBetween={4}
            ref={sliderRef}
            onSlideChange={handleSlideChange}
            breakpoints={{
              384: {
                slidesPerView: data.length > 2 ? 2 : data.length,
              },
              640: {
                slidesPerView: data.length > 2 ? 2 : data.length,
              },
              992: {
                slidesPerView: data.length > 3 ? 3 : data.length,
              },
              1200: {
                slidesPerView: data.length > 4 ? 4 : data.length,
              },
            }}
          >
            {data?.map((item: BaseMenuItem) => (
              <SwiperSlide className="max-w-72 w-full" key={item.id}>
                <ProductItem {...item} />
              </SwiperSlide>
            ))}
          </Swiper>
          <IconButton
            aria-label={'right arrow'}
            onClick={handleNext}
            isDisabled={isEnd}
            className="rounded-full sm:min-w-14 sm:min-h-14 bg-primary-400 hover:bg-primary-500 text-white disabled:hover:bg-primary-400 absolute sm:relative right-4 top-5 sm:right-auto sm:top-auto"
          >
            <ArrowRight />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
