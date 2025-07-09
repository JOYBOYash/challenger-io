'use server';

/**
 * @fileOverview Curates a batch of coding problems based on the topic and skill levels selected by the user.
 *
 * - curateProblems - A function that curates coding problems for multiple players in a single call.
 * - CurateProblemsInput - The input type for the curateProblems function.
 * - CurateProblemsOutput - The return type for the curateProblems function.
 * - Problem - The type for a single generated coding problem.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PlayerInputSchema = z.object({
  skillLevel: z.string().describe('The skill level for this player (Rookie, Crusader, Veteran).'),
});

const CurateProblemsInputSchema = z.object({
  topic: z.string().describe('The topic for all coding problems.'),
  players: z.array(PlayerInputSchema).describe('An array of players for whom to generate problems.'),
});
export type CurateProblemsInput = z.infer<typeof CurateProblemsInputSchema>;

const ProblemSchema = z.object({
  problemTitle: z.string().describe('The title of the coding problem.'),
  problemDescription: z.string().describe('The detailed description of the coding problem, including examples.'),
  difficulty: z.string().describe('The difficulty level of the coding problem. This MUST match the requested skill level.'),
  topic: z.string().describe('The topic of the coding problem.'),
  solutions: z.object({
    javascript: z.string().describe('The optimal solution to the coding problem in JavaScript.'),
    python: z.string().describe('The optimal solution to the coding problem in Python.'),
    java: z.string().describe('The optimal solution to the coding problem in Java.'),
    csharp: z.string().describe('The optimal solution to the coding problem in C# (C-sharp).'),
    go: z.string().describe('The optimal solution to the coding problem in Go.'),
  }).describe('An object containing the optimal solution in various programming languages.'),
});
export type Problem = z.infer<typeof ProblemSchema>;

export const CurateProblemsOutputSchema = z.object({
    problems: z.array(ProblemSchema).describe('An array of generated coding problems, one for each player input.'),
});
export type CurateProblemsOutput = z.infer<typeof CurateProblemsOutputSchema>;

export async function curateProblems(input: CurateProblemsInput): Promise<CurateProblemsOutput> {
  return curateProblemsFlow(input);
}

const curateProblemsPrompt = ai.definePrompt({
  name: 'curateProblemsPrompt',
  input: {schema: CurateProblemsInputSchema},
  output: {schema: CurateProblemsOutputSchema},
  prompt: `You are an expert and highly creative LeetCode problem creator. Your task is to generate a batch of UNIQUE and interesting coding problems based on a given topic and a list of player skill levels.

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

Your final output must be a JSON object with a single key "problems" which is an array of problem objects.`,
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

const curateProblemsFlow = ai.defineFlow(
  {
    name: 'curateProblemsFlow',
    inputSchema: CurateProblemsInputSchema,
    outputSchema: CurateProblemsOutputSchema,
  },
  async input => {
    const {output} = await curateProblemsPrompt(input);
    return output!;
  }
);
