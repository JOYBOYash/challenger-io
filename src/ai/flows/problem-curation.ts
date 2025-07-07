// src/ai/flows/problem-curation.ts
'use server';

/**
 * @fileOverview Curates coding problems based on the topic and skill level selected by the user.
 *
 * - curateProblem - A function that curates a coding problem based on user input.
 * - CurateProblemInput - The input type for the curateProblem function.
 * - CurateProblemOutput - The return type for the curateProblem function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CurateProblemInputSchema = z.object({
  topic: z.string().describe('The topic of the coding problem.'),
  skillLevel: z.string().describe('The skill level of the coding problem (Rookie, Crusader, Veteran).'),
});
export type CurateProblemInput = z.infer<typeof CurateProblemInputSchema>;

const CurateProblemOutputSchema = z.object({
  problemTitle: z.string().describe('The title of the coding problem.'),
  problemDescription: z.string().describe('The detailed description of the coding problem, including examples.'),
  difficulty: z.string().describe('The difficulty level of the coding problem.'),
  topic: z.string().describe('The topic of the coding problem.'),
  solution: z.string().optional().describe('The optimal solution to the coding problem in JavaScript.'),
});
export type CurateProblemOutput = z.infer<typeof CurateProblemOutputSchema>;

export async function curateProblem(input: CurateProblemInput): Promise<CurateProblemOutput> {
  return curateProblemFlow(input);
}

const curateProblemPrompt = ai.definePrompt({
  name: 'curateProblemPrompt',
  input: {schema: CurateProblemInputSchema},
  output: {schema: CurateProblemOutputSchema},
  prompt: `You are an expert LeetCode problem creator. Given a topic and skill level, you will generate a coding problem that is similar in style and structure to a real LeetCode problem.

The problem must be appropriate for the user's skill level.
- 'Rookie' corresponds to LeetCode Easy.
- 'Crusader' corresponds to LeetCode Medium.
- 'Veteran' corresponds to LeetCode Hard.

Topic: {{{topic}}}
Skill Level: {{{skillLevel}}}

Generate a unique coding problem with a title, a detailed description including one or two examples, the difficulty, and an optimal solution in JavaScript. The difficulty field in the output must match the skill level provided.
`,
  config: {
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
  },
});

const curateProblemFlow = ai.defineFlow(
  {
    name: 'curateProblemFlow',
    inputSchema: CurateProblemInputSchema,
    outputSchema: CurateProblemOutputSchema,
  },
  async input => {
    const {output} = await curateProblemPrompt(input);
    return output!;
  }
);
