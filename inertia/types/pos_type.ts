export type POSItemVariantOption = {
  id: number;
  variantId: number;
  name: string;
  price: number;
};

// POS item variant type
export type POSItemVariant = {
  id: number;
  name: string;
  price: number;
  option: POSItemVariantOption[];
};

// POS item addons type
export type POSItemAddon = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: Record<string, any> & {
    url?: string;
  };
};

// POS item charge
export type Charge = {
  id: number;
  type: string;
  name: string;
  amount: number;
  amountType: 'percentage' | 'amount';
  isAvailable: number;
};

//POS item type
export type POSItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: Record<string, any> & {
    url?: string;
  };
  discount: number;
  discountType: 'percentage' | 'amount';
  variants: POSItemVariant[];
  addons: POSItemAddon[];
  subTotal: number;
  quantity: number;
  total: number;
  charges?: Charge[];
};

export type Airport = {
  id: number;
  value: string;
  label: string;
};

//  Customer type
export type Customer =
  | (Record<string, any> & {
      firstName: string;
      lastName: string;
      fullName: string;
      id: number;
      email: string;
      phoneNumber: string;
      address: string;
    })
  | null;
