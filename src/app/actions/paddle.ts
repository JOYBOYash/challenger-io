'use server';

import 'dotenv/config';
import { Paddle } from '@paddle/paddle-js';
import { findUserById, updateUserProfile } from './user';
import { initializeFirebase } from '@/lib/firebase';

const paddle = new Paddle({
  vendor: Number(process.env.PADDLE_VENDOR_ID),
  authCode: process.env.PADDLE_AUTH_CODE!,
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

    const checkout = await paddle.checkouts.create({
      items: [{ priceId }],
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
