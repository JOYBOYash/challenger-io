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
        <div className="container max-w-2xl py-12 md:py-20 cyber-grid">
            <Card className="cyber-card">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl text-glow">Contact Us</CardTitle>
                    <CardDescription>
                        Have a question, feedback, or a brilliant idea? We'd love to hear from you.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" placeholder="Your Name" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="your@email.com" required />
                        </div>
                        <div className="grid gap-2">
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
    );
}
