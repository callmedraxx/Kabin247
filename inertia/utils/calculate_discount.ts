export const calculateDiscountedPrice = (
  price: number,
  discount: number,
  type: 'amount' | 'percentage'
) => {
  if (price <= 0) return 0;

  if (type === 'amount') {
    return price - discount;
  }
  return price - price * discount * 0.01;
};
