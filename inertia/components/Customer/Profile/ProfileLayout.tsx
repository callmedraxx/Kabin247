import CustomerHeader from '@/components/Customer/CustomerHeader';
import { PageProps, User } from '@/types';
import { Container } from '@chakra-ui/react';
import { Head, usePage } from '@inertiajs/react';
import React from 'react';
import ProfileNav from './ProfileNav';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const {
    props: { branding, auth },
  } = usePage() as { props: PageProps };

  return (
    <>
      <Head title={branding?.business?.name} />
      <Container maxW="100%" paddingX="0" className="flex flex-col bg-white font-poppins h-screen">
        <CustomerHeader branding={branding} user={auth as User} />
        <div className="flex-1 overflow-y-scroll w-full relative mt-20">
          <div className="mx-auto w-full px-6 py-6 flex items-center justify-center sticky top-0 bg-white z-10">
            <ProfileNav />
          </div>

          <div className="pb-8">{children}</div>
        </div>
      </Container>
    </>
  );
}
