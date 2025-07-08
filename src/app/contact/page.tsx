'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Send } from 'lucide-react';

export default function ContactPage() {
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        toast({
            title: "Transmission Received",
            description: "Thanks for your feedback. We'll get back to you soon.",
        });
        (e.target as HTMLFormElement).reset();
    };

    return (
        <div className="cyber-grid flex-1">
            <div className="container max-w-2xl px-4 md:px-6 py-12 md:py-20">
                <div className="text-center space-y-4">
                    <h1 className="font-headline text-4xl font-bold text-glow sm:text-5xl">Connect with Us</h1>
                    <p className="text-muted-foreground md:text-lg">
                        Your feedback is the compiler for our next iteration. Have a suggestion, a bug to report, or just want to talk tech? Drop us a line. We're always listening for the next great idea.
                    </p>
                </div>

                <Card className="cyber-card mt-12">
                    <CardHeader className="text-center">
                        <CardTitle className="font-headline text-2xl">Send Transmission</CardTitle>
                        <CardDescription>
                           Fill out the form to send your message across the network.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-2 text-left">
                                <Label htmlFor="name">Alias</Label>
                                <Input id="name" placeholder="Your Coder Name" required />
                            </div>
                            <div className="grid gap-2 text-left">
                                <Label htmlFor="email">Secure Channel (Email)</Label>
                                <Input id="email" type="email" placeholder="your@email.com" required />
                            </div>
                            <div className="grid gap-2 text-left">
                                <Label htmlFor="message">Message</Label>
                                <Textarea id="message" placeholder="Your message..." required className="min-h-[150px]" />
                            </div>
                            <Button type="submit" className="w-full font-bold">
                                Send Message <Send className="ml-2 h-4 w-4" />
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
