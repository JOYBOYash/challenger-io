/**
 * @fileOverview Shared types and schemas for problem curation flows.
 */
import {z} from 'genkit';

export const PlayerInputSchema = z.object({
  skillLevel: z.string().describe('The skill level for this player (Rookie, Crusader, Veteran).'),
});

export const CurateProblemsInputSchema = z.object({
  topic: z.string().describe('The topic for all coding problems.'),
  players: z.array(PlayerInputSchema).describe('An array of players for whom to generate problems.'),
});
export type CurateProblemsInput = z.infer<typeof CurateProblemsInputSchema>;

export const ProblemSchema = z.object({
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
  url: z.string().url().describe("The URL to the original problem if sourced from a platform.").optional(),
});
export type Problem = z.infer<typeof ProblemSchema>;

export const CurateProblemsOutputSchema = z.object({
    problems: z.array(ProblemSchema).describe('An array of generated coding problems, one for each player input.'),
});
export type CurateProblemsOutput = z.infer<typeof CurateProblemsOutputSchema>;
