function convertStripeCurrency(currencyCode: string, amount: number): number {
  const zeroDecimalCurrencies = [
    'BIF',
    'CLP',
    'DJF',
    'GNF',
    'JPY',
    'KMF',
    'KRW',
    'MGA',
    'PYG',
    'RWF',
    'UGX',
    'VND',
    'VUV',
    'XAF',
    'XOF',
    'XPF',
  ];

  const threeDecimalCurrencies = ['BHD', 'JOD', 'KWD', 'OMR', 'TND'];

  const specialCases: Record<string, (amount: number) => number> = {
    ISK: (amnt) => Math.ceil(amnt) * 100,
    HUF: (amnt) => {
      const intAmount = Math.ceil(amnt * 100);
      return intAmount + ((100 - (intAmount % 100)) % 100);
    },
    TWD: (amnt) => {
      const intAmount = Math.ceil(amnt * 100);
      return intAmount + ((100 - (intAmount % 100)) % 100);
    },
    UGX: (amnt) => Math.ceil(amnt) * 100,
  };

  if (currencyCode in specialCases) {
    return specialCases[currencyCode](amount);
  }

  if (zeroDecimalCurrencies.includes(currencyCode)) {
    return Math.ceil(amount);
  }

  if (threeDecimalCurrencies.includes(currencyCode)) {
    const scaledAmount = Math.ceil(amount * 1000);
    return scaledAmount + ((10 - (scaledAmount % 10)) % 10);
  }

  return Math.ceil(amount * 100);
}

export default convertStripeCurrency;
