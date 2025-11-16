import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <>
      <div className="container">
        <div className="title">{t('Page not found')}</div>
        <span>{t('This page does not exist.')}</span>
      </div>
    </>
  );
}
