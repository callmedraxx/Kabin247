import { PageProps, User } from '@/types';
import {
  Button,
  forwardRef,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import {
  ArrowDown2,
  Clock as ClockIcon,
  HambergerMenu,
  ProfileCircle,
  VolumeHigh,
  VolumeSlash,
} from 'iconsax-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import Notifications from '../Admin/Notifications/Notifications';
import ProfileEdit from '../Admin/Profile/ProfileEdit';
import Clock from './Clock';
// import LangSwitcher from './LangSwitcher';

export const Header = forwardRef(
  (
    {
      setIsExpanded,
      isExpanded,
      title,
      user,
    }: {
      setIsExpanded: Function;
      isExpanded: boolean;
      title: string;
      user: User;
    },
    ref
  ) => {
    const { t } = useTranslation();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const {
      props: { branding },
    } = usePage() as { props: PageProps };

    // logout
    const handleLogout = async () => {
      try {
        const { data } = await axios.post('/api/auth/logout');
        if (data?.message) {
          router.visit('/login');
        }
      } catch (e) {
        toast.error(t('Failed to logout'));
      }
    };

    // toggle notification sound
    const toggleNotificationSound = async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      try {
        const { data } = await axios.put('/api/users/profile/update', {
          notificationSound: !user.notificationSound,
        });

        if (data) {
          toast.success(t('Notification sound successfully updated'));
          router.reload();
        }
      } catch (error) {
        if (Array.isArray(error.response.data.messages)) {
          error.response.data.messages.forEach((message: Record<string, string>) => {
            toast.error(t(message?.message));
          });
        } else {
          toast.error(t(error.response.data.message));
        }
      }
    };

    return (
      <>
        <div className="min-h-[76px] flex justify-between border-b border-black/10 bg-white w-full items-center gap-2 px-4 @container">
          <div>
            {user?.roleId === 4 || user?.roleId === 5 ? (
              <div className="h-[76px] flex items-center justify-center">
                <Link href={`${user?.roleId === 4 ? "/display" : "/kitchen"}`} className="flex items-center justify-center">
                  <img
                    src={
                      isExpanded
                        ? branding?.business?.logo?.url || '/logo.png'
                        : branding?.business?.favicon?.url || '/logo.png'
                    }
                    alt={branding?.business?.name || 'Logo'}
                    className="h-10"
                  />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <IconButton
                  aria-label={t('Toggle')}
                  className="size-12 rounded-lg bg-white border border-gray-200 text-secondary-700"
                  icon={<HambergerMenu size="20" color="currentColor" />}
                  onClick={() => setIsExpanded(!isExpanded)}
                  ref={ref}
                />
                <Text
                  as="p"
                  noOfLines={1}
                  className="text-secondary-500 whitespace-nowrap font-medium text-lg hidden @2xl:inline-block"
                >
                  {t(title)}
                </Text>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 border px-4 py-2 h-12 rounded-md text-secondary-700 min-w-fit">
              <ClockIcon color="currentColor" />
              <Clock />
            </div>
            <Notifications />

            {/* <LangSwitcher /> */}

            <Menu placement="bottom-end">
              <MenuButton
                as={Button}
                className="h-12 rounded-lg px-0 bg-white border border-gray-200"
              >
                <div className="flex md:hidden items-center px-3 py-2 gap-2 text-secondary-700">
                  <ProfileCircle color="currentColor" />
                </div>

                <div className="hidden md:flex items-center px-6 py-2 gap-2 text-secondary-700">
                  <div className="flex flex-col items-end">
                    <span className="font-bold">{user?.fullName}</span>
                    <span className="text-xs font-medium">{user?.role?.name}</span>
                  </div>
                  <ArrowDown2 size="24" color="currentColor" />
                </div>
              </MenuButton>
              <MenuList className="p-1">
                <MenuItem onClick={onOpen}>{t('Profile')}</MenuItem>
                <MenuItem
                  as="div"
                  className="flex w-full flex-row gap-2 justify-between items-center h-9 hover:bg-inherit"
                >
                  {t('Notification')}
                  <IconButton
                    aria-label="NotificationSoundIndicator"
                    variant="ghost"
                    data-sound-on={user?.notificationSound}
                    className="text-gray-400 data-[sound-on=true]:text-green-500 p-0"
                    onClick={toggleNotificationSound}
                    icon={
                      <Icon
                        as={user?.notificationSound ? VolumeHigh : VolumeSlash}
                        size={24}
                        className="w-5 h-5"
                      />
                    }
                  />
                </MenuItem>
                <MenuDivider className="my-1" />
                <MenuItem onClick={handleLogout}>{t('Logout')}</MenuItem>
              </MenuList>
            </Menu>
          </div>
        </div>

        {/* Profile edit model */}
        <ProfileEdit isOpen={isOpen} onClose={onClose} />
      </>
    );
  }
);

Header.displayName = 'Header';

export default Header;
