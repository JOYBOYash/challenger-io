import { Icons } from '@/components/icons';
import Link from 'next/link';

export function Footer() {
    return (
        <footer className="border-t border-primary/10 bg-background/80 backdrop-blur-sm">
            <div className="container flex flex-col md:flex-row items-center justify-between gap-6 py-8">
                <div className="flex flex-col gap-2 items-center md:items-start text-center md:text-left">
                    <Link href="/" className="flex items-center space-x-2">
                        <Icons.logo className="h-6 w-6 text-primary" />
                        <span className="font-bold font-headline text-lg">Challenger.io</span>
                    </Link>
                    <p className="text-sm text-muted-foreground">
                        Source code available on GitHub.
                    </p>
                </div>
                <nav className="flex gap-6 items-center">
                    <Link href="/challenge" className="text-sm text-muted-foreground transition-colors hover:text-primary">Challenge</Link>
                    <Link href="/about" className="text-sm text-muted-foreground transition-colors hover:text-primary">About</Link>
                    <Link href="/contact" className="text-sm text-muted-foreground transition-colors hover:text-primary">Contact</Link>
                </nav>
            </div>
        </footer>
    )
}
