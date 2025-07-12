
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicyPage() {
  return (
    <div className="cyber-grid min-h-screen">
      <div className="container mx-auto max-w-4xl py-12 px-4">
        <div className="mb-8">
            <Button asChild variant="outline">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Link>
            </Button>
        </div>
        <Card className="p-8">
          <CardHeader>
            <CardTitle className="text-4xl font-headline">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2>1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you create an account, subscribe to our services, or communicate with us. This may include your name, email address, and payment information.</p>
            
            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and communicate with you about products, services, and events.</p>

            <h2>3. Information Sharing</h2>
            <p>We do not share your personal information with third parties except as necessary to process your payment or as required by law.</p>

            <h2>4. Data Security</h2>
            <p>We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.</p>
            
            <h2>5. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please <Link href="/contact">contact us</Link>.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
