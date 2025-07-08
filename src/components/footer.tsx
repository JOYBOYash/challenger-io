import { Icons } from '@/components/icons';
import Link from 'next/link';

export function Footer() {
    return (
        <footer className="border-t border-primary/10 bg-background/80 backdrop-blur-sm">
            <div className="container flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center space-x-2">
                        <Icons.logo className="h-6 w-6 text-primary" />
                        <span className="font-bold font-headline text-lg">Challenger.io</span>
                    </Link>
                </div>
                <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
                    <Link href="/challenge" className="text-sm text-muted-foreground transition-colors hover:text-primary">Challenge</Link>
                    <Link href="/about" className="text-sm text-muted-foreground transition-colors hover:text-primary">About</Link>
                    <Link href="/contact" className="text-sm text-muted-foreground transition-colors hover:text-primary">Contact</Link>
                </nav>
            </div>
        </footer>
    )
}
