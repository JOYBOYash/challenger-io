'use server';

import 'dotenv/config';
import { Paddle } from '@paddle/paddle-js/dist/node.mjs';
import { findUserById } from './user';
import { initializeFirebase } from '@/lib/firebase';

const paddle = new Paddle({
  apiKey: process.env.PADDLE_API_KEY!,
  environment: 'sandbox', // Use 'production' for live
});

async function getCurrentUserId() {
  const { auth } = initializeFirebase();
  if (!auth?.currentUser) {
    throw new Error('User not authenticated.');
  }
  return auth.currentUser.uid;
}

export async function createCheckoutLink(): Promise<{ checkoutURL?: string; error?: string }> {
  try {
    const userId = await getCurrentUserId();
    const user = await findUserById(userId);

    if (!user) {
      throw new Error('User not found.');
    }

    const priceId = process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID;
    if (!priceId) {
      throw new Error('Paddle Pro Price ID is not configured.');
    }

    const checkout = await paddle.transactions.create({
      items: [{ priceId, quantity: 1 }],
      customer: {
        email: user.email,
      },
      customData: {
        firebase_uid: userId,
      },
    });

    return { checkoutURL: checkout.url };
  } catch (error: any) {
    console.error('Error creating Paddle checkout link:', error);
    return { error: error.message || 'An unexpected error occurred.' };
  }
}
