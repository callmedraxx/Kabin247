import { BaseCategory } from '@/types/customer_type';
import { IconButton, Text } from '@chakra-ui/react';
import { router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'iconsax-react';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FreeMode } from 'swiper/modules';
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';

export default function Categories({ data }: any) {
  const { t } = useTranslation();
  const sliderRef = useRef<SwiperRef | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

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

  if (!data.length) return null;

  return (
    <div className="container py-4 flex items-center gap-4">
      <IconButton
        aria-label="left arrow"
        onClick={handlePrev}
        isDisabled={isBeginning}
        className="rounded-full sm:min-w-14 sm:min-h-14 bg-primary-400 hover:bg-primary-500 text-white disabled:hover:bg-primary-400"
      >
        <ArrowLeft />
      </IconButton>
      <Swiper
        slidesPerView={data.length > 1 ? 1 : data.length}
        spaceBetween={10}
        loop={data.length > 1}
        ref={sliderRef}
        modules={[FreeMode]}
        onSlideChange={handleSlideChange}
        breakpoints={{
          458: {
            slidesPerView: data.length > 2 ? 2 : data.length,
            spaceBetween: 16,
          },
          640: {
            slidesPerView: data.length > 3 ? 3 : data.length,
            spaceBetween: 16,
          },
          768: {
            slidesPerView: data.length > 4 ? 4 : data.length,
            spaceBetween: 16,
          },
          1024: {
            slidesPerView: data.length > 8 ? 8 : data.length,
            spaceBetween: 24,
          },
        }}
      >
        {data?.map((item: BaseCategory) => (
          <SwiperSlide key={item?.id} className="max-w-[130px]">
            <button
              className="group flex flex-col items-center gap-3 hover:no-underline max-w-28 w-full h-full p-3 select-none cursor-pointer"
              onClick={() => router.visit(`/foods/${item.name.toLowerCase()}/${item?.id}`)}
            >
              <div className="w-[100px] h-[100px] rounded-full relative group-data-[active=true]:ring-2 ring-primary-500 ring-offset-4">
                <img
                  src={item?.image?.url}
                  alt={item?.name}
                  width="100px"
                  height="100px"
                  className="rounded-full w-[100px] h-[100px] object-cover"
                  onError={(e) => (e.currentTarget.src = '/default_fallback.png')}
                />
              </div>
              <Text
                as="p"
                className="font-medium no-underline group-data-[active=true]:text-primary-500 text-center"
              >
                {t(item?.name)}
              </Text>
            </button>
          </SwiperSlide>
        ))}
      </Swiper>
      <IconButton
        aria-label="right arrow"
        onClick={handleNext}
        isDisabled={isEnd}
        className="rounded-full sm:min-w-14 sm:min-h-14 bg-primary-400 hover:bg-primary-500 text-white disabled:hover:bg-primary-400"
      >
        <ArrowRight />
      </IconButton>
    </div>
  );
}
