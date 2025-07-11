'use server';

import 'dotenv/config';
import { findUserById } from './user';

const PADDLE_API_URL = 'https://sandbox-api.paddle.com';

export interface PaddleProduct {
    id: string;
    name: string;
    description: string;
    prices: PaddlePrice[];
}

export interface PaddlePrice {
    id: string;
    description: string;
    billing_cycle: {
        interval: 'month' | 'year';
    } | null;
    unit_price: {
        amount: string;
        currency_code: string;
    };
}


export async function getProducts(): Promise<{ products?: PaddleProduct[]; error?: string }> {
    const apiKey = process.env.PADDLE_API_KEY;
    if (!apiKey) {
      console.error('Paddle API Key is not configured.');
      return { error: 'Paddle API Key is not configured.' };
    }

    try {
        const response = await fetch(`${PADDLE_API_URL}/products?include=prices`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Paddle API Error:', data);
            const errorMessage = data?.error?.detail || 'Failed to fetch Paddle products.';
            throw new Error(errorMessage);
        }

        return { products: data.data };

    } catch (error: any) {
        console.error('Error fetching Paddle products:', error);
        return { error: error.message || 'An unexpected error occurred.' };
    }
}


export async function createCheckoutLink(userId: string, priceId: string): Promise<{ checkoutURL?: string; error?: string }> {
  try {
    if (!userId) {
      throw new Error('User not authenticated.');
    }
    const user = await findUserById(userId);

    if (!user) {
      throw new Error('User not found.');
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
