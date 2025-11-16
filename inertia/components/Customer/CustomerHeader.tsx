import { BrandingDataType, User } from '@/types';
import {
  Button,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Popover,
  PopoverAnchor,
  PopoverBody,
  PopoverContent,
  Text,
} from '@chakra-ui/react';
import { Link, router } from '@inertiajs/react';
import axios from 'axios';
import { HambergerMenu, SearchNormal } from 'iconsax-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import Cart from './Cart/Cart';
// import LangSwitcher from '../common/LangSwitcher';
import { useState } from 'react';
import { ROLE } from '@/utils/platform_roles';

export default function CustomerHeader({
  branding,
  user,
}: {
  branding: BrandingDataType;
  user: User;
}) {
  const { t } = useTranslation();
  const { role } = user || {};
  const [search, setSearch] = useState<string>(() => {
    const sp = new URLSearchParams(window?.location?.search);
    if (sp.get('q')) return sp.get('q') as string;
    return '';
  });
  const [showSuggestion, setShowSuggestion] = useState<boolean>(false);

  const handleLogout = async () => {
    try {
      const { data } = await axios.post('/api/auth/logout');
      if (data?.message === 'Logout successful') {
        router.visit('/login');
      }
    } catch (e) {
      toast.error(t('Failed to logout'));
    }
  };

  const handleDashboardUrl = () => {
    switch (role?.id) {
      case ROLE.ADMIN:
        return '/admin/dashboard';
      case ROLE.CUSTOMER:
        return '/user/my-orders';
      case ROLE.MANAGER:
        return '/manager/dashboard';
      case ROLE.POS:
        return '/pos/pos';
      case ROLE.DISPLAY:
        return '/display';
      case ROLE.KITCHEN:
        return '/kitchen';
      default:
        return '/user/my-profile';
    }
  };

  return (
    <header className="bg-white h-20 flex items-center border-b border-black/10 shadow-header z-[100] fixed top-0 w-full">
      <div className="container flex items-center justify-between gap-2">
        <div className="flex items-center gap-6">
          <Link href="/user/my-orders" className="h-16 min-w-32">
            <img
              src={branding?.business?.logo?.url || '/logo.png'}
              alt={branding?.business?.name || 'Logo'}
              className="h-full object-contain"
            />
          </Link>
          <>
            <form action="/foods/search">
              <Popover
                isOpen={showSuggestion}
                onOpen={() => setShowSuggestion(true)}
                onClose={() => setShowSuggestion(false)}
                autoFocus={false}
                matchWidth
              >
                <PopoverAnchor>
                  <InputGroup className="hidden md:flex">
                    <InputLeftElement className="size-12 text-secondary-500" pointerEvents="none">
                      <SearchNormal size={20} color="currentColor" />
                    </InputLeftElement>
                    <Input
                      rounded="full"
                      name="q"
                      type="search"
                      placeholder={t('Search')}
                      className="h-12 bg-white pl-12"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setShowSuggestion(true);
                      }}
                    />
                  </InputGroup>
                </PopoverAnchor>

                <PopoverContent className="w-auto">
                  <PopoverBody className="p-1">
                    <Button
                      type="submit"
                      variant="ghost"
                      className="font-normal w-full text-left justify-start"
                    >
                      <Text as="span" className="text-secondary-500 mr-1">
                        {t('Search')}:
                      </Text>
                      {search}
                    </Button>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </form>
          </>
        </div>

        <div className="flex items-center gap-2">
          <Cart />
          <div className="hidden md:flex items-center gap-2">
            {role?.name && (
              <>
                <Button
                  as={Link}
                  href={handleDashboardUrl()}
                  variant="outline"
                  colorScheme="secondary"
                  className="button-outline"
                >
                  {user?.fullName}
                </Button>
                <Menu placement="bottom-end">
                  <MenuButton
                    as={IconButton}
                    className="size-12 bg-transparent border border-secondary-200 rounded-full text-secondary-700"
                    icon={<HambergerMenu size="20" color="currentColor" />}
                  />
                  <MenuList className="p-1">
                    {role?.name === 'Customer' && (
                      <>
                        <MenuItem as={Link} href="/user/my-profile">
                          {t('My profile')}
                        </MenuItem>

                        <MenuItem as={Link} href="/user/my-orders">
                          {t('My orders')}
                        </MenuItem>
                      </>
                    )}
                    <MenuItem onClick={handleLogout}>{t('Logout')}</MenuItem>
                  </MenuList>
                </Menu>
              </>
            )}
            {!role?.name && (
              <>
                <Button
                  as={Link}
                  href="/login"
                  variant="solid"
                  colorScheme="primary"
                  className="button-primary"
                >
                  {t('Login')}
                </Button>
                {/* <Button
                  as={Link}
                  href="/signup"
                  variant="outline"
                  colorScheme="secondary"
                  className="button-outline"
                >
                  {t('Sign Up')}
                </Button> */}
              </>
            )}
            {/* <LangSwitcher isCustomer /> */}
          </div>

          {/* Small device */}
          <div className="md:hidden">
            <Menu placement="bottom-end">
              <MenuButton
                as={IconButton}
                className="size-12 bg-transparent border border-secondary-200 rounded-full text-secondary-700"
                icon={<HambergerMenu size="20" color="currentColor" />}
              />
              <MenuList className="p-1">
                {user ? (
                  <>
                    {role?.name === 'Customer' && (
                      <>
                        <MenuItem as={Link} href="/user/my-profile">
                          {t('My profile')}
                        </MenuItem>

                        <MenuItem as={Link} href="/user/my-orders">
                          {t('My orders')}
                        </MenuItem>
                      </>
                    )}
                    <MenuItem onClick={handleLogout}>{t('Logout')}</MenuItem>
                  </>
                ) : (
                  <MenuItem as={Link} href="/login">
                    {t('Login')}
                  </MenuItem>
                )}
              </MenuList>
            </Menu>
          </div>
        </div>
      </div>
    </header>
  );
}
