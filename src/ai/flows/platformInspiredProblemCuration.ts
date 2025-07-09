'use server';

/**
 * @fileOverview Fetches coding problems directly from the Codeforces platform API.
 *
 * - fetchPlatformProblems - A function that fetches coding problems for multiple players.
 * - CurateProblemsInput - The input type for the function (reused from problem-types).
 * - CurateProblemsOutput - The return type for the function (reused from problem-types).
 */
import type { CurateProblemsInput, CurateProblemsOutput, Problem } from './problem-types';

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

// Simple mapping from broad topics to specific Codeforces tags
const TOPIC_TAG_MAP: Record<string, string[]> = {
    'Data Structures': ['data structures', 'trees', 'graphs', 'strings'],
    'Algorithms': ['dp', 'binary search', 'sortings', 'greedy', 'math', 'number theory', 'two pointers'],
    // Other topics like JS, React, SQL don't map well and will be ignored in tag filtering.
};


export async function fetchPlatformProblems(input: CurateProblemsInput): Promise<CurateProblemsOutput> {
    const { topic, players } = input;
    
    // Fetch all problems from Codeforces
    const allProblemsResponse = await fetch('https://codeforces.com/api/problemset.problems');
    if (!allProblemsResponse.ok) {
        throw new Error("Failed to fetch problems from Codeforces API");
    }
    const data = await allProblemsResponse.json();
    if (data.status !== 'OK') {
        throw new Error("Codeforces API did not return OK status");
    }
    let allProblems: CodeforcesProblem[] = data.result.problems;

    const relevantTags = TOPIC_TAG_MAP[topic] || [];

    const generatedProblems: Problem[] = [];
    const usedProblemNames: Set<string> = new Set();

    for (const player of players) {
        const ratingRange = SKILL_RATING_MAP[player.skillLevel] || SKILL_RATING_MAP['Rookie'];

        let suitableProblems = allProblems.filter(p =>
            p.rating >= ratingRange.min &&
            p.rating <= ratingRange.max &&
            !usedProblemNames.has(p.name) &&
            (relevantTags.length === 0 || p.tags.some(tag => relevantTags.includes(tag)))
        );
        
        // If no problems match the topic, fall back to any problem in the difficulty range
        if (suitableProblems.length === 0) {
            suitableProblems = allProblems.filter(p =>
                p.rating >= ratingRange.min &&
                p.rating <= ratingRange.max &&
                !usedProblemNames.has(p.name)
            );
        }

        if (suitableProblems.length === 0) {
            // As a last resort, find any problem not yet used. This should be rare.
            suitableProblems = allProblems.filter(p => !usedProblemNames.has(p.name));
            if (suitableProblems.length === 0) {
                 throw new Error(`Could not find any unique problems for player with skill: ${player.skillLevel}`);
            }
        }
        
        const randomProblem = suitableProblems[Math.floor(Math.random() * suitableProblems.length)];
        usedProblemNames.add(randomProblem.name);

        const problem: Problem = {
            problemTitle: randomProblem.name,
            difficulty: player.skillLevel, // Assign the requested skill level, not the exact rating
            topic: topic,
            url: `https://codeforces.com/problemset/problem/${randomProblem.contestId}/${randomProblem.index}`
        };
        generatedProblems.push(problem);
    }
    
    if (generatedProblems.length !== players.length) {
        throw new Error("Failed to generate a problem for each player.");
    }

    return { problems: generatedProblems };
}
