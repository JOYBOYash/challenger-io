import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { updateUserProfile } from '@/app/actions/user';
import 'dotenv/config';

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
    const rawBody = await req.text(); // Need raw body for verification

    if (!webhookSecret) {
        console.warn('RAZORPAY_WEBHOOK_SECRET is not set.');
        return new NextResponse('Webhook secret not configured.', { status: 500 });
    }

    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
        return new NextResponse('Missing signature.', { status: 400 });
    }

    try {
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(rawBody)
            .digest('hex');

        if (expectedSignature !== signature) {
            return new NextResponse('Invalid signature.', { status: 400 });
        }
        
        const body = JSON.parse(rawBody);
        const event = body.event;
        const payload = body.payload;

        console.log(`✅ Razorpay Webhook Received: ${event}`);

        if (event === 'subscription.charged') {
            const subscription = payload.subscription.entity;
            const firebaseUID = subscription.notes?.firebaseUID;

            if (firebaseUID) {
                await updateUserProfile(firebaseUID, { 
                    plan: 'pro', 
                    razorpaySubscriptionId: subscription.id 
                });
                console.log(`Updated user ${firebaseUID} to Pro plan via webhook.`);
            } else {
                console.warn('No firebaseUID found in subscription notes.');
            }
        } else if (event === 'subscription.cancelled' || event === 'subscription.halted') {
            const subscription = payload.subscription.entity;
            const firebaseUID = subscription.notes?.firebaseUID;

            if (firebaseUID) {
                await updateUserProfile(firebaseUID, { 
                    plan: 'free',
                    razorpaySubscriptionId: '' // Clear the subscription ID
                });
                console.log(`Reverted user ${firebaseUID} to Free plan due to subscription status: ${event}.`);
            } else {
                 console.warn('No firebaseUID found in subscription notes for cancellation/halt.');
            }
        } else {
             console.log(`Unhandled Razorpay event type: ${event}`);
        }

        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error('Error handling Razorpay webhook:', error);
        return new NextResponse(`Webhook Handler Error: ${error.message}`, { status: 500 });
    }
}
