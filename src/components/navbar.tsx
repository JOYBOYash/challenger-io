'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/challenge', label: 'Challenge' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background/80 backdrop-blur-sm">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Icons.logo className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">Challenger.io</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'transition-colors hover:text-primary',
                  pathname === item.href ? 'text-primary font-semibold' : 'text-foreground/60'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="md:hidden">
             <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="pr-0 bg-background/95 backdrop-blur-sm">
                    <SheetTitle className="sr-only">Menu</SheetTitle>
                    <SheetDescription className="sr-only">Main navigation menu</SheetDescription>
                    <Link href="/" className="mr-6 flex items-center space-x-2 mb-6">
                        <Icons.logo className="h-6 w-6 text-primary" />
                        <span className="font-bold">Challenger.io</span>
                    </Link>
                    <div className="flex flex-col space-y-3">
                        {NAV_ITEMS.map((item) => (
                          <Link key={item.href} href={item.href} className={cn("text-lg", pathname === item.href ? 'text-primary font-semibold' : 'text-foreground/60')}>
                            {item.label}
                          </Link>
                        ))}
                    </div>
                </SheetContent>
            </Sheet>
          </div>
          <nav className="hidden md:flex items-center">
            <Button asChild>
              <Link href="/challenge">Start Challenge</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
