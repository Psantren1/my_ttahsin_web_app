'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/helper';

interface NavItem {
  icon: React.ComponentType<{ size?: number | string }>;
  label: string;
  href: string;
}

interface BottomNavProps {
  items: NavItem[];
}

export default function BottomNav({ items }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-surface-200 lg:hidden">
      <div className="flex justify-around items-center max-w-lg mx-auto px-2">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 py-2.5 px-3 min-w-0 transition-colors',
                isActive ? 'text-tosca-600' : 'text-surface-400 hover:text-surface-600'
              )}
            >
              <item.icon size={20} />
              <span className={cn('text-[10px] truncate max-w-full', isActive ? 'font-bold' : 'font-medium')}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
