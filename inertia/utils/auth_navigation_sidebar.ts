import {
  Add,
  Box,
  Chart,
  Clock,
  Diagram,
  Home2,
  Icon,
  LanguageSquare,
  Location,
  Mask,
  MenuBoard,
  Personalcard,
  Profile2User,
  ReceiptDisscount,
  Setting2,
  Setting4,
  SmsStar,
  Task,
  UserOctagon,
  BoxTick,
} from 'iconsax-react';
import { ROLE } from './platform_roles';

type SidebarItem = {
  id: string;
  key: string;
  title: string;
  href?: string;
  leftIcon: Icon;
  rightIcon?: Icon;
  isActive: (currentPath: string) => boolean;
  className?: string;
  role: number[];
  subItems?: {
    id: string;
    key: string;
    title: string;
    href: string;
  }[];
};

export const AUTH_SIDEBAR: {
  id: string;
  groupTitle: string;
  items: SidebarItem[];
}[] = [
    // Dashboard, POS, and Reservation
    {
      id: '21f89c8b-9b75-43fd-98da-21d42759b64f',
      groupTitle: '',
      items: [
        {
          id: '7878ac55-123e-4657-a30a-b6c40ee54ae4',
          key: 'dashboard',
          title: 'Dashboard',
          href: '/dashboard',
          leftIcon: Home2,
          isActive: (currentPath: string) => currentPath === 'dashboard' || currentPath === '',
          className:
            'border border-dashed border-secondary-800 bg-transparent text-secondary-800 hover:bg-secondary-800 hover:text-white data-[menu-active=true]:bg-secondary-800 data-[menu-active=true]:text-white',
          role: [ROLE.ADMIN, ROLE.MANAGER],
        },
      ],
    },

    // order management
    {
      id: 'ca75cba5-cbe1-42cd-a600-f1186269dcdd',
      groupTitle: 'Order management',
      items: [
        {
          id: '3a4ae8f6-56a2-4386-8b14-24b27356f303',
          key: 'pos',
          title: 'Create new order',
          href: '/pos',
          leftIcon: Add,
          isActive: (currentPath: string) => currentPath === 'pos',
          role: [ROLE.ADMIN, ROLE.MANAGER, ROLE.POS, ROLE.KITCHEN],
        },
        {
          id: 'e4272e5e-9aae-412d-a7b8-45237d5a795c',
          key: 'order-status',
          title: 'Orders',
          href: '/order-status/all-orders',
          leftIcon: Box,
          isActive: (currentPath: string) => currentPath === 'order-status',
          role: [ROLE.ADMIN, ROLE.MANAGER, ROLE.POS],
        },
        {
          id: '029de673-6702-49de-9433-b6a9e92a9d02',
          key: 'order-history',
          title: 'Order history',
          leftIcon: Clock,
          href: '/order-history',
          isActive: (currentPath: string) => currentPath === 'order-history',
          role: [ROLE.ADMIN, ROLE.MANAGER, ROLE.POS],
        },
      ],
    },

    // Menu management
    {
      id: '8286adc5-dfc0-4468-8135-380f987e08d2',
      groupTitle: 'Menu management',
      items: [
        {
          id: '26c7db50-af48-4a63-8dd0-913ab3b3283a',
          key: 'menu-items',
          title: 'Menu items',
          href: '/menu-items',
          leftIcon: MenuBoard,
          isActive: (currentPath: string) => currentPath === 'menu-items',
          role: [ROLE.ADMIN, ROLE.MANAGER],
        },
        {
          id: '16284ffb-6061-41ce-8957-6b529fb1b53c',
          key: 'addon-items',
          title: 'Add-on items',
          href: '/addon-items',
          leftIcon: Mask,
          isActive: (currentPath: string) => currentPath === 'addon-items',
          role: [ROLE.ADMIN, ROLE.MANAGER],
        },
        {
          id: '8d63ec3f-f992-4b22-bf46-f0df22a60252',
          key: 'categories',
          title: 'Categories',
          href: '/categories',
          leftIcon: Task,
          isActive: (currentPath: string) => currentPath === 'categories',
          role: [ROLE.ADMIN, ROLE.MANAGER],
        },
        {
          id: 'ca0ebdb0-e7c8-4907-8bba-c5cfc63b9e84',
          key: 'tax-and-charges',
          title: 'Tax and charges',
          href: '/tax-and-charges',
          leftIcon: ReceiptDisscount,
          isActive: (currentPath: string) => currentPath === 'tax-and-charges',
          role: [ROLE.ADMIN, ROLE.MANAGER],
        },
        {
          id: 'f8a3b2c1-d4e5-4f6a-8b9c-0d1e2f3a4b5c',
          key: 'stock-inventory',
          title: 'Stock and Inventory',
          href: '/stock-inventory',
          leftIcon: BoxTick,
          isActive: (currentPath: string) => currentPath === 'stock-inventory',
          role: [ROLE.ADMIN, ROLE.MANAGER],
        },
      ],
    },

    // Promotions
    {
      id: 'b5d36312-d872-4edc-a04e-5ae22e259154',
      groupTitle: 'Promotions',
      items: [
        {
          id: '365b6611-2e15-40a8-8ab5-cd909f1b8ef5',
          key: 'promotions',
          title: 'Promotions',
          href: '/promotions',
          leftIcon: SmsStar,
          isActive: (currentPath: string) => currentPath === 'promotions',
          role: [ROLE.ADMIN, ROLE.MANAGER],
        },
      ],
    },

    // Report and analysis
    {
      id: '84567b4e-a0fe-4316-98e7-02bf9f423f36',
      groupTitle: 'Report and analysis',
      items: [
        {
          id: '365b6611-2e15-40a8-8ab5-cd909f1b8ef5',
          key: 'earning-report',
          title: 'Earning report',
          href: '/earning-report',
          leftIcon: Chart,
          isActive: (currentPath: string) => currentPath === 'earning-report',
          role: [ROLE.ADMIN, ROLE.MANAGER],
        },
        {
          id: '21e236ae-61f2-46e5-aaee-43156f57d359',
          key: 'order-report',
          title: 'Order report',
          href: '/order-report',
          leftIcon: Diagram,
          isActive: (currentPath: string) => currentPath === 'order-report',
          role: [ROLE.ADMIN, ROLE.MANAGER],
        },
      ],
    },

    // User management
    {
      id: '95a79762-4e9c-4363-975c-1abb759cf37d',
      groupTitle: 'User management',
      items: [
        {
          id: '4e461862-3296-4f94-8090-ef563fa6b90b',
          key: 'customers',
          title: 'Clients',
          href: '/customers',
          leftIcon: Profile2User,
          isActive: (currentPath: string) => currentPath === 'customers',
          role: [ROLE.ADMIN, ROLE.MANAGER],
        },

        {
          id: '49382a59-a27a-42e6-b058-cf05614a53d8',
          key: 'delivery-person',
          title: 'Caterer',
          href: '/delivery-person',
          leftIcon: UserOctagon,
          isActive: (currentPath: string) => currentPath === 'delivery-person',
          role: [ROLE.ADMIN, ROLE.MANAGER],
        },
        {
          id: 'a7d23ce4-e838-4384-ab8f-a548c78e3d21',
          key: 'employees',
          href: '/employees',
          title: 'Employees',
          leftIcon: Personalcard,
          isActive: (currentPath: string) => currentPath === 'employees',
          role: [ROLE.ADMIN, ROLE.MANAGER],
        },
      ],
    },

    // Airports
    {
      id: '95a79762-4e9c-4364-975d-1abb759cf37d',
      groupTitle: 'Airports',
      items: [
        {
          id: '4e461862-32a6-af94-8190-ef563fa6b90b',
          key: 'airports',
          title: 'Airports',
          href: '/airports',
          leftIcon: Location,
          isActive: (currentPath: string) => currentPath === 'airports',
          role: [ROLE.ADMIN, ROLE.MANAGER],
        },
      ],
    },

    // System
    {
      id: '4557596d-740c-4490-8943-b1b25f474d8e',
      groupTitle: 'System',
      items: [
        {
          id: 'f41cfd57-b651-43da-a2e1-2fa93a460643',
          key: 'languages',
          title: 'Languages',
          href: '/languages',
          leftIcon: LanguageSquare,
          isActive: (currentPath: string) => currentPath === 'languages',
          role: [ROLE.ADMIN],
        },
        {
          id: 'de2d5559-c10f-41f0-ba01-02870d066dde',
          key: 'payment-methods',
          title: 'Payment Methods',
          href: '/payment-methods',
          leftIcon: Setting4,
          isActive: (currentPath: string) => currentPath === 'payment-methods',
          role: [ROLE.ADMIN],
        },
        {
          id: 'afeabe34-6fc3-437c-8142-013dd1d34f8d',
          key: 'settings',
          title: 'Settings',
          href: '/settings',
          leftIcon: Setting2,
          isActive: (currentPath: string) => currentPath === 'settings',
          role: [ROLE.ADMIN],
        },
      ],
    },
  ];

export class AuthNavigationSidebar {
  getSidebar(role: number) {
    return AUTH_SIDEBAR.map((group) => {
      const items = group.items.filter((item) => item.role.includes(role));
      return items.length > 0 ? { ...group, items } : null;
    }).filter((group): group is NonNullable<typeof group> => group !== null);
  }
}
