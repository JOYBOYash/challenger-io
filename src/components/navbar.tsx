'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Menu, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/challenge', label: 'Challenge' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky md:px-12 px-4 top-0 z-50 w-full bg-gradient-to-r from-background/80 via-background/60 to-background/80 backdrop-blur-xl border-b border-primary/30 shadow-lg shadow-primary/10">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center space-x-2 group">
            <Icons.logo className="h-8 w-8 text-primary transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
            <span className="hidden sm:inline-block font-bold font-headline text-lg text-glow tracking-widest group-hover:text-primary transition-colors duration-300">
              Challenger.io
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative text-sm font-semibold uppercase tracking-wide transition-all duration-300 pb-1',
                  pathname === item.href
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-primary hover:border-b-2 hover:border-primary/60'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex">
            <Button
              asChild
              className="font-extrabold tracking-wider bg-primary hover:bg-primary/90 text-background shadow-md shadow-primary/40 transition-transform duration-200 hover:scale-105"
            >
              <Link href="/challenge">
                Start Challenge
                <Zap className="ml-2 h-4 w-4 animate-pulse" />
              </Link>
            </Button>
          </div>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                  <Menu className="h-6 w-6 text-primary" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0 bg-background/95 backdrop-blur-xl border-r border-primary/10 shadow-lg">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <SheetDescription className="sr-only">Main navigation menu</SheetDescription>

                <Link href="/" className="mr-6 flex items-center space-x-2 mb-8">
                  <Icons.logo className="h-8 w-8 text-primary" />
                  <span className="font-bold text-xl text-primary">Challenger.io</span>
                </Link>

                <div className="flex flex-col space-y-6 border-t border-muted pt-6">
                  {NAV_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'text-lg font-semibold uppercase tracking-wide pl-1 border-l-4 transition-all duration-300',
                        pathname === item.href
                          ? 'text-primary border-primary'
                          : 'text-muted-foreground border-transparent hover:text-primary'
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                <div className="mt-10">
                  <Button
                    asChild
                    size="lg"
                    className="w-fit font-bold tracking-widest bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
                  >
                    <Link href="/challenge">
                      Start Challenge
                      <Zap className="ml-2 h-4 w-4 animate-pulse" />
                    </Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
