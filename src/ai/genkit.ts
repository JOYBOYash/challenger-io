import { configureGenkit, genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Default AI for all tiers
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash-latest',
});

// Pro tier functionality is now handled by usage limits, not a different model.
export const proAi = ai;
