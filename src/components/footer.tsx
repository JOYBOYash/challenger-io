import { Icons } from '@/components/icons';
import Link from 'next/link';

export function Footer() {
    return (
        <footer className="border-t border-border/40">
            <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
                <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
                    <Icons.logo className="h-6 w-6" />
                    <p className="text-center text-sm leading-loose md:text-left">
                        Built by your friendly AI. The source code is available on GitHub.
                    </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Link href="/about" className="hover:text-foreground">About</Link>
                    <Link href="/contact" className="hover:text-foreground">Contact</Link>
                </div>
            </div>
        </footer>
    )
}
