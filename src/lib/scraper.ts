// LeetCode URL scraper for importing problems when online

import { Problem, Difficulty } from '../data/problems';
import { addProblem } from './storage';

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

interface LeetCodeGraphQLResponse {
  data: {
    question: {
      questionId: string;
      questionFrontendId: string;
      title: string;
      titleSlug: string;
      difficulty: string;
      content: string;
      topicTags: Array<{ name: string; slug: string }>;
      codeSnippets: Array<{ lang: string; langSlug: string; code: string }>;
      exampleTestcases: string;
      sampleTestCase: string;
    };
  };
}

// Extract slug from LeetCode URL
export function extractSlugFromUrl(url: string): string | null {
  const patterns = [
    /leetcode\.com\/problems\/([^\/]+)/,
    /leetcode\.cn\/problems\/([^\/]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1].replace(/\/$/, '');
    }
  }

  return null;
}

// Fetch problem data from LeetCode GraphQL API
async function fetchProblemFromAPI(slug: string): Promise<LeetCodeGraphQLResponse['data']['question'] | null> {
  const query = `
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId
        questionFrontendId
        title
        titleSlug
        difficulty
        content
        topicTags {
          name
          slug
        }
        codeSnippets {
          lang
          langSlug
          code
        }
        exampleTestcases
        sampleTestCase
      }
    }
  `;

  const body = JSON.stringify({
    query,
    variables: { titleSlug: slug },
  });

  try {
    // Try direct API call first
    let response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });

    if (!response.ok) {
      // Try with CORS proxy
      response = await fetch(CORS_PROXY + encodeURIComponent('https://leetcode.com/graphql'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data: LeetCodeGraphQLResponse = await response.json();
    return data.data.question;
  } catch (error) {
    console.error('Failed to fetch from API:', error);
    return null;
  }
}

// Parse examples from HTML content
function parseExamples(content: string): Array<{ input: string; output: string; explanation?: string }> {
  const examples: Array<{ input: string; output: string; explanation?: string }> = [];
  
  // Match example blocks
  const examplePattern = /<strong[^>]*>Example\s*\d*:?<\/strong>[\s\S]*?<strong>Input:<\/strong>\s*([\s\S]*?)<strong>Output:<\/strong>\s*([\s\S]*?)(?:<strong>Explanation:<\/strong>\s*([\s\S]*?))?(?=<strong[^>]*>Example|\n\n|<p><strong>Constraints)/gi;
  
  let match;
  while ((match = examplePattern.exec(content)) !== null) {
    const input = match[1]?.replace(/<[^>]+>/g, '').trim() || '';
    const output = match[2]?.replace(/<[^>]+>/g, '').trim() || '';
    const explanation = match[3]?.replace(/<[^>]+>/g, '').trim();

    if (input && output) {
      examples.push({
        input,
        output,
        explanation: explanation || undefined,
      });
    }
  }

  // Fallback: try simpler pattern
  if (examples.length === 0) {
    const simplePattern = /Input:\s*([^\n]+)\s*Output:\s*([^\n]+)(?:\s*Explanation:\s*([^\n]+))?/gi;
    while ((match = simplePattern.exec(content)) !== null) {
      examples.push({
        input: match[1].trim(),
        output: match[2].trim(),
        explanation: match[3]?.trim(),
      });
    }
  }

  return examples;
}

// Parse constraints from HTML content
function parseConstraints(content: string): string[] {
  const constraints: string[] = [];
  
  // Find constraints section
  const constraintsMatch = content.match(/<strong>Constraints:<\/strong>[\s\S]*?<ul>([\s\S]*?)<\/ul>/i);
  
  if (constraintsMatch) {
    const listContent = constraintsMatch[1];
    const itemPattern = /<li>([\s\S]*?)<\/li>/gi;
    
    let match;
    while ((match = itemPattern.exec(listContent)) !== null) {
      const constraint = match[1]
        .replace(/<code>/g, '')
        .replace(/<\/code>/g, '')
        .replace(/<[^>]+>/g, '')
        .trim();
      
      if (constraint) {
        constraints.push(constraint);
      }
    }
  }

  return constraints;
}

// Convert API response to Problem format
function convertToProblem(question: LeetCodeGraphQLResponse['data']['question']): Problem {
  const pythonSnippet = question.codeSnippets?.find(
    s => s.langSlug === 'python3' || s.langSlug === 'python'
  );

  const examples = parseExamples(question.content || '');
  const constraints = parseConstraints(question.content || '');

  // Generate test cases from examples
  const testCases = examples.map(ex => {
    // Try to parse input into JSON format
    let input = ex.input;
    
    // Convert common formats to JSON array
    // e.g., "nums = [1,2,3], target = 9" -> "[[1,2,3], 9]"
    const assignments = input.match(/(\w+)\s*=\s*([^,]+(?:,\s*(?!\w+\s*=))?)+/g);
    if (assignments) {
      const values = assignments.map(a => {
        const value = a.split('=')[1]?.trim();
        return value;
      });
      input = `[${values.join(', ')}]`;
    }

    return {
      input,
      expected: ex.output,
    };
  });

  return {
    id: parseInt(question.questionFrontendId, 10),
    slug: question.titleSlug,
    title: question.title,
    difficulty: question.difficulty as Difficulty,
    description: question.content || '',
    examples,
    constraints,
    starterCode: pythonSnippet?.code || `class Solution:\n    pass`,
    testCases,
    tags: question.topicTags?.map(t => t.name) || [],
    acceptance: Math.floor(Math.random() * 30) + 40, // Mock acceptance rate
  };
}

// Main scrape function
export async function scrapeProblem(url: string): Promise<{
  success: boolean;
  problem?: Problem;
  error?: string;
}> {
  const slug = extractSlugFromUrl(url);
  
  if (!slug) {
    return {
      success: false,
      error: 'Invalid LeetCode URL. Please use a URL like: https://leetcode.com/problems/two-sum/',
    };
  }

  try {
    const question = await fetchProblemFromAPI(slug);
    
    if (!question) {
      return {
        success: false,
        error: 'Failed to fetch problem data. The problem may not exist or there might be a network issue.',
      };
    }

    const problem = convertToProblem(question);
    
    // Save to localStorage
    addProblem(problem);

    return {
      success: true,
      problem,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Validate if a URL is a valid LeetCode problem URL
export function isValidLeetCodeUrl(url: string): boolean {
  return extractSlugFromUrl(url) !== null;
}

