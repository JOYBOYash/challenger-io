import { NextRequest, NextResponse } from 'next/server';
import { Paddle } from '@paddle/paddle-js/dist/node.mjs';
import { updateUserProfile } from '@/app/actions/user';
import 'dotenv/config';

const paddle = new Paddle({
  apiKey: process.env.PADDLE_API_KEY!,
  environment: 'sandbox', // Use 'production' for live
});

export async function POST(req: NextRequest) {
  const signature = req.headers.get('paddle-signature')!;
  const rawBody = await req.text();
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET!;

  try {
    const event = paddle.webhooks.unmarshal(rawBody, webhookSecret, signature);
    if (!event) {
        return new NextResponse('Invalid signature.', { status: 400 });
    }
    
    console.log(`✅ Paddle Webhook Received: ${event.eventType}`);

    const firebaseUID = event.data.custom_data?.firebase_uid;
    
    if (!firebaseUID) {
      console.warn('No firebase_uid found in event custom_data.');
      return NextResponse.json({ received: true, message: "No UID found." });
    }

    switch (event.eventType) {
      case 'transaction.completed':
         const status = event.data.status;
         // Check if this transaction is for a subscription product
         const isSubscription = event.data.items.some(item => item.product?.custom_data?.is_subscription === 'true');
         if (status === 'completed' && isSubscription) {
           await updateUserProfile(firebaseUID, {
             plan: 'pro',
             paddleCustomerId: event.data.customer_id,
             paddleSubscriptionId: event.data.subscription_id
           });
           console.log(`Updated user ${firebaseUID} to Pro plan.`);
         }
        break;

      case 'subscription.updated':
      case 'subscription.activated':
        await updateUserProfile(firebaseUID, {
          plan: 'pro',
          paddleCustomerId: event.data.customer_id,
          paddleSubscriptionId: event.data.id
        });
        console.log(`Updated user ${firebaseUID} subscription to Pro plan.`);
        break;
      
      case 'subscription.canceled':
      case 'subscription.paused':
        await updateUserProfile(firebaseUID, {
          plan: 'free',
          paddleSubscriptionId: ''
        });
        console.log(`Reverted user ${firebaseUID} to Free plan due to status: ${event.eventType}.`);
        break;
      
      default:
        console.log(`Unhandled Paddle event type: ${event.eventType}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Error handling Paddle webhook:', error.message);
    return new NextResponse(`Webhook Handler Error: ${error.message}`, { status: 500 });
  }
}
