'use server';

/**
 * @fileOverview Fetches classic coding problems from the Codeforces platform.
 *
 * - fetchPlatformProblems - Fetches problem metadata from Codeforces.
 */
import type {z} from 'genkit';
import type {CurateProblemsInput, CurateProblemsOutput} from './problem-types';

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

export async function fetchPlatformProblems(
  input: CurateProblemsInput
): Promise<CurateProblemsOutput> {
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

  const problems: z.infer<z.ZodType<any, any, any>>[] = [];
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
      // If we still can't find a problem, we might have to reuse one.
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

    problems.push({
      problemTitle: randomProblem.name,
      difficulty: player.skillLevel,
      topic: topic,
      url: `https://codeforces.com/problemset/problem/${randomProblem.contestId}/${randomProblem.index}`,
      problemDescription: `This is a classic problem from Codeforces titled "${randomProblem.name}". View the full details and submit your solution on their platform.`,
    });
  }

  return {problems};
}
