
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ShippingPolicyPage() {
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
            <CardTitle className="text-4xl font-headline">Shipping Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2>Digital Services</h2>
            <p>Challenger.io is a digital service provider. All our products and services are delivered electronically via the internet.</p>
            
            <h2>No Physical Shipping</h2>
            <p>As we do not sell physical goods, there is no shipping involved. Upon successful payment and subscription, your account will be upgraded instantly, and you will gain access to all the features of your chosen plan.</p>
            
            <h2>Service Access</h2>
            <p>You can access our services by logging into your account on our website. There are no physical items to be shipped or delivered.</p>

            <h2>Contact Us</h2>
            <p>If you have any questions about our Shipping Policy or are experiencing issues accessing our services after a purchase, please <Link href="/contact">contact us</Link>.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
