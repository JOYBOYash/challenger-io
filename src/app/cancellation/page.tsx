import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CancellationPage() {
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
            <CardTitle className="text-4xl font-headline">Cancellation & Refund Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2>Subscription Cancellation</h2>
            <p>You can cancel your subscription at any time. Your access to the Pro features will continue until the end of your current billing period.</p>
            
            <h2>Refunds</h2>
            <p>We do not offer refunds for subscription payments. Once a payment is made, it is non-refundable. If you cancel your subscription, you will not be charged for the next billing cycle.</p>
            
            <h2>Contact Us</h2>
            <p>If you have any questions about our Cancellation and Refund Policy, please contact us through our <Link href="/contact">contact page</Link>.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
