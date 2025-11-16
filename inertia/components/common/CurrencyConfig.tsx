import { BrandingDataType } from '@/types';
import { useEffect } from 'react';

interface CurrencyConfigProps {
  branding?: BrandingDataType;
}

const CurrencyConfig = ({ branding }: CurrencyConfigProps) => {
  // The currency configuration object with default values
  const currency = {
    code: branding?.business?.currencyCode || 'USD',
    symbolPosition: branding?.business?.currencySymbolPosition || 'left',
  };

  // Set window.currency only once
  useEffect(() => {
    localStorage.setItem('currency', JSON.stringify(currency));
  }, [currency]);

  return null;
};

export default CurrencyConfig;
