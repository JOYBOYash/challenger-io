'use server';

import { stripe } from '@/lib/stripe';
import { findUserById, updateUserProfile } from './user';
import { headers } from 'next/headers';

const getBaseUrl = () => {
    const host = headers().get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    return `${protocol}://${host}`;
}

export async function createCheckoutSession(uid: string, email: string): Promise<{ url?: string | null; error?: string }> {
    try {
        if (!uid) throw new Error("User ID is required.");
        const proPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
        if (!proPriceId) throw new Error("Pro plan Price ID is not configured.");

        const user = await findUserById(uid);
        if (!user) throw new Error("User not found.");

        let stripeCustomerId = user.stripeCustomerId;

        // If the user doesn't have a stripeCustomerId, create one
        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email,
                name: user.username,
                metadata: {
                    firebaseUID: uid,
                },
            });
            stripeCustomerId = customer.id;
            await updateUserProfile(uid, { stripeCustomerId });
        }

        const baseUrl = getBaseUrl();
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            customer: stripeCustomerId,
            line_items: [
                {
                    price: proPriceId,
                    quantity: 1,
                },
            ],
            success_url: `${baseUrl}/profile?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/#pricing`,
            subscription_data: {
                metadata: {
                    firebaseUID: uid,
                },
            },
        });

        return { url: session.url };

    } catch (error: any) {
        console.error("Error creating checkout session:", error);
        return { error: error.message || "An unexpected error occurred." };
    }
}


export async function createCustomerPortalSession(uid: string): Promise<{ url?: string; error?: string }> {
    try {
        if (!uid) throw new Error("User ID is required.");

        const user = await findUserById(uid);
        if (!user || !user.stripeCustomerId) {
            throw new Error("User or Stripe customer ID not found.");
        }
        
        const baseUrl = getBaseUrl();
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${baseUrl}/profile`,
        });

        return { url: portalSession.url };

    } catch (error: any) {
        console.error("Error creating customer portal session:", error);
        return { error: error.message || "An unexpected error occurred." };
    }
}
