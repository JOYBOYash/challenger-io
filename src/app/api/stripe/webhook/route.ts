import { stripe } from '@/lib/stripe';
import { updateUserProfile } from '@/app/actions/user';
import { headers } from 'next/headers';
import type Stripe from 'stripe';
import { NextResponse } from 'next/server';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!webhookSecret) {
    console.warn("Stripe webhook secret is not set. Webhooks will not be secure.");
}

export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get('Stripe-Signature');

    let event: Stripe.Event;

    try {
        if (!signature) {
            throw new Error("Missing Stripe-Signature header");
        }
         if (!webhookSecret) {
            throw new Error("Stripe webhook secret is not configured.");
        }
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`❌ Error message: ${err.message}`);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }
    
    console.log('✅ Stripe Webhook Received:', event.type);

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const firebaseUID = session.subscription_data?.metadata?.firebaseUID || session.metadata?.firebaseUID;
                if (!firebaseUID) {
                    throw new Error("No firebaseUID found in checkout session metadata.");
                }
                await updateUserProfile(firebaseUID, { plan: 'pro' });
                console.log(`Updated user ${firebaseUID} to Pro plan.`);
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                const firebaseUID = subscription.metadata?.firebaseUID;

                if (!firebaseUID) {
                     console.warn("No firebaseUID found in subscription metadata for update.");
                     break;
                }
                
                const newPlan = subscription.status === 'active' ? 'pro' : 'free';
                await updateUserProfile(firebaseUID, { plan: newPlan });
                console.log(`Updated subscription for user ${firebaseUID}. New plan: ${newPlan}. Status: ${subscription.status}`);
                break;
            }
            
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const firebaseUID = subscription.metadata?.firebaseUID;

                if (!firebaseUID) {
                     console.warn("No firebaseUID found in subscription metadata for deletion.");
                     break;
                }
                
                await updateUserProfile(firebaseUID, { plan: 'free' });
                 console.log(`Subscription deleted for user ${firebaseUID}. Reverted to Free plan.`);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error("Error handling webhook event:", error);
        return new NextResponse(`Webhook Handler Error: ${error.message}`, { status: 500 });
    }
}
