import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TermsAndConditionsPage() {
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
            <CardTitle className="text-4xl font-headline">Terms and Conditions</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>Please read these terms and conditions carefully before using Our Service.</p>
            
            <h2>1. Interpretation and Definitions</h2>
            <p>The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
            
            <h2>2. Acknowledgment</h2>
            <p>These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.</p>
            <p>Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.</p>
            
            <h2>3. Subscriptions</h2>
            <p>Some parts of the Service are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis (such as monthly or annually), depending on the type of Subscription plan you select when purchasing the Subscription.</p>
            
            <h2>4. Termination</h2>
            <p>We may terminate or suspend Your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if You breach these Terms and Conditions.</p>

            <h2>5. Governing Law</h2>
            <p>The laws of the Country, excluding its conflicts of law rules, shall govern this Terms and Your use of the Service. Your use of the Application may also be subject to other local, state, national, or international laws.</p>
            
            <h2>6. Changes to These Terms and Conditions</h2>
            <p>We reserve the right, at Our sole discretion, to modify or replace these Terms at any time. If a revision is material We will make reasonable efforts to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at Our sole discretion.</p>
            
            <h2>7. Contact Us</h2>
            <p>If you have any questions about these Terms and Conditions, You can contact us by email at [Your Contact Email].</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
