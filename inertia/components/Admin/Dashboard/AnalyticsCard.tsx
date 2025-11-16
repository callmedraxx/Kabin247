import React from 'react';
import { Link } from '@inertiajs/react';

export default function AnalyticsCard({
  size,
  title,
  icon,
  value,
  link,
}: {
  size: 'small' | 'large';
  title: string;
  icon: React.ReactNode;
  value: string;
  link: string;
}) {
  return (
    <Link
      href={link}
      className={`w-full bg-white shadow-primary rounded-md ${size === 'large' ? 'p-4 @md:p-8 items-start' : 'px-4 @md:px-8 py-4 items-center'} cursor-pointer flex justify-between`}
    >
      {size === 'large' ? (
        <>
          <div>
            <p className="font-medium mb-1">{title}</p>
            <h2 className="text-3xl font-semibold">{value?.toLocaleString()}</h2>
          </div>
          {icon}
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold mr-2">{value?.toLocaleString()}</h2>
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm">{title}</p>
            {icon}
          </div>
        </>
      )}
    </Link>
  );
}
