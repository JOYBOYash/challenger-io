'use server';

/**
 * @fileOverview Curates a batch of coding problems inspired by real problems from a competitive programming platform.
 *
 * - curatePlatformInspiredProblems - A function that creates coding problems for multiple players in a single call.
 * - CurateProblemsInput - The input type for the function (reused from problem-curation).
 * - CurateProblemsOutput - The return type for the function (reused from problem-curation).
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { CurateProblemsInput, CurateProblemsOutput, Problem } from './problem-types';
import { CurateProblemsOutputSchema } from './problem-types';

// Re-exporting types for consistency
export type { CurateProblemsInput, CurateProblemsOutput, Problem };

interface CodeforcesProblem {
    contestId: number;
    index: string;
    name: string;
    rating: number;
    tags: string[];
}

const SKILL_RATING_MAP: Record<string, { min: number, max: number }> = {
    Rookie: { min: 800, max: 1200 },
    Crusader: { min: 1201, max: 1600 },
    Veteran: { min: 1601, max: 2200 }
};

async function fetchInspirationProblem(skillLevel: string, existingProblems: CodeforcesProblem[]): Promise<CodeforcesProblem | null> {
    const ratingRange = SKILL_RATING_MAP[skillLevel] || SKILL_RATING_MAP['Rookie'];
    const suitableProblems = existingProblems.filter(p => p.rating >= ratingRange.min && p.rating <= ratingRange.max);
    
    if (suitableProblems.length === 0) {
        // Fallback to any problem if no suitable ones are found
        return existingProblems[Math.floor(Math.random() * existingProblems.length)];
    }
    const randomProblem = suitableProblems[Math.floor(Math.random() * suitableProblems.length)];
    return randomProblem;
}

const PlayerInspirationSchema = z.object({
  skillLevel: z.string(),
  inspiration: z.object({
    name: z.string(),
    tags: z.array(z.string()),
  }),
});

const PlatformInspiredBatchInputSchema = z.object({
  topic: z.string(),
  players: z.array(PlayerInspirationSchema),
});

const platformInspiredBatchPrompt = ai.definePrompt({
  name: 'platformInspiredBatchPrompt',
  input: {schema: PlatformInspiredBatchInputSchema},
  output: {schema: CurateProblemsOutputSchema},
  prompt: `You are an expert and highly creative LeetCode problem creator. Your task is to generate a batch of UNIQUE and interesting coding problems. Each problem should be INSPIRED BY, but NOT a copy of, a real problem from a competitive programming platform.

**CRITICAL INSTRUCTIONS:**
1.  You will be given an array of players, each with a skill level and an "inspiration problem" (name and tags).
2.  For each player, use their inspiration as a creative starting point. **DO NOT** simply re-create the original problem. Invent a new scenario, a new story, or a twist on the core concept.
3.  The generated problem's difficulty **MUST** strictly match the requested skill level for that player:
    *   'Rookie': Corresponds to LeetCode Easy.
    *   'Crusader': Corresponds to LeetCode Medium.
    *   'Veteran': Corresponds to LeetCode Hard.
4.  For each problem, provide a creative title, a detailed description with at least one clear example, the difficulty, the original topic, and optimal solutions in JavaScript, Python, Java, C#, and Go.
5. The number of problems in your output array **MUST EXACTLY** match the number of players in the input array. The order of problems should correspond to the order of players.

**General Topic for all problems:** {{{topic}}}

**Generate a unique problem for each of the following players:**
{{#each players}}
- **Player with skill level: {{{this.skillLevel}}}**
  - Inspiration Name: {{{this.inspiration.name}}}
  - Inspiration Tags: {{#each this.inspiration.tags}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{/each}}

Your final output must be a JSON object with a single key "problems" which is an array of problem objects.`,
});


export async function curatePlatformInspiredProblems(input: CurateProblemsInput): Promise<CurateProblemsOutput> {
    const allProblemsResponse = await fetch('https://codeforces.com/api/problemset.problems');
    if (!allProblemsResponse.ok) {
        throw new Error("Failed to fetch problems from Codeforces API");
    }
    const data = await allProblemsResponse.json();
    if (data.status !== 'OK') {
        throw new Error("Codeforces API did not return OK status");
    }
    const allProblems: CodeforcesProblem[] = data.result.problems;

    const playerInspirations = await Promise.all(
        input.players.map(async (player) => {
            const inspiration = await fetchInspirationProblem(player.skillLevel, allProblems);
            if (!inspiration) {
                throw new Error(`Could not find an inspiration problem for skill level: ${player.skillLevel}`);
            }
            return {
                skillLevel: player.skillLevel,
                inspiration: {
                    name: inspiration.name,
                    tags: inspiration.tags,
                }
            };
        })
    );

    const { output } = await platformInspiredBatchPrompt({
        topic: input.topic,
        players: playerInspirations,
    });

    if (!output || output.problems.length !== input.players.length) {
        throw new Error("AI failed to generate the correct number of platform-inspired problems.");
    }

    return output;
}
