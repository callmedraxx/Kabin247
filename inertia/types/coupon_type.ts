export type CouponType = {
  id: number;
  name: string;
  code: string;
  type: string;
  discountType: string;
  discount: number;
  maxUsage: number;
  minPurchase: number;
  maxDiscount: number;
  usageCount: number;
  costUsed: number;
  validFrom: string;
  validUntil: string;
  isAvailable: number;
  createdAt: string;
  updatedAt: string;
};
