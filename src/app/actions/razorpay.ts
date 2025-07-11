
'use server';
import 'dotenv/config';

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { nanoid } from 'nanoid';
import { headers } from 'next/headers';
import { findUserById, updateUserProfile } from './user';
import { initializeFirebase } from '@/lib/firebase';
import { getDoc, doc } from 'firebase/firestore';

const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;
const proPlanId = process.env.NEXT_PUBLIC_RAZORPAY_PRO_PLAN_ID;
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

if (!keyId || !keySecret || !proPlanId) {
    throw new Error('Razorpay environment variables are not set.');
}

const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
});

async function getCurrentUserId() {
    const { auth } = initializeFirebase();
    if (!auth?.currentUser) {
        throw new Error('User not authenticated.');
    }
    return auth.currentUser.uid;
}

export async function createSubscription(): Promise<{ subscriptionId?: string; error?: string }> {
    try {
        const userId = await getCurrentUserId();
        const user = await findUserById(userId);

        if (!user) {
            throw new Error('User not found.');
        }

        let razorpayCustomerId = user.razorpayCustomerId;
        
        if (!razorpayCustomerId) {
            const customer = await razorpay.customers.create({
                name: user.username,
                email: user.email,
                contact: '' // You can add a phone number field if you collect it
            });
            razorpayCustomerId = customer.id;
            await updateUserProfile(userId, { razorpayCustomerId });
        }
        
        const subscription = await razorpay.subscriptions.create({
            plan_id: proPlanId,
            customer_id: razorpayCustomerId,
            total_count: 12, // For a year, adjust as needed
            quantity: 1,
            notes: {
                firebaseUID: userId,
            },
        });

        return { subscriptionId: subscription.id };

    } catch (error: any) {
        console.error('Error creating Razorpay subscription:', error);
        return { error: error.message || 'An unexpected error occurred.' };
    }
}


export async function verifyPayment(data: {
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
    razorpay_signature: string;
}): Promise<{ success: boolean; error?: string }> {
     try {
        const userId = await getCurrentUserId();
        const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = data;
        
        if (!keySecret) {
          throw new Error("Razorpay key secret is not configured.");
        }

        const generated_signature = crypto
            .createHmac('sha256', keySecret)
            .update(razorpay_payment_id + "|" + razorpay_subscription_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return { success: false, error: 'Invalid payment signature.' };
        }

        // Signature is valid, update user profile
        await updateUserProfile(userId, { 
            plan: 'pro',
            razorpaySubscriptionId: razorpay_subscription_id,
        });

        return { success: true };

    } catch (error: any) {
        console.error('Error verifying payment:', error);
        return { success: false, error: error.message || 'An unexpected error occurred.' };
    }
}
