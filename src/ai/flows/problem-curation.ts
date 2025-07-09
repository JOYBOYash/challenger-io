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
  solutions: z.object({
      javascript: z.string().describe('The optimal solution to the coding problem in JavaScript.'),
      python: z.string().describe('The optimal solution to the coding problem in Python.'),
      java: z.string().describe('The optimal solution to the coding problem in Java.'),
      csharp: z.string().describe('The optimal solution to the coding problem in C# (C-sharp).'),
      go: z.string().describe('The optimal solution to the coding problem in Go.'),
    }).describe('An object containing the optimal solution in various programming languages.'),
});
export type CurateProblemOutput = z.infer<typeof CurateProblemOutputSchema>;

export async function curateProblem(input: CurateProblemInput): Promise<CurateProblemOutput> {
  return curateProblemFlow(input);
}

const curateProblemPrompt = ai.definePrompt({
  name: 'curateProblemPrompt',
  input: {schema: CurateProblemInputSchema},
  output: {schema: CurateProblemOutputSchema},
  prompt: `You are an expert and highly creative LeetCode problem creator. Your task is to generate a UNIQUE and interesting coding problem based on a given topic and skill level.

**CRITICAL INSTRUCTIONS:**
1.  **DO NOT** generate common, textbook problems. Avoid well-known challenges like "Two Sum", "Reverse a String", "FizzBuzz", or any of the first 20 most popular problems on LeetCode. Your goal is to create something fresh that a user likely hasn't seen before.
2.  The problem must be similar in style and structure to a real LeetCode problem, with a clear description and at least one concrete example.
3.  The problem's difficulty **MUST** strictly match the user's skill level:
    *   'Rookie': Corresponds to LeetCode Easy. Should be solvable with basic data structures and algorithms.
    *   'Crusader': Corresponds to LeetCode Medium. May require more complex logic or a combination of data structures.
    *   'Veteran': Corresponds to LeetCode Hard. Should involve clever algorithms, complex data structures, or non-obvious insights.

Topic: {{{topic}}}
Skill Level: {{{skillLevel}}}

Generate a unique coding problem with a title, a detailed description including one or two examples, and the difficulty. The difficulty field in the output **must** match the skill level provided.

You must also provide optimal solutions for the problem in the following languages: JavaScript, Python, Java, C#, and Go. The output must include a 'solutions' object containing keys for 'javascript', 'python', 'java', 'csharp', and 'go', with the full code for each solution as the value. Be creative!`,
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
