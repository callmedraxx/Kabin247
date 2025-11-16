import { ChargeType } from './charge_type';

export type AddonType = {
  id: number;
  name: string;
  price: number;
  discount: number;
  discountType: string;
  isAvailable: number;
  createdAt: string;
  updatedAt: string;
  charges: ChargeType[];
  image?: Record<string, any> & {
    url: string;
  };
};
