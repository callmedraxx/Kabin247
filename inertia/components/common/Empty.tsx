import { useTranslation } from 'react-i18next';

const image = {
  default: '/DataEmpty.svg',
  bagEmpty: '/BagEmpty.svg',
};

export default function Empty({
  message = 'No data found!',
  type = 'default',
}: {
  message?: string;
  type?: keyof typeof image;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col justify-center items-center gap-4 w-full h-auto py-6">
      <img src={image[type]} alt="Data Empty" className="w-24" />
      {t(message)}
    </div>
  );
}
