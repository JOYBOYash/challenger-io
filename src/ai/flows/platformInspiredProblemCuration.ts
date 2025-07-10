'use server';

/**
 * @fileOverview Fetches classic coding problem metadata from the Codeforces platform
 * and then uses an AI to generate the full problem details and solutions.
 *
 * - curatePlatformInspiredProblems - The main function to handle the process.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  CurateProblemsInputSchema,
  CurateProblemsOutputSchema,
  type CurateProblemsInput,
  type CurateProblemsOutput,
} from './problem-types';
export type {CurateProblemsInput, CurateProblemsOutput};

interface CodeforcesProblem {
  contestId: number;
  index: string;
  name: string;
  rating: number;
  tags: string[];
  problemsetName?: string;
}

const SKILL_RATING_MAP: Record<string, {min: number; max: number}> = {
  Rookie: {min: 800, max: 1200},
  Crusader: {min: 1201, max: 1600},
  Veteran: {min: 1601, max: 2200},
};

const TOPIC_TAG_MAP: Record<string, string[]> = {
  'Data Structures': ['data structures', 'trees', 'graphs', 'strings'],
  Algorithms: [
    'dp',
    'binary search',
    'sortings',
    'greedy',
    'math',
    'number theory',
    'two pointers',
  ],
};

const PlatformInspiredProblemMetadataSchema = z.object({
  problemTitle: z.string(),
  difficulty: z.string(),
  topic: z.string(),
  url: z.string(),
});

const PlatformInspiredInputSchema = z.object({
  problemsMetadata: z.array(PlatformInspiredProblemMetadataSchema),
});


async function fetchProblemMetadata(
  input: CurateProblemsInput
): Promise<z.infer<typeof PlatformInspiredInputSchema>> {
  const {topic, players} = input;

  // 1. Fetch all problems from Codeforces
  const allProblemsResponse = await fetch(
    'https://codeforces.com/api/problemset.problems'
  );
  if (!allProblemsResponse.ok) {
    throw new Error('Failed to fetch problems from Codeforces API');
  }
  const data = await allProblemsResponse.json();
  if (data.status !== 'OK') {
    throw new Error('Codeforces API did not return OK status');
  }
  let allProblems: CodeforcesProblem[] = data.result.problems;

  const problemsMetadata: z.infer<typeof PlatformInspiredProblemMetadataSchema>[] = [];
  const usedProblemNames: Set<string> = new Set();
  const relevantTags = TOPIC_TAG_MAP[topic] || [];

  // 2. Select a problem for each player
  for (const player of players) {
    const ratingRange =
      SKILL_RATING_MAP[player.skillLevel] || SKILL_RATING_MAP['Rookie'];

    let suitableProblems = allProblems.filter(
      p =>
        p.rating >= ratingRange.min &&
        p.rating <= ratingRange.max &&
        !usedProblemNames.has(p.name) &&
        (relevantTags.length === 0 ||
          p.tags.some(tag => relevantTags.includes(tag)))
    );

    if (suitableProblems.length === 0) {
      suitableProblems = allProblems.filter(
        p =>
          p.rating >= ratingRange.min &&
          p.rating <= ratingRange.max &&
          !usedProblemNames.has(p.name)
      );
    }

    if (suitableProblems.length === 0) {
      console.warn(
        `Could not find any unique problems for player with skill: ${player.skillLevel}. Reusing problems might occur.`
      );
      suitableProblems = allProblems.filter(
        p => p.rating >= ratingRange.min && p.rating <= ratingRange.max
      );
      if (suitableProblems.length === 0) {
        throw new Error(
          `Could not find any problems for player with skill: ${player.skillLevel}`
        );
      }
    }

    const randomProblem =
      suitableProblems[Math.floor(Math.random() * suitableProblems.length)];
    usedProblemNames.add(randomProblem.name);

    problemsMetadata.push({
      problemTitle: randomProblem.name,
      difficulty: player.skillLevel,
      topic: topic,
      url: `https://codeforces.com/problemset/problem/${randomProblem.contestId}/${randomProblem.index}`,
    });
  }

  return {problemsMetadata};
}


export async function curatePlatformInspiredProblems(input: CurateProblemsInput): Promise<CurateProblemsOutput> {
  // Step 1: Fetch metadata from Codeforces
  const problemsMetadata = await fetchProblemMetadata(input);

  // Step 2: Use AI to flesh out the problems
  const fleshedOutProblems = await fleshOutProblemsFlow(problemsMetadata);

  return fleshedOutProblems;
}

const fleshOutProblemsPrompt = ai.definePrompt({
    name: 'fleshOutProblemsPrompt',
    input: {schema: PlatformInspiredInputSchema},
    output: {schema: CurateProblemsOutputSchema},
    prompt: `You are an expert and highly creative LeetCode problem creator. Your task is to take a batch of problem titles and metadata and generate full, detailed coding problems based on them.

**CRITICAL INSTRUCTIONS:**
1. You will be given an array of problem metadata objects.
2. For each object, you MUST generate a complete coding problem including:
    - A detailed **problemDescription** with at least one clear example. The description should be inspired by the provided 'problemTitle' but be creative and elaborate on it.
    - **solutions**: An object containing optimal solutions in JavaScript, Python, Java, C#, and Go.
3. The problem's **difficulty** and **topic** MUST EXACTLY match what is provided in the metadata.
4. The **problemTitle** in your output MUST EXACTLY match the title from the input metadata.
5. The number of problems in your output array MUST EXACTLY match the number of metadata objects in the input array.

Here is the metadata for the problems to generate:
{{#each problemsMetadata}}
- Title: {{{this.problemTitle}}}
  - Difficulty: {{{this.difficulty}}}
  - Topic: {{{this.topic}}}
  - Original URL (for context): {{{this.url}}}
{{/each}}

Your final output must be a JSON object with a single key "problems" which is an array of problem objects, fully fleshed out as per the instructions.`,
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

const fleshOutProblemsFlow = ai.defineFlow({
    name: 'fleshOutProblemsFlow',
    inputSchema: PlatformInspiredInputSchema,
    outputSchema: CurateProblemsOutputSchema,
}, async (input) => {
    const { output } = await fleshOutProblemsPrompt(input);
    if (!output) {
        throw new Error("AI failed to generate problems from metadata.");
    }
    return output;
});
