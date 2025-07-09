'use server';

/**
 * @fileOverview Curates coding problems by finding classic problems on a platform and using AI to generate full descriptions and solutions.
 *
 * - curatePlatformInspiredProblems - Fetches problem metadata from Codeforces and uses AI to flesh them out.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { CurateProblemsInput, CurateProblemsOutput } from './problem-types';
import { CurateProblemsOutputSchema } from './problem-types';

// Define the shape of a single problem's metadata for the AI prompt
const ProblemMetadataSchema = z.object({
    problemTitle: z.string(),
    difficulty: z.string(),
    tags: z.array(z.string()),
});

// Define the input for the batch generation prompt
const FleshOutProblemsInputSchema = z.object({
    topic: z.string(),
    problems: z.array(ProblemMetadataSchema),
});

interface CodeforcesProblem {
    contestId: number;
    index: string;
    name: string;
    rating: number;
    tags: string[];
    problemsetName?: string;
}

const SKILL_RATING_MAP: Record<string, { min: number, max: number }> = {
    Rookie: { min: 800, max: 1200 },
    Crusader: { min: 1201, max: 1600 },
    Veteran: { min: 1601, max: 2200 }
};

const TOPIC_TAG_MAP: Record<string, string[]> = {
    'Data Structures': ['data structures', 'trees', 'graphs', 'strings'],
    'Algorithms': ['dp', 'binary search', 'sortings', 'greedy', 'math', 'number theory', 'two pointers'],
};

export async function curatePlatformInspiredProblems(input: CurateProblemsInput): Promise<CurateProblemsOutput> {
    const { topic, players } = input;
    
    // 1. Fetch all problems from Codeforces
    const allProblemsResponse = await fetch('https://codeforces.com/api/problemset.problems');
    if (!allProblemsResponse.ok) {
        throw new Error("Failed to fetch problems from Codeforces API");
    }
    const data = await allProblemsResponse.json();
    if (data.status !== 'OK') {
        throw new Error("Codeforces API did not return OK status");
    }
    let allProblems: CodeforcesProblem[] = data.result.problems;

    const problemMetadataList: z.infer<typeof ProblemMetadataSchema>[] = [];
    const usedProblemNames: Set<string> = new Set();
    const relevantTags = TOPIC_TAG_MAP[topic] || [];

    // 2. Select a problem for each player
    for (const player of players) {
        const ratingRange = SKILL_RATING_MAP[player.skillLevel] || SKILL_RATING_MAP['Rookie'];

        let suitableProblems = allProblems.filter(p =>
            p.rating >= ratingRange.min &&
            p.rating <= ratingRange.max &&
            !usedProblemNames.has(p.name) &&
            (relevantTags.length === 0 || p.tags.some(tag => relevantTags.includes(tag)))
        );
        
        if (suitableProblems.length === 0) {
            suitableProblems = allProblems.filter(p =>
                p.rating >= ratingRange.min &&
                p.rating <= ratingRange.max &&
                !usedProblemNames.has(p.name)
            );
        }

        if (suitableProblems.length === 0) {
             throw new Error(`Could not find any unique problems for player with skill: ${player.skillLevel}`);
        }
        
        const randomProblem = suitableProblems[Math.floor(Math.random() * suitableProblems.length)];
        usedProblemNames.add(randomProblem.name);

        problemMetadataList.push({
            problemTitle: randomProblem.name,
            difficulty: player.skillLevel,
            tags: randomProblem.tags,
        });
    }

    // 3. Call the AI to flesh out the problems in a single batch
    const result = await fleshOutProblemsFlow({
        topic,
        problems: problemMetadataList,
    });

    if (!result) {
         throw new Error("AI failed to generate problems from metadata.");
    }

    // Ensure the output from the AI matches the requested problem count
    if (result.problems.length !== players.length) {
        throw new Error("AI did not return the correct number of problems.");
    }
    
    return result;
}

const fleshOutProblemsPrompt = ai.definePrompt({
    name: 'fleshOutProblemsPrompt',
    input: { schema: FleshOutProblemsInputSchema },
    output: { schema: CurateProblemsOutputSchema },
    prompt: `You are an expert problem creator who reconstructs classic programming challenges based on their metadata.
You will be given a topic and a list of problems, each with a title, difficulty, and tags.
For EACH problem in the list, you MUST generate a complete, detailed problem description with at least one clear example.
The description should be plausible and match the given metadata.
The problem's difficulty in your output MUST strictly match the requested difficulty.
Then, for each problem, provide optimal solutions in JavaScript, Python, Java, C#, and Go.

The topic for all problems is: {{{topic}}}

Reconstruct the following problems:
{{#each problems}}
- Problem Title: "{{this.problemTitle}}"
  - Difficulty: {{this.difficulty}}
  - Tags: {{#each this.tags}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{/each}}

Your final output must be a JSON object with a single key "problems" which is an array of fully-fleshed out problem objects, one for each problem in the input list.
The order must be preserved.`,
    config: {
        safetySettings: [
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
        ],
    },
});

const fleshOutProblemsFlow = ai.defineFlow({
    name: 'fleshOutProblemsFlow',
    inputSchema: FleshOutProblemsInputSchema,
    outputSchema: CurateProblemsOutputSchema,
}, async (input) => {
    const { output } = await fleshOutProblemsPrompt(input);
    if (!output) {
        throw new Error("AI failed to generate problems from metadata.");
    }
    // The AI needs to be reminded of the topic, as it might get lost in the reconstruction
    output.problems.forEach(p => {
      if (!p.topic) {
        p.topic = input.topic
      }
    });
    return output;
});
