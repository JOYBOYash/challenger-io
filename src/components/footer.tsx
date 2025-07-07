import { Icons } from '@/components/icons';
import Link from 'next/link';

export function Footer() {
    return (
        <footer className="border-t border-primary/10 bg-background/80 backdrop-blur-sm">
            <div className="container grid grid-cols-1 md:grid-cols-3 gap-8 py-12 text-center md:text-left">
                <div className="flex flex-col gap-2 items-center md:items-start">
                    <Link href="/" className="flex items-center space-x-2">
                        <Icons.logo className="h-6 w-6 text-primary" />
                        <span className="font-bold font-headline text-lg">Challenger.io</span>
                    </Link>
                    <p className="text-sm text-muted-foreground">
                        Infinite challenges, one developer at a time.
                    </p>
                </div>
                <div className="flex flex-col gap-2 items-center">
                    <h4 className="font-headline font-semibold text-primary">Explore</h4>
                    <Link href="/challenge" className="text-sm text-muted-foreground transition-colors hover:text-primary">Challenge</Link>
                    <Link href="/about" className="text-sm text-muted-foreground transition-colors hover:text-primary">About</Link>
                    <Link href="/contact" className="text-sm text-muted-foreground transition-colors hover:text-primary">Contact</Link>
                </div>
                <div className="flex flex-col gap-2 items-center md:items-end">
                    <h4 className="font-headline font-semibold text-primary">Connect</h4>
                    <p className="text-sm text-muted-foreground">
                        Source code available on GitHub.
                    </p>
                </div>
            </div>
        </footer>
    )
}
