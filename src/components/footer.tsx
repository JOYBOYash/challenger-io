import { Icons } from '@/components/icons';
import Link from 'next/link';

export function Footer() {
    return (
        <footer className="border-t border-primary/20 bg-background/80 backdrop-blur-sm">
            <div className="container mx-auto px-4 md:px-6 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <Link href="/" className="flex items-center space-x-2">
                        <Icons.logo className="h-8 w-8 text-primary" />
                        <span className="font-bold font-headline text-glow text-xl">Challenger.io</span>
                    </Link>
                    <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
                        <Link href="/challenge" className="text-base text-muted-foreground transition-colors hover:text-primary font-medium">Challenge</Link>
                        <Link href="/#pricing" className="text-base text-muted-foreground transition-colors hover:text-primary font-medium">Pricing</Link>
                        <Link href="/contact" className="text-base text-muted-foreground transition-colors hover:text-primary font-medium">Contact</Link>
                        <Link href="/privacy" className="text-base text-muted-foreground transition-colors hover:text-primary font-medium">Privacy</Link>
                        <Link href="/terms" className="text-base text-muted-foreground transition-colors hover:text-primary font-medium">Terms</Link>
                    </nav>
                </div>
                 <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mt-4">
                    <Link href="/cancellation" className="text-sm text-muted-foreground transition-colors hover:text-primary font-medium">Cancellation & Refund</Link>
                    <Link href="/shipping" className="text-sm text-muted-foreground transition-colors hover:text-primary font-medium">Shipping Policy</Link>
                 </div>
                <div className="mt-8 pt-8 border-t border-primary/10 text-center text-muted-foreground text-sm">
                    <p>&copy; {new Date().getFullYear()} Challenger.io. Your evolution starts now.</p>
                </div>
            </div>
        </footer>
    )
}
