type CurrencyOptions = Intl.NumberFormatOptions & {
  currency?: string;
  locale?: string;
  symbolOnly?: boolean;
};

export const convertToCurrencyFormat = (amount: number, opts: CurrencyOptions = {}): string => {
  // Check if the amount is valid and not NaN
  if (Number.isNaN(amount)) {
    throw new Error('Invalid amount: NaN');
  }

  // If amount is 0 or falsy, set it to 0 for formatting purposes
  if (!amount) {
    amount = 0;
  }

  // get currency from localStorage
  const currency = localStorage.getItem('currency');
  let currencySymbolPosition = 'left';
  if (currency) {
    const { code, symbolPosition } = JSON.parse(currency);
    // set currency code
    opts.currency = opts.currency || code;
    // set currency symbol position
    currencySymbolPosition = symbolPosition;
  }

  const locale = opts.locale || 'en-US';
  // Default to USD if no currency is specified in options
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: opts.currency || 'USD',
    currencyDisplay: 'narrowSymbol',
    currencySign: 'standard',
    minimumFractionDigits: 2,
    ...opts,
  });

  // If symbolOnly is true, return only the currency symbol
  if (opts.symbolOnly) {
    const parts = formatter.formatToParts(amount);
    const symbol = parts.find((part) => part.type === 'currency')?.value ?? '';
    return symbol;
  }

  let formattedAmount = formatter.format(amount);

  // Adjust currency symbol position based on the symbolPosition option
  if (currencySymbolPosition === 'right') {
    const parts = formatter.formatToParts(amount);
    const symbol = parts.find((part) => part.type === 'currency')?.value ?? '';
    const amountText = formattedAmount.substring(symbol.length).trim();

    formattedAmount = `${amountText}${symbol}`;
  }

  return formattedAmount;
};
