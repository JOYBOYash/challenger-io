'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, Zap, LogOut, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { signOut } from 'firebase/auth';
import { initializeFirebase } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const NAV_ITEMS = [
  { href: '/challenge', label: 'Challenge' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, firebaseUser } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { auth, error } = initializeFirebase();
    if (error || !auth) {
        toast({ title: "Logout Failed", description: "Firebase not configured.", variant: "destructive" });
        console.error(error);
        return;
    }

    try {
        await signOut(auth);
        toast({ title: "Logged Out", description: "You have been successfully logged out." });
        router.push('/');
    } catch (error) {
        toast({ title: "Logout Failed", description: "There was an error logging out.", variant: "destructive" });
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
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
                  'text-sm font-semibold uppercase tracking-wider transition-colors duration-300 pb-1',
                  pathname === item.href
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-primary'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex">
            {user ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                       <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                         <Avatar className="h-8 w-8">
                            {/* <AvatarImage src="/avatars/01.png" alt={user.username} /> */}
                            <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                         </Avatar>
                       </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.username}</p>
                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" asChild><Link href="/login">Login</Link></Button>
                    <Button asChild className="font-bold"><Link href="/signup">Sign Up</Link></Button>
                </div>
            )}
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

                <div className="mt-10 pt-6 border-t border-muted">
                  {user ? (
                      <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <Avatar>
                                <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                             </Avatar>
                             <div>
                                <p className="font-semibold">{user.username}</p>
                             </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={handleLogout}><LogOut /></Button>
                      </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                        <Button asChild size="lg" className="w-full"><Link href="/login">Login</Link></Button>
                        <Button asChild size="lg" variant="secondary" className="w-full"><Link href="/signup">Sign Up</Link></Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
