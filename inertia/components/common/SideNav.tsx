import { PageProps } from '../../types';
import { AuthNavigationSidebar } from '../../utils/auth_navigation_sidebar';
import { formatRoleUrl } from '../../utils/format_role_url';
import { Button, Icon } from '@chakra-ui/react';
import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import React from 'react';
import NavItem from './NavItem';

// Sidebar items list
const sidebar = new AuthNavigationSidebar();

export default function SideNav({ isExpanded }: { isExpanded: boolean }) {
  const { t } = useTranslation();
  const {
    props: { branding, auth },
  } = usePage() as { props: PageProps };

  const active = window.location.pathname.split('/')[2];

  return (
    <div
      className={`${isExpanded ? 'max-w-60 min-w-60' : 'max-w-20 min-w-20 no-scrollbar'} h-screen w-full bg-white px-4 border-r border-black/10 overflow-y-scroll scrollbar transition-all duration-500`}
    >
      <div className="h-[76px] flex items-center justify-center">
        <Link
          href={formatRoleUrl('/dashboard', auth?.role?.name || 'admin')}
          className="flex items-center justify-center"
        >
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

      {auth && (() => {
        const roleId = auth.roleId || auth.role?.id;
        const roleName = auth.role?.name || (roleId === 1 ? 'admin' : roleId === 2 ? 'manager' : 'admin');
        const sidebarGroups = sidebar.getSidebar(roleId);
        if (!sidebarGroups || sidebarGroups.length === 0) {
          console.warn('No sidebar items found for roleId:', roleId, 'auth:', auth);
          return null;
        }
        return sidebarGroups.map((group) =>
          !group?.groupTitle ? (
            <div key={group.id} className="flex flex-col gap-2 py-4 border-t border-black/5">
              {group?.items.map((item) => (
                <Button
                  key={item.id}
                  w="full"
                  asChild
                  className={`${item.className}  ${isExpanded ? 'justify-between' : 'justify-center'} flex items-center transition-all duration-500 gap-2`}
                >
                  <Link
                    href={formatRoleUrl(item.href || '', roleName)}
                    data-menu-active={item.isActive(active)}
                  >
                    {React.createElement(item.leftIcon, { size: 20, color: 'currentColor' })}
                    {isExpanded && <span className="inline-block flex-1">{t(item.title)}</span>}
                    {isExpanded && item.rightIcon && React.createElement(item.rightIcon, { size: 20, color: 'currentColor' })}
                  </Link>
                </Button>
              ))}
            </div>
          ) : (
            <div key={group.id}>
              <NavItem
                title={t(group.groupTitle)}
                isExpanded={isExpanded}
                nav={group.items.map((item) => ({
                  ...item,
                  name: t(item.title),
                  icon: React.createElement(item.leftIcon, { size: 20, color: 'currentColor' }),
                  link: formatRoleUrl(item.href || '', roleName) || false,
                  subNav:
                    item.subItems &&
                    item.subItems?.map((subItem) => ({
                      ...subItem,
                      name: t(subItem.title),
                      link: formatRoleUrl(subItem.href || '', roleName),
                    })),
                }))}
              />
            </div>
          )
        );
      })()}
    </div>
  );
}
