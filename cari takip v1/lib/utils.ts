/**
 * Para birimini formatlar (1000 -> 1.000,00 ₺)
 * @param amount Formatlanacak tutar
 * @returns Formatlanmış tutar
 */
export const formatCurrency = (amount: number): string => {
  // Sayıyı formatlama
  const formatter = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount) + ' ₺';
}; 