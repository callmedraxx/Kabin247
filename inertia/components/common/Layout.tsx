import { PageProps, User } from '../../types';
import {
  Container,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
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
  // Initialize loading state - false if window is available (client-side), true for SSR
  const [isWindowLoading, setIsWindowLoading] = useState(() => typeof window === 'undefined');
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    // Initialize based on actual window size if available
    if (typeof window !== 'undefined') {
      return window.innerWidth > 768;
    }
    // SSR fallback - assume desktop
    return true;
  });

  const btnRef = React.useRef<HTMLButtonElement | null>(null);
  const { mutate } = useSWRConfig();

  // page props
  const {
    props: { branding, auth },
  } = usePage() as { props: PageProps };

  // Set default sidebar and window loading
  useEffect(() => {
    // Only access localStorage on client side
    if (typeof window === 'undefined') {
      setIsWindowLoading(false);
      return;
    }
    
    const sidebarPref = localStorage.getItem('sidebar');

    if (windowSize.width < 768) {
      // Always hide on mobile by default
      setIsExpanded(false);
    } else if (sidebarPref) {
      setIsExpanded(sidebarPref === 'expanded');
    } else {
      setIsExpanded(true); // Default to expanded on desktop
    }

    // Set loading to false immediately since window size is already detected
    setIsWindowLoading(false);
  }, [windowSize.width]);

  useEffect(() => {
    // Only subscribe if transmit is available and auth exists
    if (typeof window === 'undefined' || !globalThis.transmit || !auth?.id) return;

    const subscribeToNotifications = async () => {
      try {
        const subscription = transmit.subscription(`users/${auth?.id}`);
        await subscription.create();

        subscription.onMessage((data: Record<string, string>) => {
          toast.message(data.title, {
            description: data.body,
            closeButton: true,
          });
          mutate((key: string) => key.startsWith('/notifications'));
        });
      } catch (error) {
        console.error('Failed to subscribe to notifications:', error);
      }
    };

    subscribeToNotifications();

    return () => {
      if (globalThis.transmit) {
        transmit.close();
      }
    };
  }, [mutate, auth?.id]);

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
            <Drawer isOpen={isExpanded} onClose={() => toggleSidebar('collapsed')} placement="left">
              <DrawerOverlay />
              <DrawerContent style={{ width: '15rem', maxWidth: '15rem' }}>
                <DrawerBody className="overflow-hidden p-0 w-60">
                  {auth?.roleId !== 4 && auth?.roleId !== 5 && <SideNav isExpanded={true} />}
                </DrawerBody>
              </DrawerContent>
            </Drawer>
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
