import { configureGenkit, genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { groq } from 'genkitx-groq';

// Default AI for Free tier
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash-latest',
});

// Pro tier using Groq
export const proAi = genkit({
  plugins: [
    groq({
      apiKey: process.env.GROQ_API_KEY || '',
    }),
  ],
  model: 'groq/gemma-7b-it',
});
