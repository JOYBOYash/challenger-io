import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { updateUserProfile } from '@/app/actions/user';
import 'dotenv/config';

export async function POST(req: NextRequest) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
        return new NextResponse('Signature missing.', { status: 400 });
    }

    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(body);
    const digest = shasum.digest('hex');

    if (digest !== signature) {
        return new NextResponse('Invalid signature.', { status: 400 });
    }

    try {
        const event = JSON.parse(body);

        if (event.event === 'payment.captured') {
            const payment = event.payload.payment.entity;
            const order = event.payload.order.entity;
            const userId = order.notes?.userId;

            if (userId) {
                await updateUserProfile(userId, {
                    plan: 'pro',
                    razorpayPaymentId: payment.id,
                });
                console.log(`Updated user ${userId} to Pro plan via webhook.`);
            }
        }

        return NextResponse.json({ status: 'ok' });
    } catch (error: any) {
        console.error('Error handling Razorpay webhook:', error.message);
        return new NextResponse(`Webhook Handler Error: ${error.message}`, { status: 500 });
    }
}
