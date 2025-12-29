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
                    <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm sm:text-base">
                        <Link href="/challenge" className="text-muted-foreground transition-colors hover:text-primary font-medium">Challenge</Link>
                        <Link href="/#pricing" className="text-muted-foreground transition-colors hover:text-primary font-medium">Pricing</Link>
                        <Link href="/#connect" className="text-muted-foreground transition-colors hover:text-primary font-medium">Connect</Link>
                        <Link href="/#about" className="text-muted-foreground transition-colors hover:text-primary font-medium">About</Link>
                    </nav>
                </div>
                 <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6">
                    <Link href="/contact" className="text-sm text-muted-foreground transition-colors hover:text-primary">Contact</Link>
                    <Link href="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-primary">Privacy Policy</Link>
                    <Link href="/terms" className="text-sm text-muted-foreground transition-colors hover:text-primary">Terms of Service</Link>
                    <Link href="/cancellation" className="text-sm text-muted-foreground transition-colors hover:text-primary">Cancellation & Refund</Link>
                    <Link href="/shipping" className="text-sm text-muted-foreground transition-colors hover:text-primary">Shipping Policy</Link>
                 </div>
                <div className="mt-8 pt-8 border-t border-primary/10 text-center text-muted-foreground text-sm">
                    <p>&copy; {new Date().getFullYear()} Challenger.io. Your evolution starts now.</p>
                </div>
            </div>
        </footer>
    )
}
