import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Paddle } from '@paddle/paddle-js';
import { updateUserProfile } from '@/app/actions/user';
import 'dotenv/config';

const paddle = new Paddle({
  vendor: Number(process.env.PADDLE_VENDOR_ID),
  authCode: process.env.PADDLE_AUTH_CODE!,
  environment: 'sandbox', // Use 'production' for live
});

export async function POST(req: NextRequest) {
  const signature = req.headers.get('paddle-signature')!;
  const rawBody = await req.text();

  try {
    const event = paddle.webhooks.unmarshal(rawBody, signature);
    if (!event) {
        return new NextResponse('Invalid signature.', { status: 400 });
    }
    
    console.log(`✅ Paddle Webhook Received: ${event.eventType}`);

    const firebaseUID = event.data.custom_data?.firebase_uid;
    const paddleCustomerId = event.data.customer_id;

    if (!firebaseUID) {
      console.warn('No firebase_uid found in event custom_data.');
      return NextResponse.json({ received: true, message: "No UID found." });
    }

    switch (event.eventType) {
      case 'subscription.created':
      case 'subscription.updated':
        const status = event.data.status;
        if (status === 'active' || status === 'trialing') {
          await updateUserProfile(firebaseUID, {
            plan: 'pro',
            paddleCustomerId: paddleCustomerId,
            paddleSubscriptionId: event.data.id
          });
          console.log(`Updated user ${firebaseUID} to Pro plan.`);
        } else {
           await updateUserProfile(firebaseUID, {
            plan: 'free',
            paddleSubscriptionId: ''
          });
          console.log(`Reverted user ${firebaseUID} to Free plan due to status: ${status}`);
        }
        break;
      
      case 'subscription.canceled':
        await updateUserProfile(firebaseUID, {
          plan: 'free',
          paddleSubscriptionId: ''
        });
        console.log(`Reverted user ${firebaseUID} to Free plan due to cancellation.`);
        break;
      
      default:
        console.log(`Unhandled Paddle event type: ${event.eventType}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Error handling Paddle webhook:', error);
    return new NextResponse(`Webhook Handler Error: ${error.message}`, { status: 500 });
  }
}
