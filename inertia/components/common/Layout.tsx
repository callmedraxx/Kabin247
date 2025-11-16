import { PageProps, User } from '../../types';
import {
  Container,
  Drawer,
  Portal,
  Spinner,
} from '@chakra-ui/react';
import { Head, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import Header from './Header';
import SideNav from './SideNav';
import useWindowSize from '../../hooks/useWindowSize';
import { useSWRConfig } from 'swr';
import { toast } from 'sonner';

export default function Layout({
  children,
  title,
  enableDrawerSidebar,
}: {
  children: React.ReactNode;
  title: string;
  enableDrawerSidebar?: boolean;
}) {
  const windowSize = useWindowSize();
  const [isWindowLoading, setIsWindowLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(windowSize.width > 768);

  const btnRef = React.useRef<HTMLButtonElement | null>(null);
  const { mutate } = useSWRConfig();

  // page props
  const {
    props: { branding, auth },
  } = usePage() as { props: PageProps };

  // Set default sidebar and window loading
  useEffect(() => {
    const sidebarPref = localStorage.getItem('sidebar');

    if (windowSize.width < 768) {
      // Always hide on mobile by default
      setIsExpanded(false);
    } else if (sidebarPref) {
      setIsExpanded(sidebarPref === 'expanded');
    } else {
      setIsExpanded(true); // Default to expanded on desktop
    }

    setIsWindowLoading(false);
  }, [windowSize.width]);

  useEffect(() => {
    const subscribeToNotifications = async () => {
      const subscription = transmit.subscription(`users/${auth?.id}`);
      await subscription.create();

      subscription.onMessage((data: Record<string, string>) => {
        toast.message(data.title, {
          description: data.body,
          closeButton: true,
        });
        mutate((key: string) => key.startsWith('/notifications'));
      });
    };

    subscribeToNotifications();

    return () => {
      transmit.close();
    };
  }, [mutate]);

  // Toggle or update sidebar state
  const toggleSidebar = (state?: 'expanded' | 'collapsed') => {
    if (state) {
      localStorage.setItem('sidebar', state);
      setIsExpanded(state === 'expanded');
    } else {
      localStorage.setItem('sidebar', isExpanded ? 'collapsed' : 'expanded');
      setIsExpanded(!isExpanded);
    }
  };

  // return loading
  if (isWindowLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <Head title={title + ' - ' + branding?.business?.name} />
      <Container maxW="100%" paddingX="0">
        <div className="h-screen flex">
          {windowSize.width < 768 || enableDrawerSidebar ? (
            <Drawer.Root open={isExpanded} onOpenChange={() => toggleSidebar('collapsed')} placement="start">
              <Portal>
                <Drawer.Backdrop />
                <Drawer.Positioner>
                  <Drawer.Content style={{ width: '15rem', maxWidth: '15rem' }}>
                    <Drawer.Body className="overflow-hidden p-0 w-60">
                      {auth?.roleId !== 4 && auth?.roleId !== 5 && <SideNav isExpanded={true} />}
                    </Drawer.Body>
                  </Drawer.Content>
                </Drawer.Positioner>
              </Portal>
            </Drawer.Root>
          ) : (
            auth?.roleId !== 4 && auth?.roleId !== 5 && <SideNav isExpanded={isExpanded} />
          )}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header
              title={title}
              user={auth as User}
              isExpanded={isExpanded}
              setIsExpanded={() => toggleSidebar()}
              ref={btnRef}
            />
            <div className="h-full box-border overflow-x-hidden overflow-y-auto">{children}</div>
          </div>
        </div>
      </Container>
    </>
  );
}
