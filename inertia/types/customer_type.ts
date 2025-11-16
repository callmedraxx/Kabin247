type RoleType = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type BaseUserType = {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  email: string;
  secondEmail?: string;
  phoneNumber: string;
  secondPhoneNumber?: string;
  address: string;
  clientAddress?: string;
  airport: any;
  roleId: number;
  isEmailVerified: number;
  isSuspended: number;
  createdAt: string;
  updatedAt: string;
};

export type CustomerType = BaseUserType;

export type UserType = BaseUserType & {
  role: RoleType;
};

// menu item data type
export interface BaseMenuItem extends Record<string, any> {
  id: number;
  name: string;
  description: string;
  image: Record<string, any> & { url: string };
  price: number;
  discount: number;
  discountType: 'percentage' | 'amount';
  foodType: 'veg' | 'nonVeg';
}

// Category base type
export interface BaseCategory extends Record<string, any> {
  id: number;
  name: string;
  priority: number;
  isAvailable: number;
  image: Record<string, any> & {
    url: string;
  };
}
