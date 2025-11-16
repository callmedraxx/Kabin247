import { PageProps, User } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import React from 'react';
import CustomerHeader from './CustomerHeader';
import Footer from './Footer';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const {
    props: { branding, auth },
  } = usePage() as { props: PageProps };

  return (
    <>
      <Head title={branding?.business?.name} />
      <div className="font-poppins h-screen overflow-y-auto">
        <CustomerHeader branding={branding} user={auth as User} />
        <main className='mt-20'>{children}</main>
        <Footer />
      </div>
    </>
  );
}
