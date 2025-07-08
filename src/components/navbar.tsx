'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
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
    <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background/90 backdrop-blur-sm">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <Icons.logo className="h-8 w-8 text-primary" />
              <span className="hidden sm:inline-block font-bold font-headline text-glow text-xl">Challenger.io</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'transition-colors hover:text-primary text-base font-medium',
                    pathname === item.href ? 'text-primary' : 'text-foreground/80'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="hidden md:flex">
                <Button asChild size="lg" className="font-bold group">
                  <Link href="/challenge">
                    Start Challenge
                    <Zap className="ml-2 h-5 w-5 transition-transform group-hover:rotate-12" />
                  </Link>
                </Button>
            </div>
            <div className="md:hidden">
                 <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">Toggle Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="pr-0 bg-background/95 backdrop-blur-sm">
                        <SheetTitle className="sr-only">Menu</SheetTitle>
                        <SheetDescription className="sr-only">Main navigation menu</SheetDescription>
                        <Link href="/" className="mr-6 flex items-center space-x-2 mb-8">
                            <Icons.logo className="h-8 w-8 text-primary" />
                            <span className="font-bold text-xl">Challenger.io</span>
                        </Link>
                        <div className="flex flex-col space-y-4">
                            {NAV_ITEMS.map((item) => (
                              <Link key={item.href} href={item.href} className={cn("text-lg", pathname === item.href ? 'text-primary font-semibold' : 'text-foreground/80')}>
                                {item.label}
                              </Link>
                            ))}
                        </div>
                         <div className="mt-8">
                            <Button asChild size="lg" className="font-bold group w-full">
                              <Link href="/challenge">
                                Start Challenge
                                <Zap className="ml-2 h-5 w-5" />
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
