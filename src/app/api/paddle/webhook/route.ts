import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { updateUserProfile } from '@/app/actions/user';
import 'dotenv/config';


// Helper function to verify the Paddle signature
function isValidSignature(
    webhookSignature: string,
    webhookSecret: string,
    rawBody: string
): boolean {
    if (!webhookSignature) {
        return false;
    }

    const [timestampPart, signaturePart] = webhookSignature.split(';');
    const timestamp = timestampPart?.split('=')[1];
    const signature = signaturePart?.split('=')[1];

    if (!timestamp || !signature) {
        return false;
    }
    
    const signedPayload = `${timestamp}:${rawBody}`;
    const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(signedPayload)
        .digest('hex');

    return signature === expectedSignature;
}


export async function POST(req: NextRequest) {
  const signature = req.headers.get('paddle-signature')!;
  const rawBody = await req.text();
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET!;

  if (!isValidSignature(signature, webhookSecret, rawBody)) {
    return new NextResponse('Invalid signature.', { status: 400 });
  }

  try {
    const event = JSON.parse(rawBody);
    
    console.log(`✅ Paddle Webhook Received: ${event.event_type}`);

    const firebaseUID = event.data.custom_data?.firebase_uid;
    
    if (!firebaseUID) {
      console.warn('No firebase_uid found in event custom_data.');
      return NextResponse.json({ received: true, message: "No UID found." });
    }

    switch (event.event_type) {
      case 'transaction.completed':
         const status = event.data.status;
         // Check if this transaction is for a subscription product
         if (status === 'completed' && event.data.billing_details) {
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
        console.log(`Reverted user ${firebaseUID} to Free plan due to status: ${event.event_type}.`);
        break;
      
      default:
        console.log(`Unhandled Paddle event type: ${event.event_type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Error handling Paddle webhook:', error.message);
    return new NextResponse(`Webhook Handler Error: ${error.message}`, { status: 500 });
  }
}
