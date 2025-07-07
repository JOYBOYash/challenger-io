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
  skillLevel: z.string().describe('The skill level of the coding problem (Rookie, Intermediate, Veteran).'),
});
export type CurateProblemInput = z.infer<typeof CurateProblemInputSchema>;

const CurateProblemOutputSchema = z.object({
  problemTitle: z.string().describe('The title of the coding problem.'),
  problemDescription: z.string().describe('The description of the coding problem.'),
  difficulty: z.string().describe('The difficulty level of the coding problem.'),
  topic: z.string().describe('The topic of the coding problem.'),
  solution: z.string().optional().describe('The optimal solution to the coding problem.'),
});
export type CurateProblemOutput = z.infer<typeof CurateProblemOutputSchema>;

export async function curateProblem(input: CurateProblemInput): Promise<CurateProblemOutput> {
  return curateProblemFlow(input);
}

const curateProblemPrompt = ai.definePrompt({
  name: 'curateProblemPrompt',
  input: {schema: CurateProblemInputSchema},
  output: {schema: CurateProblemOutputSchema},
  prompt: `You are an expert coding problem curator. Given the topic and skill level, you will generate a coding problem that is appropriate for the user.

Topic: {{{topic}}}
Skill Level: {{{skillLevel}}}

Generate a coding problem with a title, description, difficulty, and optimal solution that is tailored to the topic and skill level. The difficulty should match the skill level.
`,config: {
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
