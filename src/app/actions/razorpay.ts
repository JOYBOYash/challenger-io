
'use server';

import 'dotenv/config';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { securelyUpdateUserPlan } from './user';

interface CreateOrderParams {
    amount: number; // amount in smallest currency unit (e.g., paise)
    currency: string;
    userId: string;
}

export async function createOrder({ amount, currency, userId }: CreateOrderParams) {
    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    try {
        const options = {
            amount,
            currency,
            receipt: `receipt_user_${userId}_${Date.now()}`,
            notes: {
                userId,
            }
        };

        const order = await razorpay.orders.create(options);
        return order;
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        return null;
    }
}


interface VerifyPaymentParams {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export async function verifyPayment(params: VerifyPaymentParams) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = params;
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(body.toString())
        .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
        // We need a razorpay instance to fetch the order.
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });

        // Fetch order details to get userId from notes
        try {
            const order = await razorpay.orders.fetch(razorpay_order_id);
            const userId = order.notes?.userId;

            if (userId) {
                // This is a secure, server-to-server call.
                await securelyUpdateUserPlan(userId, {
                    plan: 'pro',
                    razorpayPaymentId: razorpay_payment_id,
                });
                return { success: true, userId };
            }
        } catch (error) {
            console.error('Error fetching Razorpay order for verification:', error);
        }
    }
    
    return { success: false };
}
