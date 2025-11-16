import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, EffectCube } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-cube';

export default function Banner({ data }: any) {
  if (!data?.content?.length) return null;

  return (
    <div className="relative container pt-8 pb-4 flex justify-center mb-10 z-0">
      <Swiper
        effect="cube"
        grabCursor={true}
        cubeEffect={{
          shadow: true,
          slideShadows: true,
          shadowOffset: 30,
          shadowScale: 1,
        }}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        pagination={{
          el: '.swiper-pagination',
          clickable: true,
        }}
        loop={data.length > 1}
        speed={1200}
        modules={[Pagination, Autoplay, EffectCube]}
        className="w-full max-w-7xl"
      >
        {data.content.map(
          (slider: { id: string; sliderImage: { url: string } }) =>
            slider.sliderImage?.url && (
              <SwiperSlide
                key={slider.id}
                className="w-full h-[720px] relative aspect-[4/1] rounded-2xl overflow-hidden"
              >
                <img
                  src={slider.sliderImage.url}
                  alt={slider.id}
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.src = '/banner_fallback.png')}
                />
              </SwiperSlide>
            )
        )}
      </Swiper>
      <div className="swiper-pagination" />
    </div>
  );
}
