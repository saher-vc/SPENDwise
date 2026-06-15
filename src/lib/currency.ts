export const currencies = [
  { code: 'PKR', symbol: 'Rs', name: 'Pakistani Rupee', flag: '🇵🇰' },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', flag: '🇸🇦' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
];

export function getCurrencySymbol(code: string): string {
  return currencies.find(c => c.code === code)?.symbol ?? 'Rs';
}

export function formatCurrency(amount: number, currencyCode: string = 'PKR'): string {
  const symbol = getCurrencySymbol(currencyCode);
  const formatted = Math.round(amount).toLocaleString();
  return `${symbol} ${formatted}`;
}

// Keep old function working so nothing breaks
export function formatPKR(amount: number): string {
  return `Rs ${Math.round(amount).toLocaleString()}`;
}