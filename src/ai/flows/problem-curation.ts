'use server';

/**
 * @fileOverview Curates a batch of coding problems based on the topic and skill levels selected by the user.
 *
 * - curateProblems - A function that curates coding problems for multiple players in a single call.
 * - CurateProblemsInput - The input type for the curateProblems function.
 * - CurateProblemsOutput - The return type for the curateProblems function.
 * - Problem - The type for a single generated coding problem.
 */

import {ai, proAi} from '@/ai/genkit';
import {z} from 'genkit';
import {
    CurateProblemsInputSchema as BaseCurateProblemsInputSchema,
    CurateProblemsOutputSchema,
    type Problem,
} from './problem-types';
import type { CurateProblemsOutput } from './problem-types';

// Extend the base schema to include the user's plan
const CurateProblemsInputSchema = BaseCurateProblemsInputSchema.extend({
    userPlan: z.enum(['free', 'pro']).default('free'),
});

export type CurateProblemsInput = z.infer<typeof CurateProblemsInputSchema>;
export type { CurateProblemsOutput, Problem };


export async function curateProblems(input: CurateProblemsInput): Promise<CurateProblemsOutput> {
  return curateProblemsFlow(input);
}

const promptText = `You are an expert and highly creative LeetCode problem creator. Your task is to generate a batch of UNIQUE and interesting coding problems based on a given topic and a list of player skill levels.

**CRITICAL INSTRUCTIONS:**
1.  **DO NOT** generate common, textbook problems. Avoid well-known challenges like "Two Sum", "Reverse a String", "FizzBuzz", etc. Your goal is to create something fresh that a user likely hasn't seen before.
2.  You will be given an array of players, each with a specified skill level. You **MUST** generate one unique problem for each player in the input array.
3.  The problem's difficulty **MUST** strictly match the requested skill level for each problem:
    *   'Rookie': Corresponds to LeetCode Easy.
    *   'Crusader': Corresponds to LeetCode Medium.
    *   'Veteran': Corresponds to LeetCode Hard.
4.  For each problem, provide a title, a detailed description with at least one example, the difficulty, and optimal solutions in JavaScript, Python, Java, C#, and Go.
5.  The number of problems in your output array **MUST EXACTLY** match the number of players in the input array. The order of problems in the output array should correspond to the order of players in the input array.

Topic for all problems: {{{topic}}}

Generate a problem for each of the following players:
{{#each players}}
- Player with skill level: {{{this.skillLevel}}}
{{/each}}

Your final output must be a JSON object with a single key "problems" which is an array of problem objects.`;

const commonConfig = {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
    ],
};

// Prompt for Free Tier (Gemini)
const curateProblemsPrompt = ai.definePrompt({
  name: 'curateProblemsPrompt',
  input: {schema: CurateProblemsInputSchema},
  output: {schema: CurateProblemsOutputSchema},
  prompt: promptText,
  config: commonConfig,
});

// Prompt for Pro Tier (Groq)
const curateProProblemsPrompt = proAi.definePrompt({
    name: 'curateProProblemsPrompt',
    input: { schema: CurateProblemsInputSchema },
    output: { schema: CurateProblemsOutputSchema },
    prompt: promptText,
    config: commonConfig,
});

const curateProblemsFlow = ai.defineFlow(
  {
    name: 'curateProblemsFlow',
    inputSchema: CurateProblemsInputSchema,
    outputSchema: CurateProblemsOutputSchema,
  },
  async input => {
    if (input.userPlan === 'pro') {
        console.log("Using Pro (Groq) model for problem generation.");
        const {output} = await curateProProblemsPrompt(input);
        return output!;
    }
    
    console.log("Using Free (Gemini) model for problem generation.");
    const {output} = await curateProblemsPrompt(input);
    return output!;
  }
);
