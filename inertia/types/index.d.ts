export type Image = Record<string, any> & {
  url: string;
};

export type User = {
  id: number;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  isSuspended: boolean;
  isVerified: boolean;
  phoneNumber: string;
  address: string;
  airport: { name: string; label: string };
  role: { id: number; name: string };
  roleId: number;
  notificationSound: boolean;
};

// App Config
export type BrandingDataType = {
  theme: { default: Recored<string, Record<string, string>> } | null;
  siteUrl: string;
  business: {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    country: string;
    timeZone: string;
    timeFormat: '12_format' | '24_format';
    maintenanceMode: number;
    dineIn: number;
    delivery: number;
    pickup: number;
    deliveryCharge: number;
    currencyCode: string;
    currencySymbolPosition: 'left' | 'right';
    guestCheckout: number;
    sortCategories: string;
    notificationSound: number;
    minimizedLogo: Image;
    logo: Image;
    favicon: Image;
    copyrightText: string;
    companySlogan: string;
    facebook: string;
    instagram: string;
    twitter: string;
    aboutUsImage: Image;
    aboutUsHeading: string;
    aboutUsDescription: string;
    contactUsImage: Image;
    termsAndConditions: string;
    privacyPolicy: string;
    returnPolicy: string;
  };
};

// PageProps interface for structured data
export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
  auth: User | null;
  branding: BrandingDataType;
  flash: {
    [key: string]: any;
  };
};
