'use server';

import 'dotenv/config';
import { findUserById } from './user';
import { initializeFirebase } from '@/lib/firebase';

const PADDLE_API_URL = 'https://sandbox-api.paddle.com'; // Use 'https://api.paddle.com' for production

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
    
    const apiKey = process.env.PADDLE_API_KEY;
    if (!apiKey) {
      throw new Error('Paddle API Key is not configured.');
    }

    const response = await fetch(`${PADDLE_API_URL}/transactions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            items: [{ price_id: priceId, quantity: 1 }],
            customer: {
                email: user.email,
            },
            custom_data: {
                firebase_uid: userId,
            },
            // This URL is required by Paddle's API
            'checkout': {
                'settings': {
                    'success_url': `${process.env.NEXT_PUBLIC_APP_URL}/profile?paddle_success=true`
                }
            }
        }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Paddle API Error:', data);
      const errorMessage = data?.error?.detail || 'Failed to create Paddle checkout.';
      throw new Error(errorMessage);
    }
    
    return { checkoutURL: data.data.url };

  } catch (error: any) {
    console.error('Error creating Paddle checkout link:', error);
    return { error: error.message || 'An unexpected error occurred.' };
  }
}
